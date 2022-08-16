import "reflect-metadata"
import { DataSource } from "typeorm"
import { RefreshToken } from "./entity/RefreshToken"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12QWaszx#",
    database: "loja",
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
    //ssl: true,
})
