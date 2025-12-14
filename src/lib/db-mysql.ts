import 'server-only';
import { PrismaClient as MysqlClient } from '@prisma/mysql-client';
declare global {
    var prismaMysql: MysqlClient | undefined;
}

export const dbMysql = globalThis.prismaMysql || new MysqlClient();

if (process.env.NODE_ENV !== 'production') globalThis.prismaMysql = dbMysql;
