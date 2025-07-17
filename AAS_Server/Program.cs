using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace AASProject
{
    class Program
    {
        static async Task Main(string[] args)
        {
            // AAS 구조 초기화
            SubmodelParser.ParseTxtFileAndCreateSubmodels("GTSU10_Submodel.txt");

            //MongoDB 로깅 초기화 추가
            MongoLogger.Init(
                connectionString: "mongodb://localhost:27017",
                dbName: "GTSUData",
                collectionName: "SensorLogs"
            );

        
            // OPC UA → AAS 연동 시작
            var bridge = new OpcUaBridge();
            await bridge.StartAsync();  // ✅ 비동기 실행

            // AAS 웹 서버 시작
            string localIP = GetLocalIPAddress();
            string url = $"http://{localIP}:8000";
            Console.WriteLine($"🌐 AAS Server: {url}");

            var host = Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseUrls(url);
                })
                .Build();

            await host.RunAsync();
        }

        static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    return ip.ToString();
            }
            return "127.0.0.1";
        }
    }
}


