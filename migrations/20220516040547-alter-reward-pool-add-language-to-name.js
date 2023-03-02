module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [rewardPool = null] = await db
        .listCollections({ name: 'RewardPool' })
        .toArray();
      const jsonSchema = rewardPool.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.name = {
          bsonType: 'object',
          properties: {
            en: {
              bsonType: 'string',
              description: 'must be a string and required',
            },
            jp: {
              bsonType: 'string',
              description: 'must be a string and required',
            },
            cn: {
              bsonType: 'string',
              description: 'must be a string and required',
            },
          },
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
                    name: {
                      en: item.name,
                      jp: item.name,
                      cn: item.name,
                    },
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
        jsonSchema.properties.name = {
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
                    name: item.name.en,
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
        await db.collection('RewardPool').bulkWrite(updateItems);
      });
    } finally {
      await session.endSession();
    }
  },
};
