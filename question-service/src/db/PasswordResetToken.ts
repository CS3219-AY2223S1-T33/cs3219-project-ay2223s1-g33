/* eslint import/no-cycle: 0 */
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import User from './User';

@Entity('password_reset_tokens')
export default class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn({ name: 'token_id' })
    id!: string;

  @ManyToOne(() => User, (user) => user.passwordResetTokens)
  @JoinColumn({ name: 'user_id' })
    user!: User;

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime!: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime!: Date;
}
