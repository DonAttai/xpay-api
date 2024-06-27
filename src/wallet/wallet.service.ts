import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Wallet } from "./wallet.entity";
import { UsersService } from "src/users/users.service";
import { CreateWalletDto } from "./dto/create-wallet.dto";

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private userService: UsersService,
  ) {}

  //Create wallet
  async createWallet(userId: number) {
    const user = await this.userService.findUserById(userId);

    if (!user) throw new NotFoundException("User Not Found!");

    // check if user has wallet
    if (user.wallet) throw new ConflictException("You have a wallet!");

    const wallet = this.walletRepository.create({
      user,
    });
    await this.walletRepository.save(wallet);
    return { message: "Wallet was successfully created!" };
  }

  // find wallet by walletId
  async findWalletById(walletId: string) {
    const wallet = await this.walletRepository.findOneBy({ id: walletId });
    if (!wallet) {
      throw new NotFoundException(`Invalid walletId`);
    }
    return wallet;
  }

  // find wallet by user id
  async findWalletByUserId(userId: number) {
    const user = await this.userService.getUserWithWallet(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return this.findWalletById(user.wallet.id);
  }

  async creditBeneficiaryWallet(walletId: string, amount: number) {
    const wallet = await this.findWalletById(walletId);
    wallet.balance = +wallet.balance + amount;
    return await this.walletRepository.save(wallet);
  }

  async debitRemiterWallet(walletId: string, amount: number) {
    const wallet = await this.findWalletById(walletId);
    wallet.balance = +wallet.balance - amount;
    return await this.walletRepository.save(wallet);
  }

  async getWalletWithUser(walletId: string) {
    return await this.walletRepository.findOne({
      where: { id: walletId },
      relations: ["user"],
    });
  }

  async fundWallet(walletId: string, amount: number) {
    const wallet = await this.walletRepository.findOneBy({ id: walletId });
    wallet.balance = +wallet.balance + amount / 100;
    return await this.walletRepository.save(wallet);
  }
}
