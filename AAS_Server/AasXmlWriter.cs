using System;
using System.Collections.Generic;
using System.Xml.Linq;

namespace AASProject
{
    // AAS XML Namespace
    // 원본 BaSyx XML 스키마와 동일하게 구성
    public static class AasXmlWriter
    {
        private static readonly XNamespace AAS_NS = "https://admin-shell.io/aas/3/0";
        private static readonly XNamespace XS_NS = "http://www.w3.org/2001/XMLSchema";

        // 서브모델 구조 정의
        public class Submodel
        {
            public string Id { get; set; } = "";
            public List<Property> Properties { get; set; } = new List<Property>();
        }

        public class Property
        {
            public string IdShort { get; set; } = "";
            public string Value { get; set; } = "";
            public string ValueType { get; set; } = "xs:string"; // 기본값
        }

        /// <summary>
        /// BaSyx 형식의 AAS XML을 작성하는 함수
        /// </summary>
        /// <param name="filePath">생성할 XML 파일 경로</param>
        /// <param name="aasId">예: https://acplt.org/GTSU_10</param>
        /// <param name="globalAssetId">예: http://aml.hanyang.ac.kr/GTSUTypes</param>
        /// <param name="submodels">여러 Submodel 목록</param>
        public static void WriteAasXmlFile(
            string filePath,
            string aasId,
            string globalAssetId,
            List<Submodel> submodels
        )
        {
            // (1) 루트 요소: <aas:environment>
            var environmentElem = new XElement(AAS_NS + "environment",
                new XAttribute(XNamespace.Xmlns + "aas", AAS_NS),
                new XAttribute(XNamespace.Xmlns + "xs", XS_NS)
            );

            // (2) <aas:assetAdministrationShells>
            var shellsElem = new XElement(AAS_NS + "assetAdministrationShells");

            //   (2-1) <aas:assetAdministrationShell>
            var shellElem = new XElement(AAS_NS + "assetAdministrationShell",
                new XElement(AAS_NS + "id", aasId),
                new XElement(AAS_NS + "assetInformation",
                    new XElement(AAS_NS + "assetKind", "Instance"),
                    new XElement(AAS_NS + "globalAssetId", globalAssetId)
                )
            );

            //   (2-2) <aas:submodels> 내부에 submodel reference들
            var shellSubmodelsElem = new XElement(AAS_NS + "submodels");
            foreach (var sm in submodels)
            {
                // 예: <aas:reference><aas:keys><aas:key>...</aas:key></aas:keys></aas:reference>
                var refElem = new XElement(AAS_NS + "reference",
                    new XElement(AAS_NS + "type", "ModelReference"),
                    new XElement(AAS_NS + "keys",
                        new XElement(AAS_NS + "key",
                            new XElement(AAS_NS + "type", "Submodel"),
                            new XElement(AAS_NS + "value", sm.Id)
                        )
                    )
                );
                shellSubmodelsElem.Add(refElem);
            }
            shellElem.Add(shellSubmodelsElem);
            shellsElem.Add(shellElem);
            environmentElem.Add(shellsElem);

            // (3) <aas:submodels> 섹션
            var submodelsRootElem = new XElement(AAS_NS + "submodels");
            foreach (var sm in submodels)
            {
                var smElem = new XElement(AAS_NS + "submodel",
                    new XElement(AAS_NS + "id", sm.Id),
                    new XElement(AAS_NS + "kind", "Instance")
                );

                var elementsElem = new XElement(AAS_NS + "submodelElements");
                foreach (var prop in sm.Properties)
                {
                    var propElem = new XElement(AAS_NS + "property",
                        new XElement(AAS_NS + "idShort", prop.IdShort),
                        new XElement(AAS_NS + "valueType", prop.ValueType),
                        new XElement(AAS_NS + "value", prop.Value)
                    );
                    elementsElem.Add(propElem);
                }
                smElem.Add(elementsElem);
                submodelsRootElem.Add(smElem);
            }
            environmentElem.Add(submodelsRootElem);

            // (4) XML 저장
            var doc = new XDocument(new XDeclaration("1.0", "utf-8", null), environmentElem);
            doc.Save(filePath);
            Console.WriteLine($"{filePath} has been created with BaSyx-like AAS structure.");
        }
    }
}
