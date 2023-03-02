module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.command({
          collMod: 'FNFTPool',
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              properties: {
                acceptedCurrencyDecimals: {
                  bsonType: 'string',
                  description: 'must be string',
                },
              },
            },
          },
          validationLevel: 'moderate',
        });
        const pools = await db.collection('FNFTPool').find().toArray();
        let updateItems = [];
        if (pools.length) {
          updateItems = pools.map((item) => {
            let decimals;
            switch (item.acceptedCurrencyAddress) {
              case '0x743a09ae70d3d4e28590741507907e94c4775133':
                decimals = '18';
                break;
              case '0x70be5BCb2D5d4b397D5498022F72b2B64A762a11':
                decimals = '18';
                break;
              case '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd':
                decimals = '18';
                break;
              case '0xcbe6EdCd5adf5E3B772F1CD1ea99151B8D1084B5':
                decimals = '8';
                break;
              case '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684':
                decimals = '18';
                break;
              case '0x56EE88EB046760f268D695EFE2d94B5607207C60':
                decimals = '18';
                break;
            }
            return {
              updateOne: {
                filter: {
                  _id: item._id,
                  acceptedCurrencyDecimals: { $eq: null },
                },
                update: {
                  $set: {
                    acceptedCurrencyDecimals: decimals,
                  },
                },
              },
            };
          });
          if (pools.length) {
            await db.collection('FNFTPool').bulkWrite(updateItems);
          }
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {},
};
