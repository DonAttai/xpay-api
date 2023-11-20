import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Wallet {
  @PrimaryColumn({ length: 10 })
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;
}
