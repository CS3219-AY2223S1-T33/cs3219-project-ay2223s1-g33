/* eslint import/no-cycle: 0 */
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import UserEntity from './user_entity';

@Entity('password_reset_tokens')
export default class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn({ name: 'token_id' })
    id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

  @Column({ name: 'expires_at' })
    expiresAt!: Date;

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime!: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime!: Date;
}
