import { History, Question, User } from './entities/';
import "reflect-metadata"
import { DataSource } from "typeorm";
require("dotenv").config();

const ds = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_DBHOST!,
    port: 5432,
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    synchronize: true,
    logging: true,
    entities: [User, Question, History],
    subscribers: [],
    migrations: [],
});

const DB = async () => {
    return ds.initialize();
};

DB()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });


export * from "./entities"

export {
    ds, DB
}