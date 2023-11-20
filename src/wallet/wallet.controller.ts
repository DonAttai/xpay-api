import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('api/users')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @UseGuards(JwtAuthGuard)
  @Post(':id/wallet')
  createWallet(
    @Param('id') id: string,
    @Body() createwalletDto: CreateWalletDto,
    @Request() req,
  ) {
    return this.walletService.createWallet(id, createwalletDto, req.user);
  }
}
