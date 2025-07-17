using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Net.Http; // ✅ 1. 추가된 using 문
using System.Text;     // ✅ 1. 추가된 using 문
using Opc.Ua;
using Opc.Ua.Client;
using Opc.Ua.Configuration;
using Predict_Model;

namespace AASProject
{
    public class OpcUaBridge
    {
        private static readonly HttpClient client = new HttpClient(); // ✅ 2. HttpClient 객체 추가
        private Session? _session;
        private ModelPredictor _trainer = new ModelPredictor();
        private bool _modelLoaded = false;

        public async Task StartAsync()
        {
            string endpointURL = "opc.tcp://localhost:4841/GTSUOpcUaServer/";
            ushort namespaceIndex = 2;
            uint nodeId = 6143;

            Directory.CreateDirectory("Certificates/MachineDefault/certs");
            Directory.CreateDirectory("Certificates/TrustedPeers");
            Directory.CreateDirectory("Certificates/RejectedCertificates");

            var config = new ApplicationConfiguration
            {
                ApplicationName = "GTSUClient",
                ApplicationType = ApplicationType.Client,
                SecurityConfiguration = new SecurityConfiguration
                {
                    ApplicationCertificate = new CertificateIdentifier
                    {
                        StoreType = "Directory",
                        StorePath = "Certificates/MachineDefault",
                        SubjectName = "CN=GTSUClient"
                    },
                    TrustedPeerCertificates = new CertificateTrustList
                    {
                        StoreType = "Directory",
                        StorePath = "Certificates/TrustedPeers"
                    },
                    RejectedCertificateStore = new CertificateTrustList
                    {
                        StoreType = "Directory",
                        StorePath = "Certificates/RejectedCertificates"
                    },
                    AutoAcceptUntrustedCertificates = true,
                    RejectSHA1SignedCertificates = false,
                    AddAppCertToTrustedStore = true
                },
                TransportConfigurations = new TransportConfigurationCollection(),
                TransportQuotas = new TransportQuotas { OperationTimeout = 15000 },
                ClientConfiguration = new ClientConfiguration { DefaultSessionTimeout = 60000 }
            };

            await config.Validate(ApplicationType.Client);

            var app = new ApplicationInstance
            {
                ApplicationName = "GTSUClient",
                ApplicationType = ApplicationType.Client,
                ApplicationConfiguration = config
            };

#pragma warning disable CS0618
            bool certOk = await app.CheckApplicationInstanceCertificate(false, 0);
#pragma warning restore CS0618
            if (!certOk)
                throw new Exception("❌ 인증서 생성 실패");

            var endpoint = CoreClientUtils.SelectEndpoint(config, endpointURL, useSecurity: true);
            var configuredEndpoint = new ConfiguredEndpoint(null, endpoint, EndpointConfiguration.Create(config));

            _session = await Session.Create(config, configuredEndpoint, false, "GTSUClient", 60000, null, null);

            var subscription = new Subscription(_session.DefaultSubscription)
            {
                PublishingInterval = 1000
            };

            var item = new MonitoredItem(subscription.DefaultItem)
            {
                DisplayName = "LiveSensor",
                StartNodeId = new NodeId(nodeId, namespaceIndex),
                AttributeId = Attributes.Value,
                SamplingInterval = 1000
            };

            item.Notification += OnValueChanged;

            subscription.AddItem(item);
            _session.AddSubscription(subscription);
            subscription.Create();

            Console.WriteLine("📡 OPC UA 구독 시작 (ns=2;i=6143)");
        }

        private void OnValueChanged(MonitoredItem item, MonitoredItemNotificationEventArgs e)
        {
            if (e.NotificationValue is MonitoredItemNotification notification)
            {
                var value = notification.Value.Value?.ToString();
                if (string.IsNullOrEmpty(value)) return;

                Console.WriteLine($"📥 OPC UA 수신값: {value}");

                if (!_modelLoaded)
                {
                    try
                    {
                        _trainer.LoadModel("model.zip");
                        _modelLoaded = true;
                        Console.WriteLine("✅ model.zip 로드 완료");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ 모델 로딩 실패: {ex.Message}");
                        return;
                    }
                }

                if (float.TryParse(value, out float vib))
                {
                    var input = new VibrationData
                    {
                        Time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                        Vibration = vib,
                        VibrationDiff = 0,
                        VibrationRollMean = vib,
                        VibrationRollStd = 0
                    };

                    var result = _trainer.Predict(new[] { input }.ToList()).First();
                    var prediction = result.PredictedLabel.ToString();

                    Console.WriteLine($"🔍 예측 결과: {prediction}");
                    
                    // ✅ 3. BaSyx 서버로 실시간 데이터 전송 호출
                    // GetAwaiter().GetResult()는 동기 메서드에서 비동기 메서드를 호출하기 위한 간단한 방법입니다.
                    UpdateBasyxServerAsync(vib.ToString(), prediction).GetAwaiter().GetResult();


                    // 아래 부분은 이제 BaSyx 서버와 실시간 연동에는 필수가 아닙니다.
                    // 로컬에 로그를 남기는 용도로 유지하거나 삭제해도 됩니다.
                    MongoLogger.LogSensorWithPrediction(vib.ToString(), prediction);
                    var submodels = SubmodelParser.GetSubmodels();
                    if (submodels == null) return;
                    var dataSubmodel = submodels.Find(s => s.Id.Contains("Data"));
                    if (dataSubmodel != null)
                    {
                        var liveProp = dataSubmodel.Properties.Find(p => p.IdShort == "LiveSensor");
                        if (liveProp != null) liveProp.Value = vib.ToString();
                    }
                    var predSubmodel = submodels.Find(s => s.Id.Contains("Prediction"));
                    if (predSubmodel != null)
                    {
                        var predProp = predSubmodel.Properties.Find(p => p.IdShort == "FaultPrediction");
                        if (predProp != null) predProp.Value = prediction;
                    }
                    AasXmlWriter.WriteAasXmlFile(
                        filePath: "GTSU10_with_csv_and_prediction.xml",
                        aasId: "https://acplt.org/GTSU_10",
                        globalAssetId: "http://aml.hanyang.ac.kr/GTSUTypes",
                        submodels: submodels
                    );
                }
            }
        }

        // ✅ 4. BaSyx 서버와 통신하는 새로운 메서드
        private async Task UpdateBasyxServerAsync(string liveSensorValue, string predictionResult)
        {
            try
            {
                // FaultPrediction 값 업데이트
                string predictionSubmodelId = "aHR0cHM6Ly9hY3BsdC5vcmcvR1RTVV8xMC9QcmVkaWN0aW9u";
                string predictionApiUrl = $"http://localhost:8081/submodels/{predictionSubmodelId}/submodel-elements/FaultPrediction/value";
                var predictionContent = new StringContent($"\"{predictionResult.ToLower()}\"", Encoding.UTF8, "application/json");
                await client.PutAsync(predictionApiUrl, predictionContent);

                // LiveSensor 값 업데이트
                string dataSubmodelId = "aHR0cHM6Ly9hY3BsdC5vcmcvR1RTVV8xMC9EYXRh";
                string sensorApiUrl = $"http://localhost:8081/submodels/{dataSubmodelId}/submodel-elements/LiveSensor/value";
                var sensorContent = new StringContent($"\"{liveSensorValue}\"", Encoding.UTF8, "application/json");
                await client.PutAsync(sensorApiUrl, sensorContent);

                Console.WriteLine("✅ Successfully updated values to BaSyx server.");
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"❌ Error updating BaSyx server: {e.Message}");
            }
        }
    }
}