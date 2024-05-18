import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { Paystack } from 'src/helpers/paystack';
import { UsersModule } from 'src/users/users.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [UsersModule, WalletModule],
  providers: [PaystackService, Paystack],
  controllers: [PaystackController],
})
export class PaystackModule {}
