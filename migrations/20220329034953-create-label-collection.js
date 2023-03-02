module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.createCollection('LabelNFT', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['label','type','index'],
              properties: {
                label: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                type: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                index: {
                  bsonType: 'int',
                  description: 'must be a int',
                },
              },
            },
          },
        });
        await db.collection('LabelNFT').createIndex({ index : 1 }, { unique: true });
        await db.collection('LabelNFT').insertMany( [
          { label: "seedDiameter1", type: "string" ,index :1 },
          { label: "seedCircumference", type: 'string' ,index :2 },
          { label: "batchId", type: 'string' ,index :3 },
          { label: "seedBatchDate", type: 'string' ,index :4 },
       ] );
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await db.collection.drop('LabelNFT');
    } finally {
      await session.endSession();
    }
  },
};
