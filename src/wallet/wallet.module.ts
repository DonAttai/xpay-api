import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entities';
import { UsersModule } from 'src/users/users.module';
import { WalletController } from './wallet.controller';

@Module({
  providers: [WalletService],
  imports: [UsersModule, TypeOrmModule.forFeature([Wallet])],
  exports: [WalletService, TypeOrmModule],
  controllers: [WalletController],
})
export class WalletModule {}
