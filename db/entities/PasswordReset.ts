/* eslint import/no-cycle: 0 */
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

@Entity('PasswordReset')
export default class PasswordResetEntity {
  @PrimaryGeneratedColumn()
    id!: string;

  @ManyToOne(() => User, (user) => user.passwordReset)
    user!: User;

  @CreateDateColumn()
    createDateTime!: Date;

  @UpdateDateColumn()
    updateDateTime!: Date;
}
