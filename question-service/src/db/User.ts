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
import PasswordResetToken from './PasswordResetToken';
import History from './History';

@Entity('users')
export default class UserEntity implements User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
    userId!: number;

  @Column()
    nickname!: string;

  @Index('user_username_index')
  @Column({ unique: true })
    username!: string;

  @Column()
    password!: string;

  @Column({ default: true, name: 'is_active' })
    isActive!: boolean;

  @ManyToMany(() => History)
  @JoinTable({
    name: 'users_histories_owner', // table name for the junction table of this relation
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'history_id',
      referencedColumnName: 'history_id',
    },
  })
    histories?: History[];

  @OneToMany(() => PasswordResetToken, (passwordResetToken) => passwordResetToken.user)
    passwordResetTokens?: PasswordResetToken[];

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime!: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime!: Date;
}
