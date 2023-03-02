module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [labelNFT = null] = await db
        .listCollections({ name: 'LabelNFT' })
        .toArray();
      const jsonSchema = labelNFT.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.label = {
          bsonType: 'object',
          description: 'must be a object',
        };

        await db.command({
          collMod: 'LabelNFT',
          validator: { $jsonSchema: jsonSchema },
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      const [labelNFT = null] = await db
        .listCollections({ name: 'LabelNFT' })
        .toArray();
      const jsonSchema = labelNFT.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.label = {
          bsonType: 'string',
          description: 'must be a object',
        };
        await db.command({
          collMod: 'LabelNFT',
          validator: { $jsonSchema: jsonSchema },
        });
      });
    } finally {
      await session.endSession();
    }
  },
};
