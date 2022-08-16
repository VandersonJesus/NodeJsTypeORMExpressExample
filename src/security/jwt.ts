import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class JWT {


    private static JWT_SECRET = 'CarWashMovelAPI';

    public static async generateTokenAndRefreshToken(user: User) {

        // specify a payload thats holds the users id (and) email
        const payload = {
            id: user.id,
            email: user.email
        }

        // specify a secret key for jwt generation
        const jwtid = uuidv4();
        const token = jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: "1h",// specify when does the token expires
            jwtid: jwtid, // specity jwtid (and id of that token) (needed for the refresh token, as refresh token only point to one single unique token)
            subject: user.id.toString() // the subject shold be the users id (primary key)
            //expires
            // jwtid
        });

        // create a refresh token
        const refreshToken = await this.generateRefreshTokenForUserAndToken(user, jwtid);

        // link that token with refresh token

        return { token, refreshToken };
    }

    private static async generateRefreshTokenForUserAndToken(user: User, jwtid: string) {
        // create a new record of refresh token
        const refreshToken = new RefreshToken();
        refreshToken.user = user;
        refreshToken.jwtId = jwtid;

        //set the expiry date of the refresh token for example 10 days
        refreshToken.expiryDate = moment().add(10, 'd').toDate();

        // store this refresh token
        await Database.refreshTokenRepository.save(refreshToken);

        return refreshToken.id;

    }

    public static isTokenValid(token: string) {
        try {
            jwt.verify(token, this.JWT_SECRET, { ignoreExpiration: false, });
            return true;
        } catch (error) {
            return false;
        }

    }

    public static getJwtId(token: string) {
        const decodedToken = jwt.decode(token);
        return decodedToken['jti'];
    }

    public static async isRefreshTokenLinkedToToken(refreshToken: RefreshToken, jwtId: string) {
        if (!refreshToken) return false;
        if (refreshToken.jwtId !== jwtId) return false;
        return true;
    }

    public static async isRefreshTokenExpired(refreshToken: RefreshToken) {
        if (moment().isAfter(refreshToken.expiryDate)) return true;
        return false;
    }

    public static async isRefreshTokenUsedOrInvalidated(refreshToken: RefreshToken) {
        return refreshToken.used || refreshToken.invalidated;
    }

    public static async getJwtPayloadValueByKey(token: string, key: string) {
        const decodedToken = jwt.decode(token);
        return decodedToken[key];
    }
}