import {
  User,
  UserStatus,
} from "@user/domain/models/user.entity";
import type { UserRepository } from "@user/domain/repositories/user-repository.interface";
import { usersSchema } from "@user/infra/database/schemas/user.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(User: User): Promise<void> {
    await this.drizzleService.db.insert(usersSchema).values({
      startDate: User.startDate,
      endDate: User.endDate,
      status: User.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findAll(): Promise<User[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(usersSchema);
    return rows.map(
      (row) =>
        User.restore({
          ...row,
          status: row.status as UserStatus,
        })!,
    );
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id))
      .limit(1);

    if (!result[0]) return null;

    return User.restore({
      ...result[0],
      status: result[0].status as UserStatus,
    });
  }

  async findAllPaginated(params: PaginationParams): Promise<{ rows: User[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(usersSchema).limit(limit).offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(usersSchema),
    ]);

    return {
      rows: rows.map((row) =>
        User.restore({ ...row, status: row.status as UserStatus })!,
      ),
      total: countResult.count,
    };
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await this.drizzleService.db
      .update(usersSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(usersSchema.id, id));
  }
}
