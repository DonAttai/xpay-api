import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

const createWalletId = () => {
  const date = new Date().getFullYear();
  const number = Math.random().toFixed(6).split('.')[1];
  return date + number;
};

@Entity()
export class Wallet {
  @PrimaryColumn({ unique: true })
  id: string = createWalletId();

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;
}
