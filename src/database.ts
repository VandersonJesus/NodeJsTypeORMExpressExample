import { Repository } from 'typeorm';
import { AppDataSource } from './data-source';
import { RefreshToken } from './entity/RefreshToken';
import { User } from './entity/User';

export class Database {

    public static userRepository: Repository<User>;
    public static refreshTokenRepository: Repository<RefreshToken>;

    public static async init() {
        this.userRepository = AppDataSource.getRepository(User);
        this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    }

}