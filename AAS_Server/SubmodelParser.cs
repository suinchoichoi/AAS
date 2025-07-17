using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AASProject
{
    public static class SubmodelParser
    {
        private static List<AasXmlWriter.Submodel> _submodels = new List<AasXmlWriter.Submodel>();

        public static void ParseTxtFileAndCreateSubmodels(string txtFile)
        {
            var submodelIdentifiers = new Dictionary<string, string>
            {
                { "MachineryIdentification", "https://acplt.org/GTSU_10/MachineryIdentification" },
                { "MachinerySpecification",  "https://acplt.org/GTSU_10/MachinerySpecification" },
                { "MachineryOperationMode",  "https://acplt.org/GTSU_10/MachineryOperationMode" },
                { "MachineryState",          "https://acplt.org/GTSU_10/MachineryState" },
                { "Data",                    "https://acplt.org/GTSU_10/Data" },
                { "Prediction",              "https://acplt.org/GTSU_10/Prediction" }
            };

            _submodels.Clear();
            foreach (var kvp in submodelIdentifiers)
            {
                _submodels.Add(new AasXmlWriter.Submodel
                {
                    Id = kvp.Value,
                    Properties = new List<AasXmlWriter.Property>()
                });
            }

            Console.WriteLine($"[SubmodelParser] Loading data from {txtFile}...");
            if (!File.Exists(txtFile))
            {
                Console.WriteLine($"[SubmodelParser] File not found: {txtFile}");
                return;
            }

            using (StreamReader reader = new StreamReader(txtFile))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    var parts = line.Split(',');
                    if (parts.Length < 3) continue;

                    string submodelKey = parts[0].Trim();
                    string idShort     = parts[1].Trim();
                    string value       = parts[2].Trim();

                    var sm = _submodels.Find(s => s.Id == submodelIdentifiers[submodelKey]);
                    if (sm != null)
                    {
                        sm.Properties.Add(new AasXmlWriter.Property
                        {
                            IdShort = idShort,
                            Value = value,
                            ValueType = "xs:string"
                        });
                        Console.WriteLine($"[SubmodelParser] Added property '{idShort}' = '{value}' to {submodelKey}");
                    }
                }
            }

            // .pk 파일 추가
            string pkFilePath = @"C:\Users\suin\Desktop\OPCUA_GTSU\AAS_Server_MongoDB\predictive_model.pk";
            
            if (File.Exists(pkFilePath))
            {
                var predictionSubmodel = _submodels.Find(s => s.Id == submodelIdentifiers["Prediction"]);
                if (predictionSubmodel != null)
                {
                    predictionSubmodel.Properties.Add(new AasXmlWriter.Property
                    {
                        IdShort = "PredictionModel",
                        Value = pkFilePath,
                        ValueType = "xs:string"
                    });
                    Console.WriteLine(".pk 파일을 Prediction 서브모델에 추가했습니다.");
                }
            }
            else
            {
                Console.WriteLine($".pk 파일을 찾을 수 없습니다: {pkFilePath}");
            }

            // XML 파일로 저장
            Console.WriteLine("[SubmodelParser] Writing AAS XML file...");
            AasXmlWriter.WriteAasXmlFile(
                filePath: "GTSU10_with_csv_and_prediction.xml",
                aasId: "https://acplt.org/GTSU_10",
                globalAssetId: "http://aml.hanyang.ac.kr/GTSUTypes",
                submodels: _submodels
            );
        }

        public static List<AasXmlWriter.Submodel> GetSubmodels()
        {
            return _submodels;
        }
    }
}
