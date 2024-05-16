import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum TransactionTypes {
  DEPOSITE = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TransactionTypes })
  type: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ default: 'pending' })
  status?: 'success' | 'pending' | 'failed';

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
