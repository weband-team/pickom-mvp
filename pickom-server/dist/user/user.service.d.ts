import { User } from './types/user.type';
export declare class UserService {
    private users;
    constructor();
    findOne(uid: string): Promise<User | undefined>;
    findOneByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findAllPickers(): Promise<User[]>;
    create(userData: Partial<User>): Promise<User>;
    update(uid: string, updateData: Partial<User>): Promise<User>;
    delete(uid: string): Promise<User>;
    private generateUid;
}
