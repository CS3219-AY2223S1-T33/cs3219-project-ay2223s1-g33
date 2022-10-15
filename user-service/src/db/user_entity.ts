/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../proto/types';

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

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime?: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime?: Date;
}
