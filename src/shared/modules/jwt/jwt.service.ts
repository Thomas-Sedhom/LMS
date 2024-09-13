import { Injectable, UnauthorizedException } from '@nestjs/common';
import {JwtService as NestJwtService} from '@nestjs/jwt';
import { UserInterface } from '../../../modules/auth/interface/user.interface';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  async generateAccessToken(user: UserInterface): Promise<any> {
    const payload: {} = {sub: user._id, email: user.email};
    return this.jwtService.sign(payload, {expiresIn: '7d' });
  }
  async generateRefreshToken(user: UserInterface): Promise<any> {
    const payload: {} = {sub: user._id};
    return this.jwtService.sign(payload, {expiresIn: '60d' });
  }
  async verifyToken(token: string): Promise<any> {
    try{
      return this.jwtService.verify(token);
    }catch (err){
      throw new UnauthorizedException({message: 'Invalid or expired token' });
    }
  }
}