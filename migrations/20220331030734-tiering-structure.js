module.exports = {
  async up(db, client) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.createCollection('TieringStructure', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['name'],
              properties: {
                name: {
                  bsonType: 'object',
                  description: 'must be a object',
                },
                stakingPeriod: {
                  bsonType: ['int'],
                  description: 'must be a int',
                },
                stakingQuantity: {
                  bsonType: ['int'],
                  description: 'must be a int',
                },
              },
            },
          },
        });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('TieringStructure').drop({});
      });
    } finally {
      await session.endSession();
    }
  },
};
