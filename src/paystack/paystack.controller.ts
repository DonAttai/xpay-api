import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
  Get,
  Query,
} from "@nestjs/common";

import { PaystackService } from "./paystack.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Paystack")
@Controller("paystack")
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post("initialize")
  @UseGuards(JwtAuthGuard)
  initializeTransaction(
    @Body() paymentData: { email: string; amount: number },
  ): Promise<any> {
    const { email, amount } = paymentData;
    return this.paystackService.initializeTransaction(email, amount);
  }

  @Get("callback")
  handleCallback(@Query("reference") reference: string, @Res() res: Response) {
    const transaction = this.paystackService.handleCallback(reference);
    const URL = `https://x-pay.onrender.com/success-page?reference=${reference}`;
    if (transaction) {
      return res.redirect(URL);
    }
  }

  @Post("webhook/xpay")
  async handleEvent(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.paystackService.handleEvent(payload, req);
    return res.sendStatus(200);
  }
}
