module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [tieringPool = null] = await db
        .listCollections({ name: 'TieringPool' })
        .toArray();
      await session.withTransaction(async () => {
        if (tieringPool) {
          await db.collection('TieringPool').drop({});
        }
        await db.createCollection('TieringPool', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['tieringPoolId'],
              properties: {
                tieringPoolId: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                poolContractAddress: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                tieringTokenAddress: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                lockDuration: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                withdrawDelayDuration: {
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
        await db.collection('TieringPool').createIndex({
          tieringPoolId: 1,
        });
        await db.collection('TieringPool').insert( 
          {
            "poolContractAddress" : "0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462",
            "lockDuration" : 1,
            "withdrawDelayDuration" : 1,
            "tieringPoolId" : 2,
            "tieringTokenAddress" : "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
         );
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await db.collection.drop('TieringPool');
    } finally {
      await session.endSession();
    }
  },
};
