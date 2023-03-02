module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [FNFTPool = null] = await db
        .listCollections({ name: 'FNFTPool' })
        .toArray();
      if (FNFTPool) {
        const jsonSchema = FNFTPool.options.validator.$jsonSchema;
        await session.withTransaction(async () => {
          jsonSchema.properties.users = {
            bsonType: ['array', 'null'],
            items: {
              bsonType: ["object"],
              properties:{
                address: { bsonType: 'string' },
                tier: { bsonType: ['number', 'null'] },
                name: { bsonType: ['string', 'null'] },
              }
            },
            description: 'must be a array or null',
          };
          await db.command({
            collMod: 'FNFTPool',
            validator: { $jsonSchema: jsonSchema },
          });
        });
      }
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      const [FNFTPool = null] = await db
        .listCollections({ name: 'FNFTPool' })
        .toArray();
      if (FNFTPool) {
        delete jsonSchema.properties.users;
        await db.command({
          collMod: 'FNFTPool',
          validator: { $jsonSchema: jsonSchema },
        });
      }
    } finally {
      await session.endSession();
    }
  },
};
