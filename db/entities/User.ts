import { History } from './History';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: string

    @Column()
    email!: string;

    @Column()
    password!: string;

    @ManyToMany(() => History)
    @JoinTable()
    histories?: History[]

    @CreateDateColumn()
    createDateTime!: Date

    @UpdateDateColumn()
    updateDateTime!: Date
}