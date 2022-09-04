import {
  CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type User from './User';

@Entity('PasswordReset')
export default class PasswordReset {
  @PrimaryGeneratedColumn()
    id!: string;

  @ManyToOne('User', 'passwordReset')
    user!: User;

  @CreateDateColumn()
    createDateTime!: Date;

  @UpdateDateColumn()
    updateDateTime!: Date;
}
