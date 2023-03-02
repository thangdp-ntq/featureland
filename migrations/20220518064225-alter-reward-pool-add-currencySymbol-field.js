module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      const jsonSchema = rewardPool.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.currencySymbol = {
          bsonType: 'string',
          description: 'must be a string',
        };

        const rw = await db.collection('RewardPool').find().toArray();
        let updateItems = [];
        if (rw.length) {
          updateItems = rw.map((item) => {
            return {
              updateOne: {
                filter: { _id: item._id },
                update: {
                  $set: {
                    currencySymbol: 'USDT',
                  },
                },
              },
            };
          });
        }
        await db.command({
          collMod: 'RewardPool',
          validator: { $jsonSchema: jsonSchema },
        });
        if (rw.length) {
          await db.collection('RewardPool').bulkWrite(updateItems);
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
      const jsonSchema = rewardPool.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        delete jsonSchema.properties.currencySymbol;
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
