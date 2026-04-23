import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "@shared/domain/enums/permission.enum";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();

    const hasPermission = requiredPermissions.every((permission) =>
      user?.permissions?.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        "Acesso negado: você não tem a permissão necessária.",
      );
    }

    return true;
  }
}
