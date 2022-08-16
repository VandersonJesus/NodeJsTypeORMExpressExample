import * as express from 'express';
import { Request, Response } from 'express';
import { AppDataSource } from "./data-source";
import { Database } from './database';
import { LoginDTO } from './dtos/request/login.dto';
import { RefreshTokenDTO } from './dtos/request/refresh-token.dto';
import { RegisterDTO } from './dtos/request/register.dto';
import { AuthenticationDTO } from './dtos/response/authentication.dto';
import { UserDTO } from './dtos/response/user.dto';
import { User } from './entity/User';
import { JWT } from './security/jwt';
import { PasswordHash } from './security/passwordHash';

const app = express();
const port = 4000;

app.use(express.json());

Database.init();

app.post('/register', async (req: Request, res: Response) => {

    try {

        const body: RegisterDTO = req.body;

        // validate the body
        if (body.password !== body.repeatPassword)
            throw new Error('Repeat password does no match the password')
        // validate if the email is already being used
        if (await Database.userRepository.findOneBy({ email: body.email }))
            throw new Error('E-Mail is already being used');
        // store the user
        const user = User.ofRegisterDTO(body);
        await Database.userRepository.save(user);

        const authenticationDTO: AuthenticationDTO = new AuthenticationDTO();
        const userDTO: UserDTO = UserDTO.ofEntity(user);

        authenticationDTO.user = userDTO;

        // implement token generation and refresh tokens
        const tokenAndRefreshToken = await JWT.generateTokenAndRefreshToken(user);
        authenticationDTO.token = tokenAndRefreshToken.token;
        authenticationDTO.refreshToken = tokenAndRefreshToken.refreshToken;

        res.json(authenticationDTO);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.post('/login', async (req: Request, res: Response) => {

    try {
        const body: LoginDTO = req.body;
        // check if the email/user exists
        const user = await Database.userRepository.findOne({ where: [{ username: body.username }, { email: body.username }] });
        if (!user)
            throw new Error('E-Mail or Username does not exist');

        // check if the password is valid
        if (! await PasswordHash.isPasswordValid(body.password, user.password))
            throw new Error('Password is invalid!');

        // retrieve tokens
        const { token, refreshToken } = await JWT.generateTokenAndRefreshToken(user);

        // generate an authenticationDTO/response
        const authenticationDTO = new AuthenticationDTO();
        authenticationDTO.user = UserDTO.ofEntity(user);
        authenticationDTO.token = token;
        authenticationDTO.refreshToken = refreshToken;

        res.json(authenticationDTO);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

app.post('/refresh/token', async (req: Request, res: Response) => {

    try {
        const body: RefreshTokenDTO = req.body;

        //check if the jwt token is valid
        if (!JWT.isTokenValid(body.token))
            throw new Error('JWT is not valid!');

        // fetch refresh Token from db
        const refreshToken = await Database.refreshTokenRepository.findOneBy({ id: body.refreshToken });

        //check if the refresh token exists and is linked to that jwt token
        const jwtId = JWT.getJwtId(body.token);
        const user = await Database.userRepository.findOneBy({ id: await JWT.getJwtPayloadValueByKey(body.token, 'id') });
        if (!JWT.isRefreshTokenLinkedToToken(refreshToken, jwtId))
            throw new Error('Token does not matcch with Refresh Token');

        //check if user exists
        if (!user) throw new Error('User does not exist!');

        //check if the jwt token has alread expired
        if (await JWT.isRefreshTokenExpired(refreshToken))
            throw new Error('Refresh Token has expired!');

        //check if the refresh token has used or invalidated
        if (await JWT.isRefreshTokenUsedOrInvalidated(refreshToken))
            throw new Error('Refresh token has ben used or invalidated!');

        refreshToken.used = true;
        await Database.refreshTokenRepository.save(refreshToken);

        // generate a fresh pair of token and refresh token
        const tokenResults = await JWT.generateTokenAndRefreshToken(user);

        // generate an authentication respose
        const authenticationDTO: AuthenticationDTO = new AuthenticationDTO();

        authenticationDTO.user = UserDTO.ofEntity(user);
        authenticationDTO.token = tokenResults.token;
        authenticationDTO.refreshToken = tokenResults.refreshToken;
        res.json(authenticationDTO);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }


});

app.listen(port, () => { console.log(`Listening on port: ${port}`) });

app.get('/', (req: Request, res: Response) => { res.send('Welcome to carwash loja back-end api'); });

AppDataSource.initialize().then(async () => {

}).catch(error => console.log(error));
