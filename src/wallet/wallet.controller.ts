import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CreateWalletDto } from "./dto/create-wallet.dto";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Wallet")
@Controller("users")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get("wallets/:walletId")
  getWalletWithUser(@Param("walletId") walletId: string) {
    return this.walletService.getWalletWithUser(walletId);
  }

  // create wallet
  @Post(":userId/wallet")
  createWallet(@Param("userId", ParseIntPipe) userId: number) {
    return this.walletService.createWallet(userId);
  }
}
