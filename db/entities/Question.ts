/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import History from './History';
import { QuestionDifficulty, Question } from '../proto/types';

@Entity('Question')
export default class QuestionEntity implements Question {
  @PrimaryGeneratedColumn()
    questionId!: number;

  @Column()
    name!: string;

  @Column()
    difficulty!: QuestionDifficulty;

  @Column()
    question!: string;

  @Column()
    solution!: string;

  @OneToMany(() => History, (history) => history.question)
    histories?: History[];

  @CreateDateColumn()
    createDateTime?: Date;

  @UpdateDateColumn()
    updateDateTime?: Date;
}
