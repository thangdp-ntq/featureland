module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.createCollection('Nfts', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['NFTname'],
              properties: {
                NFTname: {
                  bsonType: 'string',
                  description: 'must be a string',
                },
                FNFTname: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                symbol: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                numberFNFT: {
                  bsonType: ['int', 'null'],
                  description: 'must be a int or null',
                },
                description: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string or null',
                },
                transactionId: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                imageURL: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                imageName: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                ipfsCid: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                deleted: {
                  bsonType: ['bool'],
                  description: 'must be a string',
                },
                status: {
                  bsonType: ['string'],
                  description: 'must be a string',
                },
                tokenId: {
                  bsonType: ['int', 'null'],
                  description: 'must be a int',
                },
                mintStatus: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                metadataUrl: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                nftAttribute1: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                nftAttribute2: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                nftAttribute3: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                nftAttribute4: {
                  bsonType: ['string', 'null'],
                  description: 'must be a string',
                },
                attributes: {
                  bsonType: ['array', 'null'],
                  description: 'must be a array or null',
                },
                createdAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date or null',
                },
                updatedAt: {
                  bsonType: ['date', 'null'],
                  description: 'must be a date or null',
                },
              },
            },
          },
        });
        await db.collection('Nfts').createIndex({
          NFTname: 1,
          tokenId: 1,
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
      await db.collection.drop('Nfts');
    } finally {
      await session.endSession();
    }
  },
};
