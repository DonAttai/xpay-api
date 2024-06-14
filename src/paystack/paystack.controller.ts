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
  HttpException,
} from "@nestjs/common";

import { PaystackService } from "./paystack.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
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
    const URL = `https://x-pay.onrender.com/success-page?reference=${reference}`;
    const transaction = this.paystackService.handleCallback(reference);
    if (transaction) {
      return res.redirect(URL);
    }
    throw new Error("Transaction Faild!");
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
