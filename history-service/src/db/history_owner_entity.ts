/* eslint import/no-cycle: 0 */
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import HistoryAttemptEntity from './history_entity';

@Entity('history_owners')
export default class HistoryOwnerEntity {
  @PrimaryColumn({ name: 'user_id' })
    userId?: number;

  @PrimaryColumn({ name: 'attempt_id' })
    attemptId?: number;

  @ManyToOne((/* type */) => HistoryAttemptEntity, (attempt) => attempt.users)
  @JoinColumn({ name: 'attempt_id' })
    history?: HistoryAttemptEntity;
}
