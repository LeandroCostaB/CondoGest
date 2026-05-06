import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "@shared/domain/enums/permission.enum";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "@shared/infra/decorators/current-user.decorator";
import { usersSchema } from "@user/infra/database/schemas/user.schema";
import { eq } from "drizzle-orm";
import { isUUID } from "class-validator";
import { IS_PUBLIC_KEY } from "@shared/infra/decorators/public.decorator";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly drizzleService: DrizzleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user) {
      return true;
    }

    const userId = this.readHeader(request.headers["x-user-id"]);

    if (!userId) {
      throw new UnauthorizedException(
        "Missing authentication header 'x-user-id'",
      );
    }

    if (!isUUID(userId, "4")) {
      throw new UnauthorizedException("Invalid authentication header 'x-user-id'");
    }

    const existingUser = await this.drizzleService.db.query.usersSchema.findFirst(
      {
        where: eq(usersSchema.id, userId),
      },
    );

    if (!existingUser) {
      throw new UnauthorizedException("Authenticated user not found");
    }

    request.user = this.buildUserFromHeaders(request.headers, userId);
    return true;
  }

  private buildUserFromHeaders(
    headers: AuthenticatedRequest["headers"],
    userId: string,
  ): AuthenticatedUser {
    const email = this.readHeader(headers["x-user-email"]) ?? "";
    const permissionsHeader = this.readHeader(headers["x-user-permissions"]);

    return {
      sub: userId,
      email,
      permissions: permissionsHeader
        ? permissionsHeader
            .split(",")
            .map((permission) => permission.trim())
            .filter(Boolean)
        : Object.values(Permission),
    };
  }

  private readHeader(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
