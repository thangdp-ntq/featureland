module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [FNFTPool = null] = await db
        .listCollections({ name: 'FNFTPool' })
        .toArray();
      await session.withTransaction(async () => {
        if (FNFTPool) {
          await db.collection('FNFTPool').drop({});
        }
        await db.createCollection('FNFTPool', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: [
                'poolName',
                'poolImage',
                'blockchainNetwork',
                'acceptedCurrencyAddress',
                'receiveWalletAddress',
                'poolId',
              ],
              properties: {
                poolName: {
                  bsonType: 'object',
                  description: 'must be a object and required',
                },
                poolImage: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                poolDescription: {
                  bsonType: ['object', 'null'],
                  description: 'must be a object and required',
                },
                status: {
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                seriesId: {
                  bsonType: ['objectId', 'null'],
                  description: 'must be a objectId or null',
                },
                blockchainNetwork: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                acceptedCurrencyAddress: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                acceptedCurrencySymbol: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                acceptedCurrencyDecimals: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                receiveWalletAddress: {
                  bsonType: 'string',
                  description: 'must be a string and required',
                },
                registrationStartTime: {
                  bsonType: 'date',
                  description: 'must be a date and required',
                },
                registrationEndTime: {
                  bsonType: 'date',
                  description: 'must be a date and required',
                },
                purchaseStartTime: {
                  bsonType: 'date',
                  description: 'must be a date and required',
                },
                purchaseEndTime: {
                  bsonType: 'date',
                  description: 'must be a date and required',
                },
                fNFT: {
                  bsonType: 'object',
                  description: 'must be a object and required',
                },
                step:{
                  bsonType: 'int',
                  description: 'must be a int and required',
                },
                allocationSettings:{
                  bsonType: 'array',
                  description: 'must be a array and required',
                },
                poolType:{
                  bsonType:'int',
                  description:'must be a int and required'
                },
                whitelistURL:{
                  bsonType: ['string', 'null'],
                  description:'must be a string and null'
                },
                poolId:{
                  bsonType: 'int',
                  description:'must be a int and required'
                },
                pathId:{
                  bsonType: ['objectId', 'null'],
                  description:'must be a objectId and null'
                },
                createdAt: {
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
        await db.collection('FNFTPool').createIndex({
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
      await db.collection('FNFTPool').drop({});
    } finally {
      await session.endSession();
    }
  },
};
