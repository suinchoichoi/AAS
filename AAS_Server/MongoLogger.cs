using MongoDB.Bson;
using MongoDB.Driver;
using System;

namespace AASProject
{
    public static class MongoLogger
    {
        private static IMongoCollection<BsonDocument>? _collection;

        public static void Init(string connectionString, string dbName, string collectionName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(dbName);
            _collection = database.GetCollection<BsonDocument>(collectionName);
        }

        /// <summary>
        /// ���� ���: ���� �̸��� ���� ���� (��: LiveSensor�� ����)
        /// </summary>
        public static void LogSensorValue(string sensorName, string value)
        {
            if (_collection == null) return;

            var doc = new BsonDocument
            {
                { "timestamp", DateTime.UtcNow },
                { "sensor", sensorName },
                { "value", value }
            };

            _collection.InsertOne(doc);
        }

        /// <summary>
        /// �������� �������(FaultPrediction)�� ���ÿ� �����ϴ� �Լ�
        /// </summary>
        public static void LogSensorWithPrediction(string vibration, string prediction)
        {
            if (_collection == null) return;

            var doc = new BsonDocument
            {
                { "timestamp", DateTime.UtcNow },
                { "vibration", vibration },
                { "faultPrediction", prediction }
            };

            _collection.InsertOne(doc);
        }
    }
}
