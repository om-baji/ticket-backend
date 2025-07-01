import { PrismaClient } from "@prisma/client";

class Singleton {
    private static instance : PrismaClient | null;

    static getInstance() : PrismaClient {
        if(!this.instance) {
            this.instance = new PrismaClient();
        }

        return this.instance;
    }
}

export const prisma = Singleton.getInstance();