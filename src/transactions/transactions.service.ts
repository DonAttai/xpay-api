import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { Transaction, TransactionTypes } from "./transaction.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateTransactionDto } from "./dto";
import { UsersService } from "src/users/users.service";
import { WalletService } from "src/wallet/wallet.service";

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

  // confirm transaction
  async createTransaction(
    userId: number,
    createTransactionDto: CreateTransactionDto,
  ) {
    const user = await this.userService.getUserWithWallet(userId);

    if (!user) {
      throw new NotFoundException("User not found!");
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
          throw new UnauthorizedException("Invalid wallet Id!");
        }
        // check user balance
        if (user.wallet.balance < createTransactionDto.amount) {
          throw new ForbiddenException("Insufficient Balance!");
        }
        await this.walletService.debitRemiterWallet(
          user.wallet.id,
          createTransactionDto.amount,
        );
        break;

      // Transfer
      case TransactionTypes.TRANSFER:
        // Check user balance
        if (user.wallet.balance < createTransactionDto.amount) {
          throw new ForbiddenException("Insufficient Balance!");
        }

        if (user.wallet.id === createTransactionDto.walletId) {
          throw new ForbiddenException("Not allowed!");
        }
        // find beneficiary wallet
        const wallet = await this.walletService.findWalletById(
          createTransactionDto.walletId,
        );
        // debit sender wallet
        if (wallet) {
          await this.walletService.debitRemiterWallet(
            user.wallet.id,
            createTransactionDto.amount,
          );
        }

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
    // Create user transaction
    const userTransaction = this.transactionRepository.create({
      user,
      ...createTransactionDto,
    });
    if (userTransaction) {
      userTransaction.status = "success";
    }
    await this.transactionRepository.save(userTransaction);

    // create beneficiary transaction
    const beneficiaryWallet = await this.walletService.getWalletWithUser(
      createTransactionDto.walletId,
    );
    const beneficiaryTransaction = this.transactionRepository.create({
      ...createTransactionDto,
      type: TransactionTypes.CREDIT,
      user: beneficiaryWallet.user,
    });

    if (beneficiaryTransaction) {
      beneficiaryTransaction.status = "success";
    }
    await this.transactionRepository.save(beneficiaryTransaction);

    return {
      message: `${createTransactionDto.type} was successfully!`,
    };
  }
}
