import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '.';

@Entity()
export class PasswordReset {

    @PrimaryGeneratedColumn()
    id!: string

    @ManyToOne(() => User, (user) => user.passwordReset)
    user!: User
    
    @CreateDateColumn()
    createDateTime!: Date

    @UpdateDateColumn()
    updateDateTime!: Date
}