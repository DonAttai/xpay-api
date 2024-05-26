import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateTransactionDto } from "./dto";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "src/auth/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { Role } from "src/users/entities/user.entity";
import { UserGuard } from "src/guards/user.guard";

@ApiTags("Transaction")
@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get("transactions")
  getAllTransactions() {
    return this.transactionService.getAllTransactions();
  }

  @Post(":userId/transactions")
  @UseGuards(UserGuard)
  createTransaction(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(
      userId,
      createTransactionDto,
    );
  }

  @Get("users/:userId/transactions")
  @UseGuards(UserGuard)
  getUserTransactions(@Param("userId", ParseIntPipe) userId: number) {
    return this.transactionService.getUserTransactions(userId);
  }
}
