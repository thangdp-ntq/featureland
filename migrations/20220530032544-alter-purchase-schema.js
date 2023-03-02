module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {

        await db.command({
          collMod: 'PurchaseFNFT',
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              properties: {
                status: {
                  bsonType: 'int',
                  description: 'must be a number',
                },
              },
            },
          },
          validationLevel: "moderate"
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      const [purchaseFNFT = null] = await db
        .listCollections({ name: 'PurchaseFNFT' })
        .toArray();
      const jsonSchema = purchaseFNFT.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        delete jsonSchema.properties.status;
        await db.command({
          collMod: 'PurchaseFNFT',
          validator: { $jsonSchema: jsonSchema },
        });
      });
    } finally {
      await session.endSession();
    }
  },
};
