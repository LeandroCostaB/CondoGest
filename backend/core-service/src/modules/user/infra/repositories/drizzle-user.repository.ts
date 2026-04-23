import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { User, UserType } from "@user/domain/models/user.entity";
import type { UserRepository } from "@user/domain/repositories/user-repository.interface";
import { usersSchema } from "@user/infra/database/schemas/user.schema";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: User): Promise<void> {
    await this.drizzleService.db.insert(usersSchema).values({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      type: user.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(user: User): Promise<void> {
    await this.drizzleService.db
      .update(usersSchema)
      .set({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        type: user.type,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.id, user.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(usersSchema)
      .where(eq(usersSchema.id, id));
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return User.restore({
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      passwordHash: result[0].passwordHash,
      type: result[0].type as UserType,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email.toLowerCase()))
      .limit(1);

    if (result.length === 0) return null;

    return User.restore({
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      passwordHash: result[0].passwordHash,
      type: result[0].type as UserType,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async findAll(): Promise<User[]> {
    const rows = await this.drizzleService.db.select().from(usersSchema);

    return rows.map(
      (row) =>
        User.restore({
          id: row.id,
          name: row.name,
          email: row.email,
          passwordHash: row.passwordHash,
          type: row.type as UserType,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        })!,
    );
  }
}
