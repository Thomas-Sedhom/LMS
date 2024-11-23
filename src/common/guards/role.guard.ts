import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from "@nestjs/core";
import { Roles } from '../decorators/role.decorator'
import { RoleEnum } from "../enum/role.enum";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly configService: ConfigService) { }
  canActivate(context: ExecutionContext): boolean {
    const roles: string[] = this.reflector.get(Roles, context.getHandler());
    if (!roles)
      return true;
    try {
      const req = context.switchToHttp().getRequest();
      const userRole = req.user.role
      const hasRole = roles.some((role: RoleEnum) => role === userRole);
      if (!hasRole) {
        throw new ForbiddenException('Forbidden resource');
      }

      return true; // Grant access if roles match
    } catch (err) {
      throw new UnauthorizedException(err)
    }
  }
}