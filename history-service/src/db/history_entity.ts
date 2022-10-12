/* eslint import/no-cycle: 0 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import HistoryOwnerEntity from './history_owner_entity';

@Entity('histories')
export default class HistoryAttemptEntity {
  @PrimaryGeneratedColumn({ name: 'attempt_id' })
    attemptId!: number;

  @OneToMany((/* type */) => HistoryOwnerEntity, (owner) => owner.history, {
    cascade: true,
  })
    users?: HistoryOwnerEntity[];

  @Column({ name: 'question_id' })
    questionId!: number;

  @Column()
    submission!: string;

  @Column()
    language!: string;

  @CreateDateColumn({ name: 'create_timestamp' })
    createDateTime?: Date;

  @UpdateDateColumn({ name: 'update_timestamp' })
    updateDateTime?: Date;
}
