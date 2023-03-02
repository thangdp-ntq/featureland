module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await db.collection('FNFTPool').dropIndex('name_text_FNFTPoolId_1');
      await db.collection('FNFTPool').createIndex({
        name: 'text',
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {},
};
