import {
  Column, CreateDateColumn, Entity, JoinTable, ManyToMany,
  OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import PasswordReset from './PasswordReset';
import History from './History';

@Entity('User')
export default class User {
  @PrimaryGeneratedColumn()
    userId!: number;

  @Column()
    nickname!: string;

  @Column()
    username!: string;

  @Column()
    password!: string;

  @Column({ default: true })
    isActive!: boolean;

  @ManyToMany(() => History)
  @JoinTable()
    histories?: History[];

  @OneToMany('PasswordReset', 'user')
    passwordReset?: PasswordReset[];

  @CreateDateColumn()
    createDateTime!: Date;

  @UpdateDateColumn()
    updateDateTime!: Date;
}
