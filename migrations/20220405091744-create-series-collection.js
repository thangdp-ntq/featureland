module.exports = {
  async up(db, client) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.createCollection('Series', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['name'],
              properties: {
                name: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                description: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string and required',
                },
                status: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                createdAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
                updatedAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
              },
            },
          },
        });
        await db.collection('Series').createIndex({
          name: 'text',
          status: 1,
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('Series').drop({});
      });
    } finally {
      await session.endSession();
    }
  },
};
