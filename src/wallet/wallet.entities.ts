import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', default: 0.0 })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;
}
