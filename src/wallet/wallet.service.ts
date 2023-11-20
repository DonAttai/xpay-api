import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entities';
import { UsersService } from 'src/users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private userService: UsersService,
  ) {}

  //Find wallet
  async findWallet(id: string): Promise<Wallet> {
    return await this.walletRepository.findOneBy({ id });
  }

  //Create wallet
  async createWallet(
    userId: string,
    createWalletDto: CreateWalletDto,
    currentUser: Partial<User>,
  ) {
    if (userId !== currentUser.id) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    // check if user has wallet
    if (user.wallet) {
      throw new ConflictException('You have a wallet!');
    }
    const wallet = this.walletRepository.create({
      ...createWalletDto,
      user,
    });
    await this.walletRepository.save(wallet);
    return { message: 'Wallet was successfully created!' };
  }
}
