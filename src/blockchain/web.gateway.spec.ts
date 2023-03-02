import 'dotenv/config';
import { Web3Gateway } from './web3.gateway';

describe('NftsService', () => {
  const chain = {
    name: 'Binance Smart Chain',
    chainId: 97,
    rpcUrl: [
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'https://data-seed-prebsc-2-s1.binance.org:8545/',
    ],
    address: '0x54B1E639C454CaE78b173CCA211f4B0EfA360fD2',
  };
  let web3Gateway: Web3Gateway;

  beforeEach(async () => {
    web3Gateway = new Web3Gateway(chain.chainId);
  });

  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    done();
  });

  it('sign sucess', async () => {
    const sign = await web3Gateway.sign(['data']);
    const address = await web3Gateway.recover(['data'], sign);
    expect(address).toMatch(chain.address);
  });

  it('sign fail: empty data sign', async () => {
    try {
      await web3Gateway.sign([]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('recover fail: wrong data sign', async () => {
    const sign = await web3Gateway.sign(['data-1']);
    const address = await web3Gateway.recover(['data-2'], sign);
    expect(address).not.toMatch(chain.address);
  });

  it('recover fail: wrong signature', async () => {
    await web3Gateway.sign(['data']);
    const address = await web3Gateway.recover(
      ['data'],
      '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c',
    );
    expect(address).not.toMatch(chain.address);
  });
});
