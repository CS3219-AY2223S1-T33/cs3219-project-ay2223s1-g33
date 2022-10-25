import {
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('history_completions')
export default class HistoryCompletionEntity {
  @PrimaryColumn({ name: 'user_id' })
    userId?: number;

  @PrimaryColumn({ name: 'question_id' })
    questionId?: number;
}
