module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [user = null] = await db
        .listCollections({ name: 'User' })
        .toArray();
      if (user) {
        const jsonSchema = user.options.validator.$jsonSchema;
        await session.withTransaction(async () => {
          jsonSchema.properties.role = {
            bsonType: 'int',
            description: 'must be a int',
          };

          await db.command({
            collMod: 'User',
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
      const [user = null] = await db
        .listCollections({ name: 'User' })
        .toArray();
      if (user) {
        const jsonSchema = user.options.validator.$jsonSchema;
        await session.withTransaction(async () => {
          jsonSchema.properties.role = {
            bsonType: 'string',
            description: 'must be a string or null',
          };

          await db.command({
            collMod: 'User',
            validator: { $jsonSchema: jsonSchema },
          });
        });
      }
    } finally {
      await session.endSession();
    }
  },
};
