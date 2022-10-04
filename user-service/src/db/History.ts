/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import QuestionEntity from './Question';
import UserEntity from './User';

@Entity('histories')
export default class HistoryEntity {
  @PrimaryGeneratedColumn({ name: 'history_id' })
    id!: string;

  @ManyToOne(() => QuestionEntity, (question) => question.histories)
  @JoinColumn({ name: 'question_id' })
    question!: QuestionEntity;

  @ManyToMany(() => UserEntity)
    users?: UserEntity[];

  @Column()
    submission!: string;

  @Column()
    language!: string;

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime!: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime!: Date;
}
