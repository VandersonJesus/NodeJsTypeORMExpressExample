import { User } from "../../entity/User"

export class UserDTO {
    id: number
    email: string
    username: string
    password: string
    age: number

    public static ofEntity(user: User): UserDTO {
        const userDTO = new UserDTO();
        userDTO.id = user.id;
        userDTO.email = user.email;
        userDTO.password = user.password;
        userDTO.age = user.age;
        return userDTO;
    }
}