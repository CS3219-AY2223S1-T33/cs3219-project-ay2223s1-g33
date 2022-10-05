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
  JoinTable,
} from 'typeorm';
import QuestionEntity from './Question';
import UserEntity from './User';

@Entity('histories')
export default class HistoryAttemptEntity {
  @PrimaryGeneratedColumn({ name: 'attempt_id' })
    attemptId!: number;

  @ManyToOne(() => QuestionEntity, (question) => question.histories)
  @JoinColumn({ name: 'question_id' })
    question!: QuestionEntity;

  @ManyToMany(() => UserEntity, (user) => user.histories)
  @JoinTable({
    name: 'users_histories_owner', // table name for the junction table of this relation
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'userId',
    },
    joinColumn: {
      name: 'history_id',
      referencedColumnName: 'attemptId',
    },
  })
    users?: UserEntity[];

  @Column()
    submission!: string;

  @Column()
    language!: string;

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime?: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime?: Date;
}
