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
import PasswordResetTokenEntity from './PasswordResetToken';
import HistoryEntity from './History';

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

  @ManyToMany(() => HistoryEntity)
  @JoinTable({
    name: 'users_histories_owner', // table name for the junction table of this relation
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'userId',
    },
    inverseJoinColumn: {
      name: 'history_id',
      referencedColumnName: 'id',
    },
  })
    histories?: HistoryEntity[];

  @OneToMany(() => PasswordResetTokenEntity, (passwordResetToken) => passwordResetToken.user)
    passwordResetTokens?: PasswordResetTokenEntity[];

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime!: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime!: Date;
}
