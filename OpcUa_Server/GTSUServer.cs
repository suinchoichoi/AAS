using System;
using System.Collections.Generic;
using System.IO;
using Opc.Ua;
using Opc.Ua.Server;

public class GTSUServer : StandardServer
{
    protected override ServerProperties LoadServerProperties()
    {
        return new ServerProperties
        {
            ManufacturerName = "AML",
            ProductName = "GSTUOpcUaServer",
            ProductUri = "urn:AML:GTSUOpcUaServer",
            SoftwareVersion = "1.0.0",
            BuildNumber = "1",
            BuildDate = DateTime.UtcNow
        };
    }

    protected override MasterNodeManager CreateMasterNodeManager(IServerInternal server, ApplicationConfiguration configuration)
    {
        Console.WriteLine("🔄 Loading GTSU XML model...");

        // XML 파일 경로 설정 (반드시 복사하거나 이동해 둘 것)
        var modelPaths = new List<string>
        {
            Path.Combine(AppContext.BaseDirectory, "Opc.Ua.NodeSet2.xml"),     // ← 먼저 로드
            Path.Combine(AppContext.BaseDirectory, "gtsu_v3.2.1.xml")          // ← 그다음에 사용자 모델
        };

        var nodeManagers = new List<INodeManager>
        {
            new CustomNodeManager(server, configuration, modelPaths)
        };

        return new MasterNodeManager(server, configuration, null, nodeManagers.ToArray());
    }
}
