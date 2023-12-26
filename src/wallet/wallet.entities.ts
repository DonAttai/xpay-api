import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

const createWalletId = () => {
  const date = new Date().getFullYear();
  const number = Math.random().toFixed(6).split('.')[1];
  return date + number;
};

const walletId = createWalletId();
console.log(walletId);
@Entity()
export class Wallet {
  @PrimaryColumn({ unique: true, default: walletId })
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;
}
