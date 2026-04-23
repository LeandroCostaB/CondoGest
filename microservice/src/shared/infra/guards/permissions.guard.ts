import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "@shared/infra/decorators/current-user.decorator";
import { PERMISSIONS_KEY } from "@shared/infra/decorators/permissions.decorator";
import { IS_PUBLIC_KEY } from "@shared/infra/decorators/public.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException("Authenticated user not found");
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      request.user?.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException("Missing required permissions");
    }

    return true;
  }
}
