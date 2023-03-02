module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.createCollection('Timeline', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['description','step'],
              properties: {
                description: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                step: {
                  bsonType: ['int'],
                  description: 'must be a int and required',
                }
              },
            },
          },
        });
        await db.collection('Timeline').createIndex({
          step: 1,
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await db.collection.drop('Timeline');
    } finally {
      await session.endSession();
    }
  },
};
