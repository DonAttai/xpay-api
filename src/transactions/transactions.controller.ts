import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('api/users')
export class TransactionsController {
  constructor(
    private readonly userService: UsersService,
    private readonly transactionService: TransactionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/transactions')
  createTransaction(
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req,
  ) {
    return this.transactionService.createTransaction(
      id,
      createTransactionDto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/transactions')
  getUserTrnsactions(userId: string) {
    return this.transactionService.getUserTransactions(userId);
  }
}
