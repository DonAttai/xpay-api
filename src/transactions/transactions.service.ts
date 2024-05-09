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

@Injectable()
export class TransactionsService {
  constructor(
    private userService: UsersService,
    private walletService: WalletService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // Get all transactions
  async getAllTransactions() {
    const transactions = await this.transactionRepository.find();
    return transactions;
  }

  //Get the transactions of a single user
  async getUserTransactions(userId: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
    });
    return transactions;
  }

  //Add a transaction
  async createTransaction(
    userId: number,
    createTransactionDto: CreateTransactionDto,
  ) {
    const user = await this.userService.getUserWithWallet(userId);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // Handle transaction types
    switch (createTransactionDto.type) {
      //Deposit
      case TransactionTypes.DEPOSITE:
        await this.walletService.creditBeneficiaryWallet(
          createTransactionDto.walletId,
          createTransactionDto.amount,
        );
        break;

      //Withdraw
      case TransactionTypes.WITHDRAW:
        // Confirm user wallet Id
        if (createTransactionDto.walletId !== user.wallet.id) {
          throw new UnauthorizedException('Invalid wallet Id!');
        }
        // check user balance
        if (user.wallet.balance < createTransactionDto.amount) {
          throw new ForbiddenException('Insufficient Balance!');
        }
        await this.userService.debitRemitterWallet(
          userId,
          createTransactionDto.amount,
        );
        break;

      // Transfer
      case TransactionTypes.TRANSFER:
        // Check user balance
        if (user.wallet.balance < createTransactionDto.amount) {
          throw new ForbiddenException('Insufficient Balance!');
        }
        // debit sender wallet
        await this.userService.debitRemitterWallet(
          userId,
          createTransactionDto.amount,
        );

        // credit receiver wallet
        await this.walletService.creditBeneficiaryWallet(
          createTransactionDto.walletId,
          createTransactionDto.amount,
        );
        break;
      default:
        throw new ForbiddenException(
          `${createTransactionDto.type} is not a service`,
        );
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user,
    });

    this.transactionRepository.save(transaction);
    return { message: 'Transaction was successfully created!' };
  }
}
