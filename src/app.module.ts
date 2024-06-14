import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { AuthModule } from "./auth/auth.module";
import { WalletModule } from "./wallet/wallet.module";
import { ConfigModule } from "@nestjs/config";
import { config } from "./config/config";
import { MailModule } from "./mail/mail.module";
import { PaystackModule } from "./paystack/paystack.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(config),
    UsersModule,
    TransactionsModule,
    AuthModule,
    WalletModule,
    MailModule,
    PaystackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
