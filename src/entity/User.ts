import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RegisterDTO } from "../dtos/request/register.dto";
import { RefreshToken } from "./RefreshToken";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    age: number;

    @OneToMany(type => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken;

    public static ofRegisterDTO(registerDTO: RegisterDTO): User {
        const user = new User();
        user.email = registerDTO.email;
        user.password = registerDTO.password;
        user.username = registerDTO.username;
        user.age = registerDTO.age;
        return user;
    }

}
