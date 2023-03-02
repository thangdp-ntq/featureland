module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      await session.withTransaction(async () => {
        if (rewardPool) {
          await db.collection('RewardPool').drop({});
        }
        await db.createCollection('RewardPool', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: [
                'name',
                'FNFTPoolId',
                'totalSupply',
                'smartContract',
                'tokenContractAddress',
                'status',
                'total',
              ],
              properties: {
                FNFTPoolId: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                totalSupply: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                smartContract: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                name: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                tokenContractAddress: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                status: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                total: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                createAt: {
                  bsonType: 'date',
                  description: 'must be a date and required',
                },
                updatedAt: {
                  bsonType: 'date',
                  description: 'must be a date and required',
                },
              },
            },
          },
        });
        await db.collection('RewardPool').createIndex({
          name: 'text',
          FNFTPoolId: 1,
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await db.collection('RewardPool').drop({});
    } finally {
      await session.endSession();
    }
  },
};
