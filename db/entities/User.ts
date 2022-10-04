/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../proto/types';
import PasswordReset from './PasswordReset';
import History from './History';

@Entity('User')
export default class UserEntity implements User {
  @PrimaryGeneratedColumn()
    userId!: number;

  @Column()
    nickname!: string;

  @Index('user_username_index')
  @Column({ unique: true })
    username!: string;

  @Column()
    password!: string;

  @Column({ default: true })
    isActive!: boolean;

  @ManyToMany(() => History)
  @JoinTable()
    histories?: History[];

  @OneToMany(() => PasswordReset, (passwordReset) => passwordReset.user)
    passwordReset?: PasswordReset[];

  @CreateDateColumn()
    createDateTime!: Date;

  @UpdateDateColumn()
    updateDateTime!: Date;
}
