/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Question from './Question';

@Entity('History')
export default class History {
  @PrimaryGeneratedColumn()
    id!: string;

  @ManyToOne(() => Question, (question) => question.histories)
    question!: Question;

  @Column()
    submission!: string;

  @CreateDateColumn()
    createDateTime!: Date;

  @UpdateDateColumn()
    updateDateTime!: Date;
}
