import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
} from "@nestjs/common";

import { PaystackService } from "./paystack.service";
import { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Paystack")
@Controller("paystack")
@UseGuards(JwtAuthGuard)
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post("initialize")
  initializeTransaction(
    @Body() paymentData: { email: string; amount: number },
  ): Promise<any> {
    const { email, amount } = paymentData;
    return this.paystackService.initializeTransaction(email, amount);
  }

  @Post("webhook/xpay")
  async handleEvent(
    @Body() payload: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    await this.paystackService.handleEvent(payload, req);
    return res.sendStatus(200);
  }
}
