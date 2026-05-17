import { OnModuleInit } from '@nestjs/common';
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
export declare class DrizzleService implements OnModuleInit {
    private readonly logger;
    db: NodePgDatabase;
    onModuleInit(): Promise<void>;
}
