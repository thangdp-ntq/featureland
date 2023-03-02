module.exports = {
  async up(db, client) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.createCollection('User', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['address'],
              properties: {
                address: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                role: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                status: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                username: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                lastLoginAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
                createdAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
                updatedAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
                deletedAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
              },
            },
          },
        });
        await db.collection('User').createIndex({
          address: 1,
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
        await db.collection('User').drop({});
      });
    } finally {
      await session.endSession();
    }
  },
};
