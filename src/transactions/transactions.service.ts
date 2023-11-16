import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Transaction, TransactionTypes } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private userService: UsersService,
    private walletService: WalletService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // Add a transaction
  async createTransaction(
    id: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const user = await this.userService.findUserById(id);

    if (!user) {
      throw new NotFoundException('User not found!');
    }
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user,
    });

    // Get wallet
    const wallet = await this.walletService.findWallet(
      createTransactionDto.walletId,
    );

    switch (createTransactionDto.type) {
      //Deposite
      case TransactionTypes.DEPOSITE:
        wallet.balance += transaction.amount;
        break;

      // Transfer
      case TransactionTypes.TRANSFER:
        if (user.wallet.balance < createTransactionDto.amount) {
          throw new Error('Insufficient balance!');
        }
        wallet.balance += transaction.amount;
        break;

      //Withdrawal
      case TransactionTypes.WITHDRAW:
        if (user.wallet.balance < createTransactionDto.amount) {
          throw new Error('Insufficient balance!');
        }
        user.wallet.balance -= transaction.amount;
        break;

      default:
        return null;
    }

    await this.usersRepository.save(user);
    const savedTransaction = await this.transactionRepository.save(transaction);
    return savedTransaction;
  }
}
