module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.command({
          collMod: 'Nfts',
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              properties: {
                hasFNFTPool: {
                  bsonType: 'bool',
                  description: 'must be boolean',
                },
              },
            },
          },
          validationLevel: "moderate"
        });
        const nfts = await db.collection('Nfts').find().toArray();
        let updateItems = [];
        if (nfts.length) {
          updateItems = await Promise.all(nfts.map(async (item) => {
            fNFTPool = await db.collection('FNFTPool').find({"fNFT.nftId": item.tokenId}).toArray();
            hasFNFTPool = fNFTPool.length > 0 ? true : false;
              return {
                updateOne: {
                  filter: { tokenId: item.tokenId },
                  update: {
                    $set: {
                      hasFNFTPool: hasFNFTPool,
                    },
                  },
                },
              };
          }));
        }
        if (nfts.length) {
          await db.collection('Nfts').bulkWrite(updateItems);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    
  },
};
