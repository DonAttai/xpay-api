import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum TransactionTypes {
  DEPOSITE = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TransactionTypes })
  type: string;

  @Column({ type: 'numeric' })
  amount: number;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
