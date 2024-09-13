import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../shared/modules/jwt/jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const accessToken = request.cookies['accessToken'];

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const decoded = await this.jwtService.verifyToken(accessToken);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}