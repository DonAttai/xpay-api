import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletService } from './wallet.service';

@Controller('api/users')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @Post(':id/wallet')
  createWallet(
    @Param('id') id: string,
    @Body() createwalletDto: CreateWalletDto,
  ) {
    return this.walletService.createWallet(id, createwalletDto);
  }
}
