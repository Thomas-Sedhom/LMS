import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException, InternalServerErrorException,
  Post,
  Req,
  Res, UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Request, Response } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TwilioService } from '../../shared/services/twilio.service';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { FacebookAuthGuard } from '../../common/guards/facebook-auth.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';

@ApiTags("Auth")
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twilioService: TwilioService,
  ) {}

  // api/v1/auth/register
  @ApiOperation({ summary: 'Register a new user and send OTP' })
  @ApiBody({ type: RegisterAuthDto })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })

  @ResponseMessage("OTP sent successfully")
  @Post("register")
  async saveTemporaryRegistrationData(@Body() registerDto: RegisterAuthDto) {
    try {
      // Save form data temporarily without registrationId
      await this.authService.saveTemporaryRegistrationData(registerDto);

      // Send OTP and get otpSid
      const otpSid = await this.twilioService.sendOtp(registerDto.phone);
      return { otpSid };
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  // api/v1/auth/verify-otp
  @ApiOperation({ summary: 'Verify OTP and complete registration' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 201, description: 'Registration and authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('verify-otp')
  async verifyOtp(@Body() otp: VerifyOtpDto, @Res() res: Response) {
    try {
      const verificationStatus = await this.twilioService.verifyOtp(otp);
      if (verificationStatus !== 'approved') {
        throw new BadRequestException({ message: 'Invalid OTP' });
      }
      const { accessToken, refreshToken, user } = await this.authService.completeRegistration(otp.phone);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 604800000, // 7 days
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months
      });

      return res.json({
        statusCode: 201,
        message: "Registration and authentication successful",
        data: {
          accessToken,
          refreshToken,
          user,
        }
      });
    } catch (err) {
      throw new BadRequestException({
        statusCode: err.statusCode,
        message: err.message,
      });
    }
  }

  // api/v1/auth/login
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post("login")
  async login(@Body() loginDto: LoginAuthDto, @Res() res: Response){
    try{
      const { accessToken, refreshToken, user } = await this.authService.login(loginDto);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 604800000, // 7 days
      });
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months
      })
      return res.json({
        accessToken,
        refreshToken,
        user,
        message: 'Authentication successful',
      });
    }catch (err){
      throw new BadRequestException({ message: err.message });
    }
  }

  // api/v1/auth/refresh-token
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Refresh token not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('refresh-token')
  async refreshToken(@Res() res: Response, @Req() req: Request) {
    try {
      // Extract refresh token from HTTP-only cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new BadRequestException({ message: 'Refresh token not found' });
      }
      const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(refreshToken);

      // Set new access token and refresh token in cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 604800000, // 7 days
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months
      });

      return res.json({ message: 'Token refreshed successfully' });
    } catch (err) {
      throw new BadRequestException({ message: err.message });
    }
  }

  // api/v1/auth/facebook/login
  @ApiOperation({ summary: 'Facebook login' })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook login' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('facebook/login')
  @UseGuards(FacebookAuthGuard)
  async handleFacebookLogin() {
    return {msg: "Facebook Authentication"};
  }

  // api/v1/auth/facebook/redirect
  @ApiOperation({ summary: 'Facebook redirect' })
  @ApiResponse({ status: 302, description: 'Handles Facebook login redirect' })
  @ApiResponse({ status: 500, description: 'Internal server error' })

  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  async handleFacebookRedirect(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken, user }: any = req.user;
    // Set new access token and refresh token in cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 604800000, // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months
    });

    res.redirect("https://leqaa.life/login.html")
  }

  // api/v1/auth/google/login
  @ApiOperation({ summary: 'Google login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login' })
  @ApiResponse({ status: 500, description: 'Internal server error' })

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleLogin() {
    return {msg: "Google Authentication"};
  }

  // api/v1/auth/google/redirect
  @ApiOperation({ summary: 'Google redirect' })
  @ApiResponse({ status: 302, description: 'Handles Google login redirect' })
  @ApiResponse({ status: 500, description: 'Internal server error' })

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken, user }: any = req.user;
    // Set new access token and refresh token in cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 604800000, // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months
    });

    res.redirect("https://leqaa.life/login.html")
  }
}
