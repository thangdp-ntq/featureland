module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [series = null] = await db
        .listCollections({ name: 'Series' })
        .toArray();
      const jsonSchema = series.options.validator.$jsonSchema;
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

        jsonSchema.properties.description = {
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

        const rw = await db.collection('Series').find().toArray();
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
                    description: {
                      en: item.description,
                      jp: item.description,
                      cn: item.description,
                    },
                  },
                },
              },
            };
          });
        }
        await db.command({
          collMod: 'Series',
          validator: { $jsonSchema: jsonSchema },
        });
        if (rw.length) {
          await db.collection('Series').bulkWrite(updateItems);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      const [series = null] = await db
        .listCollections({ name: 'Series' })
        .toArray();
      const jsonSchema = series.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.name = {
          bsonType: 'string',
          description: 'must be a string',
        };

        const rw = await db.collection('Series').find().toArray();
        let updateItems = [];
        if (rw.length) {
          updateItems = rw.map((item) => {
            return {
              updateOne: {
                filter: { _id: item._id },
                update: {
                  $set: {
                    name: item.name.en,
                    description: item.description.en,
                  },
                },
              },
            };
          });
        }
        await db.command({
          collMod: 'Series',
          validator: { $jsonSchema: jsonSchema },
        });
        await db.collection('Series').bulkWrite(updateItems);
      });
    } finally {
      await session.endSession();
    }
  },
};
