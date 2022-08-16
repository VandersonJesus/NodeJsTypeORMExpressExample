import { UserDTO } from "../dtos/response/user.dto";
import { User } from "../entity/User";

export class entityToDTO {
    public static userToDTO(user: User): UserDTO {
        const userDTO = new UserDTO();
        userDTO.id = user.id;
        userDTO.email = user.email;
        userDTO.password = user.password;
        userDTO.age = user.age;
        return userDTO;
    }
}