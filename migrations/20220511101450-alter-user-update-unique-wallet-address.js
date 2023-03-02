module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      const [user = null] = await db
        .listCollections({ name: 'User' })
        .toArray();
      if (user) {
        await session.withTransaction(async () => {
          const {
            cursor: { firstBatch: indexs },
          } = await db.command({ listIndexes: 'User' });
          const addressIdx = indexs.find((e) => e.name === 'address_1');
          if (addressIdx) {
            await db.command({ dropIndexes: 'User', index: 'address_1' });
          }
          await db.collection('User').createIndex(
            {
              address: 1,
            },
            { unique: 1 },
          );
        });
      }
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {},
};
