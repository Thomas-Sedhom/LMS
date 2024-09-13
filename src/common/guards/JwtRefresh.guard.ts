import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { Request, Response } from 'express';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const accessToken = request.cookies['accessToken'];
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    // If access token is missing or expired, but refresh token is present, proceed to refresh token logic
    try {
      if (accessToken) {
        // Verify access token
        await this.jwtService.verifyToken(accessToken);
        return true;
      } else {
        // Access token is missing; treat as expired
        throw new UnauthorizedException('Access token missing');
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Access token is expired; try to refresh with the refresh token
        try {
          const newTokens = await this.authService.refreshTokens(refreshToken);

          // Set new access and refresh tokens in cookies with expiration dates
          response.cookie('accessToken', newTokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 604800000, // 7 days in milliseconds
          });

          response.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months in milliseconds
          });

          return true;
        } catch (refreshError) {
          throw new UnauthorizedException('Invalid refresh token');
        }
      } else {
        throw new UnauthorizedException('Invalid access token');
      }
    }
  }
}