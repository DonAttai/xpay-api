import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entities';
import { UsersService } from 'src/users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    private userService: UsersService,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async findWallet(id: string) {
    const wallet = await this.walletRepository.findOneBy({ id });
    if (!wallet) {
      throw new NotFoundException('Wallet Not Found!');
    }
    return wallet;
  }

  async createWallet(id: string, createWalletDto: CreateWalletDto) {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User Not Found!');
    }
    const wallet = this.walletRepository.create({
      ...createWalletDto,
      user,
    });
    await this.walletRepository.save(wallet);
    return { message: 'Wallet was created!' };
  }
}
