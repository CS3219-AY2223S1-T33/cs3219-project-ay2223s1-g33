import { Question } from './Question';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class History {

    @PrimaryGeneratedColumn()
    id!: string;

    @ManyToOne(() => Question, (question) => question.histories)
    question!: Question

    @Column()
    submission!: string

    @CreateDateColumn()
    createDateTime!: Date

    @UpdateDateColumn()
    updateDateTime!: Date
}