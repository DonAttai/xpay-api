import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Paystack } from 'src/helpers/paystack';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PaystackService {
  constructor(
    private paystack: Paystack,
    private userService: UsersService,
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

  async paystackWebhook(event: any, userId: number) {
    try {
      if (event.event.charge === 'charge.success') {
        const { amount } = event;
        await this.userService.fundWallet(userId, amount);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
