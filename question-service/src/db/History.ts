/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import Question from './Question';

@Entity('histories')
export default class HistoryEntity {
  @PrimaryGeneratedColumn({ name: 'history_id' })
    id!: string;

  @ManyToOne(() => Question, (question) => question.histories)
  @JoinColumn({ name: 'question_id' })
    question!: Question;

  @Column()
    submission!: string;

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime!: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime!: Date;
}
