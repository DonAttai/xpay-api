import { Body, Controller, Post, Req, Res } from '@nestjs/common';

import { PaystackService } from './paystack.service';
import { Response } from 'express';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize')
  initializeTransaction(
    @Body() paymentData: { email: string; amount: number },
  ): Promise<any> {
    const { email, amount } = paymentData;
    return this.paystackService.initializeTransaction(email, amount);
  }

  @Post('webhook')
  async paystackWebhook(
    @Body() event: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    await this.paystackService.paystackWebhook(event, req.user.id);
    return res.sendStatus(200);
  }
}
