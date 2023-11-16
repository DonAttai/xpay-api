import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';
import { UsersService } from 'src/users/users.service';
import { Transaction } from './transaction.entity';

@Controller('api/users')
export class TransactionsController {
  constructor(
    private readonly userService: UsersService,
    private readonly transactionService: TransactionsService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id/transactions')
  async createTransaction(
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const user = await this.userService.findUserById(id);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }
    const transaction = await this.transactionService.createTransaction(
      id,
      createTransactionDto,
    );

    return new Transaction(transaction);
  }
}
