import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('users')
export class WalletController {
  constructor(private walletService: WalletService) {}

  // create wallet
  @UseGuards(JwtAuthGuard)
  @Post(':userId/wallet')
  createWallet(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createwalletDto: CreateWalletDto,
  ) {
    return this.walletService.createWallet(userId, createwalletDto);
  }
}
