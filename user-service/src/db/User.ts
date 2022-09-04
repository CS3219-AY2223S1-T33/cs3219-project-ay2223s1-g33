import { PasswordReset } from './PasswordReset';
import { History } from './History';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: string

    @Column()
    nickname!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({default: true})
    isActive!: boolean;

    @ManyToMany(() => History)
    @JoinTable()
    histories?: History[]

    @OneToMany(() => PasswordReset, (passwordReset) => passwordReset.user)
    passwordReset?: PasswordReset[]

    @CreateDateColumn()
    createDateTime!: Date

    @UpdateDateColumn()
    updateDateTime!: Date
}