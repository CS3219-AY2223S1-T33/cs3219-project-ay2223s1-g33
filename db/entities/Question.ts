import { History } from './History';
import { DotenvParseOutput } from "dotenv";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Diffculty {
    EASY,
    MEDIUM,
    HARD,
}

export type Solution = {
    input: string,
    output: string,
    explination: string,
}

@Entity()
export class Question {

    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    diffculty!: Diffculty;

    @Column()
    question!: string

    @Column("simple-array")
    solutions!: Solution[]

    @Column()
    constrains?: string

    @Column()
    hint?: string

    @OneToMany(() => History, (history) => history.question)
    histories?: History[]

    @CreateDateColumn()
    createDateTime!: Date

    @UpdateDateColumn()
    updateDateTime!: Date
    
}