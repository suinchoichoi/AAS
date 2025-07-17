using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Opc.Ua;
using Opc.Ua.Client;
using Opc.Ua.Configuration;
using Predict_Model;

namespace AASProject
{
    public class OpcUaBridge
    {
        private Session? _session;

        // ✅ 모델 예측기
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

            var config = new ApplicationConfiguration()
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
                throw new Exception("❌ 인증서를 생성하거나 불러올 수 없습니다.");

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

            if (e.NotificationValue is MonitoredItemNotification notification)
            {
                string value = notification.Value.Value.ToString();
                Console.WriteLine($"📥 OPC UA 수신값: {value}");

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

                    var result = _trainer.Predict(new List<VibrationData> { input }).First();
                    Console.WriteLine($"🔍 추론 결과 (고장 여부): {result.PredictedLabel}");

                    var submodels = SubmodelParser.GetSubmodels();

                    // 🔁 예측 결과 갱신
                    var predSubmodel = submodels.Find(s => s.Id.Contains("Prediction"));
                    if (predSubmodel != null)
                    {
                        var prop = predSubmodel.Properties.Find(p => p.IdShort == "FaultPrediction");
                        if (prop != null)
                            prop.Value = result.PredictedLabel.ToString();
                        else
                            predSubmodel.Properties.Add(new AasXmlWriter.Property
                            {
                                IdShort = "FaultPrediction",
                                Value = result.PredictedLabel.ToString(),
                                ValueType = "xs:string"
                            });
                    }

                    // 🔁 센서값 갱신
                    var dataSubmodel = submodels.Find(s => s.Id.Contains("Data"));
                    if (dataSubmodel != null)
                    {
                        var liveProp = dataSubmodel.Properties.Find(p => p.IdShort == "LiveSensor");
                        if (liveProp != null)
                            liveProp.Value = vib.ToString();
                        else
                            dataSubmodel.Properties.Add(new AasXmlWriter.Property
                            {
                                IdShort = "LiveSensor",
                                Value = vib.ToString(),
                                ValueType = "xs:string"
                            });
                    }

                    // XML 전체 저장
                    AasXmlWriter.WriteAasXmlFile(
                        filePath: "GTSU10_with_csv_and_prediction.xml",
                        aasId: "https://acplt.org/GTSU_10",
                        globalAssetId: "http://aml.hanyang.ac.kr/GTSUTypes",
                        submodels: submodels
                    );
                }
            }
        }
    }
}
