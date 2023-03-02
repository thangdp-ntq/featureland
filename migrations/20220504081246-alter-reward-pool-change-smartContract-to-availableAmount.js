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
          jsonSchema.required = [
            'name',
            'FNFTPoolId',
            'totalSupply',
            // 'smartContract',
            'availableAmount',
            'tokenContractAddress',
            'status',
            'total',
          ];
          delete jsonSchema.properties.smartContract;
          jsonSchema.properties.availableAmount = {
            bsonType: 'string',
            description: 'must be a string and required',
          };

          await db.command({
            collMod: 'RewardPool',
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
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      if (rewardPool) {
        const jsonSchema = rewardPool.options.validator.$jsonSchema;
        await session.withTransaction(async () => {
          jsonSchema.required = [
            'name',
            'FNFTPoolId',
            'totalSupply',
            'smartContract',
            'tokenContractAddress',
            'status',
            'total',
          ];

          delete jsonSchema.properties.availableAmount;
          jsonSchema.properties.smartContract = {
            bsonType: 'string',
            description: 'must be a string and required',
          };

          await db.command({
            collMod: 'RewardPool',
            validator: { $jsonSchema: jsonSchema },
          });
        });
      }
    } finally {
      await session.endSession();
    }
  },
};
