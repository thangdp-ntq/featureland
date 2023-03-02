module.exports = {
  async up(db, client) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.createCollection('PurchaseFNFT', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              properties: {
                userWalletAddress: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                poolId: {
                  bsonType: ['int'],
                  description: 'must be a int',
                },
                poolName: {
                  bsonType: ['string'],
                  description: 'must be a string',
                },
                amount: {
                  bsonType: ['string'],
                  description: 'must be a string',
                },
                signature: {
                  bsonType: ['string'],
                  description: 'must be a string',
                },
              },
            },
          },
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
        await db.collection('PurchaseFNFT').drop({});
      });
    } finally {
      await session.endSession();
    }
  }
};
