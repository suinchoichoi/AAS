namespace Predict_Model
{
    public class PredictionResult
    {
        public string Time { get; set; }
        public float Vibration { get; set; }

        public bool PredictedFault { get; set; }
        public bool ActualLabel { get; set; }

    }
}