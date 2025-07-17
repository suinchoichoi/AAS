using CsvHelper.Configuration.Attributes;

namespace Predict_Model
{
    public class VibrationData
    {
        public string Time { get; set; }
        public float Vibration { get; set; }

        [Optional]
        public bool Label { get; set; }

        [Ignore]
        public float VibrationDiff { get; set; }

        [Ignore]
        public float VibrationRollMean { get; set; }

        [Ignore]
        public float VibrationRollStd { get; set; }

        [Ignore] 
        public float Weight { get; set; } = 1f;  
    }
}
