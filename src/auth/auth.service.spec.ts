import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import 'dotenv/config';

describe('AuthService', () => {
  let jwtService: JwtService;
  let service: AuthService;

  beforeEach(async () => {
    jwtService = new JwtService(null);
    service = new AuthService(jwtService);
  });

  it('login success', async () => {
    jest.spyOn(jwtService, 'sign').mockImplementation(() => 'jwtToken');
    const user = await service.login({
      address: '0x54B1E639C454CaE78b173CCA211f4B0EfA360fD2',
      signature:
        '0x42792a9e93631016b4b731ea6782fb4889bf78d1f266865e410b767b722d56d43462f411b048f55ddc6447f81d537d6eb9ccf7b6a0f690d6fd1e8610bc733e481b',
    });
    expect(user).toBeTruthy();
  });

  it('login fail: signature/address wrong', async () => {
    try {
      await service.login({
        address: '0x0089363CE91e04989a121BC04D11C3C42fD1c9f6',
        signature:
          '0x5c62d956c6bb2cd74bed10f216cf3ec8564eafe20bd64c53fb01daab6c71b19049513a325bd9dddbde00ae3675a323e4072c045a9b5fd93f308f43449b6ca36f1c',
      });
    } catch (error) {
      expect(error.message).toContain('Unauthorized');
    }
  });

  it('login fail: signature invalid', async () => {
    try {
      await service.login({
        address: '0x0089363CE91e04989a121BC04D11C3C42fD1c9f6',
        signature: 'invalid',
      });
    } catch (error) {
      expect(error.message).toContain(
        'The recovery param is more than two bits',
      );
    }
  });

  it('login fail: address invalid', async () => {
    try {
      await service.login({
        address: 'invalid',
        signature:
          '0x5c62d956c6bb2cd74bed10f216cf3ec8564eafe20bd64c53fb01daab6c71b19049513a325bd9dddbde00ae3675a323e4072c045a9b5fd93f308f43449b6ca36f1c',
      });
    } catch (error) {
      expect(error.message).toContain('Unauthorized');
    }
  });
});
