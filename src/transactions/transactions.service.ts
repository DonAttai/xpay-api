import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Transaction, TransactionTypes } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/wallet/wallet.entities';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private userService: UsersService,
    private walletService: WalletService,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // Get all transactions
  async getAllTransactions() {
    return await this.transactionRepository.find();
  }

  //Get the transactions of a single user
  async getUserTransactions(userId: string) {
    const user = await this.userService.findUserById(userId);
    return user.transactions;
  }

  //Add a transaction
  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionDto,
    currentUser: Partial<User>,
  ) {
    if (userId !== currentUser.id) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user,
    });

    // find wallet
    const wallet = await this.walletService.findWallet(
      createTransactionDto.walletId,
    );

    // if wallet doesn't exists
    if (!wallet) {
      throw new NotFoundException('Wallet Not Found!');
    }

    // Handle transaction types
    switch (createTransactionDto.type) {
      //Deposit
      case TransactionTypes.DEPOSITE:
        wallet.balance = +wallet.balance + createTransactionDto.amount;
        await this.walletRepository.save(wallet);
        break;

      //Withdraw
      case TransactionTypes.WITHDRAW:
        // Confirm user wallet Id
        if (createTransactionDto.walletId !== user.wallet.id) {
          throw new UnauthorizedException('Invalid wallet Id!');
        }
        // check user balance
        if (+user.wallet.balance < createTransactionDto.amount) {
          throw new ForbiddenException('Insufficient Balance!');
        }
        user.wallet.balance =
          +user.wallet.balance - createTransactionDto.amount;
        await this.walletRepository.save(user.wallet);
        return { message: 'Successful!' };
        break;

      // Transfer
      case TransactionTypes.TRANSFER:
        // Check user balance
        if (+user.wallet.balance < createTransactionDto.amount) {
          throw new ForbiddenException('Insufficient Balance!');
        }
        user.wallet.balance =
          +user.wallet.balance - createTransactionDto.amount;
        await this.walletRepository.save(user.wallet);
        wallet.balance = +wallet.balance + createTransactionDto.amount;
        await this.walletRepository.save(wallet);
        break;
      default:
        throw new ForbiddenException(
          `${createTransactionDto.type} is not a service`,
        );
    }
    this.transactionRepository.save(transaction);
    return { message: 'Transaction was successfully created!' };
  }
}
