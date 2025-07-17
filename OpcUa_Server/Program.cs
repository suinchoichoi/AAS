using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Opc.Ua;
using Opc.Ua.Configuration;
using Opc.Ua.Server;

class Program
{
    static async Task Main(string[] args)
    {
        // Application 구성
        var application = new ApplicationInstance
        {
            ApplicationName = "GTSUOpcUaServer",
            ApplicationType = ApplicationType.Server,
            ConfigSectionName = "GTSUOpcUaServer"
        };

        // Config 파일 없이 코드로 직접 구성 (또는 LoadApplicationConfiguration 사용 가능)
        var config = new ApplicationConfiguration()
        {
            ApplicationName = "GTSUOpcUaServer",
            ApplicationUri = "urn:localhost:GTSUOpcUaServer",
            ApplicationType = ApplicationType.Server,
            SecurityConfiguration = new SecurityConfiguration
            {
                ApplicationCertificate = new CertificateIdentifier
                {
                    StoreType = "Directory",
                    StorePath = "Certificates",
                    SubjectName = "CN=GTSUOpcUaServer"
                },
                AutoAcceptUntrustedCertificates = true,
                AddAppCertToTrustedStore = true,
                RejectSHA1SignedCertificates = false
            },
            TransportConfigurations = new TransportConfigurationCollection(),
            TransportQuotas = new TransportQuotas { OperationTimeout = 15000 },
            ServerConfiguration = new ServerConfiguration
            {
                BaseAddresses = new StringCollection { "opc.tcp://localhost:4841/GTSUOpcUaServer/" }
            },
            DisableHiResClock = false
        };

        await config.Validate(ApplicationType.Server);
        application.ApplicationConfiguration = config;

#pragma warning disable CS0618
        bool certOK = await application.CheckApplicationInstanceCertificate(false, 0);
#pragma warning restore CS0618
        if (!certOK)
        {
            throw new Exception("❌ 인증서가 없습니다.");
        }

        var server = new GTSUServer();
        await application.Start(server);

        Console.WriteLine("✅ OPC UA Server is running at opc.tcp://localhost:4841/GTSUOpcUaServer/");
        Console.WriteLine("⏳ Press Ctrl+C to exit...");

        // ✅ CSV 값 주기적 전송 클래스 실행
        var writer = new CsvValueWriter(server.CurrentInstance, 2, 6143, @"18.5v_test.csv");
        writer.LoadCsv();

        var cts = new CancellationTokenSource();
        _ = writer.StartWritingAsync(cts.Token); // 비동기 백그라운드 실행

        await Task.Delay(-1); // 서버 계속 유지
    }
}
