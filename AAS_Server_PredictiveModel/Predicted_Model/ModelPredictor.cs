using Microsoft.ML;
using Microsoft.ML.Data;  // 🔥 이 줄이 꼭 필요
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;


namespace Predict_Model
{
    public class PredictionOutput
    {
        [ColumnName("PredictedLabel")]
        public bool PredictedLabel { get; set; }
    }

    public class ModelPredictor
    {
        private readonly MLContext mlContext;
        private ITransformer model;

        public ModelPredictor()
        {
            mlContext = new MLContext();
        }

        // 모델 로딩
        public void LoadModel(string modelPath)
        {
            using var stream = new FileStream(modelPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            model = mlContext.Model.Load(stream, out _);
            Console.WriteLine($"✅ 모델 로드 완료: {modelPath}");
        }

        // 예측 실행
        public List<PredictionOutput> Predict(List<VibrationData> inputData)
        {
            var dataView = mlContext.Data.LoadFromEnumerable(inputData);
            var predictions = model.Transform(dataView);
            return mlContext.Data.CreateEnumerable<PredictionOutput>(predictions, reuseRowObject: false).ToList();
        }
    }
}
