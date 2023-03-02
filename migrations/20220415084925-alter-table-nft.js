module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [transaction = null] = await db.listCollections({ name: 'Nfts' }).toArray();
      const jsonSchema = transaction.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.numberFNFT = {
          bsonType: 'string',
          description: 'must be a string'
        };

        await db.command({
          collMod: 'Nfts',
          validator: { $jsonSchema: jsonSchema }
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      const [transaction = null] = await db.listCollections({ name: 'Nfts' }).toArray();
      const jsonSchema = transaction.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.numberFNFT = {
          bsonType: 'int',
          description: 'must be a int or null'
        };

        await db.command({
          collMod: 'Nfts',
          validator: { $jsonSchema: jsonSchema }
        });
      });
    } finally {
      await session.endSession();
    }
  }
};