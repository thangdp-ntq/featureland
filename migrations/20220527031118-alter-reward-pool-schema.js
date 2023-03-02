module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      const jsonSchema = rewardPool.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.poolOpenTime = {
          bsonType: 'date',
          description: 'must be a date',
        };

        await db.command({
          collMod: 'RewardPool',
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
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      const jsonSchema = rewardPool.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        delete jsonSchema.properties.poolOpenTime;
        await db.command({
          collMod: 'RewardPool',
          validator: { $jsonSchema: jsonSchema },
        });
      });
    } finally {
      await session.endSession();
    }
  },
};
