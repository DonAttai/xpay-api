import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { UsersModule } from 'src/users/users.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  providers: [TransactionsService],
  controllers: [TransactionsController],
  imports: [UsersModule, WalletModule, TypeOrmModule.forFeature([Transaction])],
})
export class TransactionsModule {}
