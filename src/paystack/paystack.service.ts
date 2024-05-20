import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Paystack } from 'src/helpers/paystack';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import crypto from 'crypto';

@Injectable()
export class PaystackService {
  constructor(
    private paystack: Paystack,
    private userService: UsersService,
    private walletService: WalletService,
  ) {}

  async initializeTransaction(email: string, amount: number): Promise<any> {
    try {
      return await this.paystack.initializeTransaction({
        email,
        amount: amount * 100,
      });
    } catch (error) {
      throw new Error(`Paystack error: 
      ${error.message}`);
    }
  }

  async handleEvent(payload: any, req: any) {
    try {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (hash === req.headers['x-paystack-signature']) {
        const { data, event } = payload;
        if (event === 'charge.success') {
          console.log('data', data);
          const { amount } = data;
          console.log(amount);
          const user = await this.userService.findUser(data.customer.email);
          await this.walletService.fundWallet(user.wallet.id, amount);
        }
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
