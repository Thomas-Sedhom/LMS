import {
  BadRequestException,
  Body,
  Controller, Get,
  HttpStatus, Patch,
  Post, Query, Req,
  Res,
  UseFilters, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { AdminService } from './admin.service';
import { AdminRegisterDto } from './dto/admin_register.dto';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { TwilioService } from '../../shared/services/twilio.service';
import { VerifyOtpByPhoneDto } from './dto/verify_otp_byPhone.dto';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { Request, Response } from 'express';
import { AdminLoginDto } from './dto/admin_login.dto';
import { VerifyOtpByEmailDto } from './dto/verify_otp_byEmail.dto';
import { ResetPassDto } from './dto/reset_pass.dto';
import { Roles } from '../../common/decorators/role.decorator';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { UpdateAdminDto } from './dto/admin_update.dto';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { RoleEnum } from '../../common/enum/role.enum';

@ApiTags('Admin')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly twilioService: TwilioService,
    private readonly jwtService: JwtService,
  ) {}

  // api/v1/admin/register
  @ApiOperation({ summary: 'Register a new admin and send OTP' })
  @ApiBody({ type: AdminRegisterDto })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTP sent successfully')
  @Post('register')
  async saveTemporaryRegistrationData(@Body() adminRegisterDto: AdminRegisterDto) {
    try {
      // Save form data temporarily without registrationId
      await this.adminService.saveTemporaryRegistrationData(adminRegisterDto);

      // Send OTP and get otpSid
      const otpSid = await this.twilioService.sendOtp(adminRegisterDto.phone);
      return { otpSid };
    } catch (err) {
      throw err;
    }
  }

  // api/v1/admin/verify-otp
  @ApiOperation({ summary: 'Verify OTP and complete admin registration' })
  @ApiBody({ type: VerifyOtpByPhoneDto })
  @ApiResponse({ status: 201, description: 'Registration and authentication successful', })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('verify-otp')
  async verifyOtp(@Body() otp: VerifyOtpByPhoneDto, @Res() res: Response) {
    try {
      const verificationStatus = await this.twilioService.verifyOtp(otp);
      if (verificationStatus !== 'approved') {
        throw new BadRequestException({ message: 'Invalid OTP' });
      }
      const { accessToken, refreshToken, admin } =
        await this.adminService.completeRegistration(otp.phone);

      this.jwtService.setAuthCookies(res, accessToken, refreshToken)

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Registration and authentication successful',
        data: {
          accessToken,
          refreshToken,
          admin,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  // api/v1/admin/login
  @ApiOperation({ summary: 'Login admin' })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('login')
  async login(@Body() loginDto: AdminLoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, admin } =
        await this.adminService.login(loginDto);

      this.jwtService.setAuthCookies(res, accessToken, refreshToken);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login and authentication successful',
        data: {
          accessToken,
          refreshToken,
          admin,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  // api/v1/admin/refresh-token
  // @ApiOperation({ summary: 'Refresh admin tokens' })
  // @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  // @ApiResponse({ status: 400, description: 'Refresh token not found' })
  // @ApiResponse({ status: 500, description: 'Internal server error' })
  // @Post('refresh-token')
  // async refreshToken(@Res() res: Response, @Req() req: Request) {
  //   try {
  //     // Extract refresh token from HTTP-only cookie
  //     const refreshToken = req.cookies.refreshToken;
  //
  //     if (!refreshToken) {
  //       throw new BadRequestException({ message: 'Refresh token not found' });
  //     }
  //     const { accessToken, refreshToken: newRefreshToken } =
  //       await this.adminService.refreshTokens(refreshToken);
  //
  //     // Set new access token and refresh token in cookies
  //     this.jwtService.setAuthCookies(res, accessToken, refreshToken)
  //
  //     return res.status(HttpStatus.OK).json({
  //       statusCode: HttpStatus.OK,
  //       message: 'Token refreshed successfully',
  //       data: {
  //         accessToken,
  //         refreshToken,
  //       },
  //     });
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  // api/v1/admin/password/request-reset
  @ApiOperation({ summary: 'send OTP to reset admin pass' })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string', example: 'thomassedhom97@gmail.com' } },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTP sent successfully')
  @Post('password/request-reset')
  async requestPasswordReset(@Body('email') email: string): Promise<string> {
    try {
      await this.adminService.requestPasswordReset(email);
      return "OTP sent successfully";
    } catch (err) {
      throw err;
    }
  }

  // api/v1/admin/password/verify-otp
  @ApiOperation({ summary: 'Verify OTP for admin password reset' })
  @ApiBody({type: VerifyOtpByEmailDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTP verified successfully')
  @Post('password/verify-otp')
  async verifyOTP(@Body() verifyOtp: VerifyOtpByEmailDto): Promise<string> {
    try {
      await this.adminService.verifyOtpAndAllowPasswordReset(verifyOtp);
      return "OTP verified successfully";
    } catch (err) {
      throw err;
    }
  }

  // api/v1/admin/password/reset
  @ApiOperation({ summary: 'Reset admin password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Password reset successfully')
  @Post('password/reset')
  async resetPassword(@Body() resetPasswordDto: ResetPassDto): Promise<string>  {
    try {
      await this.adminService.isOtpVerified(resetPasswordDto.email);
      await this.adminService.resetPassword(resetPasswordDto);
      return 'Password reset successfully' ;
    } catch (err) {
      throw err;
    }
  }

  // api/v1/admin/getAdmin
  @ApiOperation({ summary: 'Get admin' })
  @ApiResponse({ status: 201, description: 'Admin retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Admin retrieved successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Get("getAdmin")
  async getAdmin(@User() user: UserInterface): Promise<any>{
    try{
      const admin = await this.adminService.getAdmin(user.sub);
      return admin;
    }catch(err){
      throw err;
    }
  }

  // api/v1/admin/getAdmins
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 201, description: 'Admins retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'page', description: 'Page number for pagination', type: Number})
  @ApiQuery({ name: 'limit', description: 'Limit of items per page for pagination', type: Number})
  @ResponseMessage('Admins retrieved successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Get("getAdmins")
  async getAdmins(@Query() pagination: PaginationDTO): Promise<any>{
    try{
      const admins = await this.adminService.getAllAdmins(pagination);
      return admins;
    }catch(err){
      throw err;
    }
  }

  // api/v1/admin
  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ status: 201, description: 'Admin Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({type: UpdateAdminDto})
  @ResponseMessage('Admin updated successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Patch()
  async updateAdmin(
    @User() user: UserInterface,
    @Body() updateAdminDto: UpdateAdminDto
  ): Promise<any>{
    try{
      const respose = await this.adminService.updateInstructor(user.sub, updateAdminDto);
      return respose;
    }catch(err){
      throw err;
    }
  }
}
