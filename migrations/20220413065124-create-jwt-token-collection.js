module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [jwtToken = null] = await db
        .listCollections({ name: 'JwtToken' })
        .toArray();
      await session.withTransaction(async () => {
        if (jwtToken) {
          await db.collection('JwtToken').drop({});
        }
        await db.createCollection('JwtToken', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['token', 'user', 'hashToken', 'expiredAt'],
              properties: {
                user: {
                  bsonType: ['objectId'],
                  description: 'must be a Object',
                },
                token: {
                  bsonType: ['binData'],
                  description: 'must be a string',
                },
                hashToken: {
                  bsonType: ['string'],
                  description: 'must be a string',
                },
                createdAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
                updatedAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date',
                },
                expiredAt: {
                  bsonType: ['date'],
                  description: 'must be a date',
                },
              },
            },
          },
        });

        await db.collection('JwtToken').createIndex({ hashToken: 1 });
        await db
          .collection('JwtToken')
          .createIndex({ expiredAt: 1 }, { expireAfterSeconds: 0 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await db.collection.drop('JwtToken');
    } finally {
      await session.endSession();
    }
  },
};
