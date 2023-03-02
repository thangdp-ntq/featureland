module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      await session.withTransaction(async () => {
        if (rewardPool) {
          const jsonSchema = rewardPool.options.validator.$jsonSchema;
          jsonSchema.properties.totalSupply = {
            bsonType: 'string',
            description: 'must be a string',
          };
          jsonSchema.properties.total = {
            bsonType: 'string',
            description: 'must be a string',
          };
          jsonSchema.properties.availableAmount = {
            bsonType: 'string',
            description: 'must be a string',
          };

          await db.command({
            collMod: 'RewardPool',
            validator: { $jsonSchema: jsonSchema },
          });
        }
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
      await session.withTransaction(async () => {
        if (rewardPool) {
          const jsonSchema = rewardPool.options.validator.$jsonSchema;
          jsonSchema.properties.totalSupply = {
            bsonType: 'int',
            description: 'must be a int',
          };
          jsonSchema.properties.total = {
            bsonType: 'int',
            description: 'must be a int',
          };
          jsonSchema.properties.availableAmount = {
            bsonType: 'int',
            description: 'must be a int',
          };

          await db.command({
            collMod: 'RewardPool',
            validator: { $jsonSchema: jsonSchema },
          });
        }
      });
    } finally {
      await session.endSession();
    }
  },
};
