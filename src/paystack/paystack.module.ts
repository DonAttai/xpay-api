import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { ConfigService } from '@nestjs/config';
import { Paystack } from 'src/helpers/paystack';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [PaystackService, Paystack],
  controllers: [PaystackController],
})
export class PaystackModule {}
