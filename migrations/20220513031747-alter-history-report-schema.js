module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [historyReport = null] = await db
        .listCollections({ name: 'HistoryReport' })
        .toArray();
      const jsonSchema = historyReport.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        jsonSchema.properties.language = {
          bsonType: 'string',
          description: 'must be a string',
        };

        await db.command({
          collMod: 'HistoryReport',
          validator: { $jsonSchema: jsonSchema },
        });
        await db
          .collection('HistoryReport')
          .updateMany({}, { $set: { language: 'en' } });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      const [historyReport = null] = await db
        .listCollections({ name: 'HistoryReport' })
        .toArray();
      const jsonSchema = historyReport.options.validator.$jsonSchema;
      await session.withTransaction(async () => {
        delete jsonSchema.properties.language;
        await db.command({
          collMod: 'HistoryReport',
          validator: { $jsonSchema: jsonSchema },
        });
      });
    } finally {
      await session.endSession();
    }
  },
};
