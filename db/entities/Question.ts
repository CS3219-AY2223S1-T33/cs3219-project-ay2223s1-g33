/* eslint import/no-cycle: 0 */
import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import History from './History';

export enum Diffculty {
  EASY,
  MEDIUM,
  HARD,
}

export type Solution = {
  input: string,
  output: string,
  explination: string,
};

@Entity('Question')
export default class Question {
  @PrimaryGeneratedColumn()
    id!: string;

  @Column()
    diffculty!: Diffculty;

  @Column()
    question!: string;

  @Column('simple-array')
    solutions!: Solution[];

  @Column()
    constrains?: string;

  @Column()
    hint?: string;

  @OneToMany('History', 'question')
    histories?: History[];

  @CreateDateColumn()
    createDateTime!: Date;

  @UpdateDateColumn()
    updateDateTime!: Date;
}
