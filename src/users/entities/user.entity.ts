import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Transaction } from "src/transactions/transaction.entity";
import { Wallet } from "src/wallet/wallet.entity";
import { Exclude } from "class-transformer";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: "active", default: true })
  isActive: boolean;
  @Column({ type: "set", enum: Role, default: Role.USER })
  roles: Role[];

  @Column({ default: false })
  isVerified?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToOne(() => Wallet, (Wallet) => Wallet.user, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
