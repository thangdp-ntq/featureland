module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.createCollection('HistoryReport', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['updateBy', 'historyReportUrl'],
              properties: {
                updateBy: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                historyReportUrl: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                createdAt: {
                  bsonType: 'date',
                  description: 'must be a date',
                },
                updatedAt: {
                  bsonType: 'date',
                  description: 'must be a date',
                },
              },
            },
          },
        });
        await db.collection('HistoryReport').createIndex({ createdAt: 1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await db.collection.drop('HistoryReport');
    } finally {
      await session.endSession();
    }
  },
};
