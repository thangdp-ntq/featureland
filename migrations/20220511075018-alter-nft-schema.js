module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [transaction = null] = await db.listCollections({ name: 'Nfts' }).toArray();
      const jsonSchema = transaction.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.description = {
          bsonType: 'object',
          description: 'must be a object'
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
        jsonSchema.properties.description = {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
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