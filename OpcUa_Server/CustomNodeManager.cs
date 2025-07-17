using System;
using System.Collections.Generic;
using System.IO;
using System.Xml;
using Opc.Ua;
using Opc.Ua.Export;
using Opc.Ua.Server;

public class CustomNodeManager : CustomNodeManager2
{
    public CustomNodeManager(IServerInternal server, ApplicationConfiguration configuration, IList<string> modelPaths)
        : base(server, configuration, new string[] { "http://aml.hanyang.ac.kr/GTSUTypes" }) // 사용자 정의 네임스페이스
    {
        SystemContext.NodeIdFactory = this;
        LoadPredefinedNodes(SystemContext, modelPaths);
    }

    private void LoadPredefinedNodes(ISystemContext context, IList<string> nodeSetFiles)
    {
        foreach (var file in nodeSetFiles)
        {
            Console.WriteLine($"📄 Importing NodeSet file: {file}");

            try
            {
                using (FileStream fs = File.OpenRead(file))
                {
                    var nodeSet = UANodeSet.Read(fs); // XML 파싱
                    var predefinedNodes = new NodeStateCollection();
                    nodeSet.Import(context, predefinedNodes); // 노드 가져오기

                    // 노드 디버깅 출력 및 등록
                    foreach (var node in predefinedNodes)
                    {
                        string name = node.DisplayName?.Text ?? "(no name)";
                        //Console.WriteLine($"✅ Registering node: {name} ({node.NodeId})");
                        AddPredefinedNode(context, node);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to load NodeSet '{file}': {ex.Message}");
            }
        }
    }

    public override void CreateAddressSpace(IDictionary<NodeId, IList<IReference>> externalReferences)
    {
        var gtsuNodeId = new NodeId(5006, NamespaceIndex); // GTSU10의 NodeId: ns=2;i=5006

        if (!PredefinedNodes.TryGetValue(gtsuNodeId, out NodeState? gtsuNode))
        {
            Console.WriteLine("❌ GTSU10 노드를 PredefinedNodes에서 찾을 수 없습니다.");
            return;
        }

        // ObjectsFolder → GTSU10 연결 추가
        if (!externalReferences.TryGetValue(ObjectIds.ObjectsFolder, out var references))
        {
            references = new List<IReference>();
            externalReferences[ObjectIds.ObjectsFolder] = references;
        }

        references.Add(new NodeStateReference(ReferenceTypeIds.Organizes, false, gtsuNode.NodeId));

        Console.WriteLine("📌 GTSU10 노드를 ObjectsFolder에 수동으로 연결했습니다.");
    }

}
