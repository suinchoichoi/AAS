using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CsvHelper;
using Opc.Ua;
using Opc.Ua.Server;

public class CsvValueWriter
{
    private readonly IServerInternal _server;
    private readonly ushort _namespaceIndex;
    private readonly uint _nodeId;
    private readonly string _csvPath;
    private List<double> _values;

    public CsvValueWriter(IServerInternal server, ushort namespaceIndex, uint nodeId, string csvPath)
    {
        _server = server;
        _namespaceIndex = namespaceIndex;
        _nodeId = nodeId;
        _csvPath = csvPath;
        _values = new List<double>();
    }

    public void LoadCsv()
    {
        Console.WriteLine($"📥 Reading CSV: {_csvPath}");
        using var reader = new StreamReader(_csvPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        var records = csv.GetRecords<dynamic>().ToList();

        foreach (var record in records)
        {
            var dict = record as IDictionary<string, object>;
            if (dict != null && dict.ContainsKey("vibration"))
            {
                if (double.TryParse(dict["vibration"].ToString(), out double value))
                {
                    _values.Add(value);
                }
            }
        }

        Console.WriteLine($"✅ Loaded {_values.Count} vibration values from CSV.");
    }

    public async Task StartWritingAsync(CancellationToken cancellationToken)
    {
        int index = 0;
        while (!cancellationToken.IsCancellationRequested && index < _values.Count)
        {
            double value = _values[index++];
            WriteValueToNode(value);
            await Task.Delay(1000, cancellationToken);
        }
    }

    private void WriteValueToNode(double value)
    {
        var master = _server.NodeManager as MasterNodeManager;

        // CustomNodeManager 가져오기
        var custom = master?.NodeManagers.OfType<CustomNodeManager>().FirstOrDefault();

        if (custom == null)
        {
            Console.WriteLine("⚠️ CustomNodeManager not found.");
            return;
        }

        var node = custom.FindPredefinedNode(new NodeId(_nodeId, _namespaceIndex), typeof(BaseDataVariableState)) as BaseDataVariableState;

        if (node != null)
        {
            node.Value = value;
            node.Timestamp = DateTime.UtcNow;
            node.ClearChangeMasks(_server.DefaultSystemContext, false);
            Console.WriteLine($"📤 Wrote value {value} to node ns={_namespaceIndex};i={_nodeId}");
        }
        else
        {
            Console.WriteLine("⚠️ Target node not found.");
        }
    }
}
