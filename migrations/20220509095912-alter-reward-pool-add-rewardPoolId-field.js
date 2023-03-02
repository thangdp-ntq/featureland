module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      if (rewardPool) {
        const jsonSchema = rewardPool.options.validator.$jsonSchema;
        await session.withTransaction(async () => {
          jsonSchema.properties.rewardPoolId = {
            bsonType: ['number'],
            description: 'must be a number increment',
          };
          await db.command({
            collMod: 'RewardPool',
            validator: { $jsonSchema: jsonSchema },
          });
          await db.collection('RewardPool').createIndex({
            rewardPoolId: 1,
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
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      if (rewardPool) {
        const jsonSchema = rewardPool.options.validator.$jsonSchema;
        delete jsonSchema.properties.rewardPoolId;
        await db.command({
          collMod: 'RewardPool',
          validator: { $jsonSchema: jsonSchema },
        });
      }
    } finally {
      await session.endSession();
    }
  },
};
