import {
  BadRequestException,
  Body,
  Controller, Get,
  HttpStatus, Param, Patch,
  Post, Query, Req,
  Res,
  UseFilters, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { RegisterAuthDto } from '../auth/dto/register-auth.dto';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { Request, Response } from 'express';
import { ResetPassDto } from '../auth/dto/reset-pass.dto';
import { InstructorService } from './instructor.service';
import { InstructorRegisterDto } from './dto/instructor_register.dto';
import { TwilioService } from '../../shared/services/twilio.service';
import { VerifyOtpByPhoneDto } from './dto/verify_otp_byPhone.dto';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { InstructorLoginDto } from './dto/instructor_login.dto';
import { VerifyOtpByEmailDto } from './dto/verify_otp_byEmail.dto';
import { UpdateInstructorDto } from './dto/instructor_update.dto';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { PaginationDTO } from '../../common/dto/pagination.dto';

@ApiTags('Instructor')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)

@Controller('instructor')
export class InstructorController {
  constructor(
    private readonly instructorService: InstructorService,
    private readonly twilioService: TwilioService,
    private readonly jwtService: JwtService
  ) {}

  // api/v1/instructor/register
  @ApiOperation({ summary: 'Register a new instructor and send OTP' })
  @ApiBody({ type: InstructorRegisterDto })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTP sent successfully')
  @Post('register')
  async saveTemporaryRegistrationData(@Body() instructorRegisterDto: InstructorRegisterDto) {
    try {
      // Save form data temporarily without registrationId
      await this.instructorService.saveTemporaryRegistrationData(instructorRegisterDto);

      // Send OTP and get otpSid
      const otpSid = await this.twilioService.sendOtp(instructorRegisterDto.phone);
      return { otpSid };
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/verify-otp
  @ApiOperation({ summary: 'Verify OTP and complete instructor registration' })
  @ApiBody({ type: VerifyOtpByPhoneDto })
  @ApiResponse({
    status: 201,
    description: 'Registration and authentication successful',
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('verify-otp')
  async verifyOtp(@Body() otp: VerifyOtpByPhoneDto, @Res() res: Response) {
    try {
      const verificationStatus = await this.twilioService.verifyOtp(otp);
      if (verificationStatus !== 'approved') {
        throw new BadRequestException({ message: 'Invalid OTP' });
      }
      const { accessToken, refreshToken, instructor } =
        await this.instructorService.completeRegistration(otp.phone);

      this.jwtService.setAuthCookies(res, accessToken, refreshToken)

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Registration and authentication successful',
        data: {
          accessToken,
          refreshToken,
          instructor,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/login
  @ApiOperation({ summary: 'Login instructor' })
  @ApiBody({ type: InstructorLoginDto })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('login')
  async login(@Body() loginDto: InstructorLoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, instructor } =
        await this.instructorService.login(loginDto);

      this.jwtService.setAuthCookies(res, accessToken, refreshToken);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login and authentication successful',
        data: {
          accessToken,
          refreshToken,
          instructor,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/refresh-token
  @ApiOperation({ summary: 'Refresh instructor tokens' })
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
      const { accessToken, refreshToken: newRefreshToken } =
        await this.instructorService.refreshTokens(refreshToken);

      // Set new access token and refresh token in cookies
      this.jwtService.setAuthCookies(res, accessToken, refreshToken)

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/password/request-reset
  @ApiOperation({ summary: 'send OTP to reset instructor pass' })
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
      await this.instructorService.requestPasswordReset(email);
      return "OTP sent successfully";
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/password/verify-otp
  @ApiOperation({ summary: 'Verify OTP for instructor password reset' })
  @ApiBody({type: VerifyOtpByEmailDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTP verified successfully')
  @Post('password/verify-otp')
  async verifyOTP(@Body() verifyOtp: VerifyOtpByEmailDto): Promise<string> {
    try {
      await this.instructorService.verifyOtpAndAllowPasswordReset(verifyOtp);
      return "OTP verified successfully";
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/password/reset
  @ApiOperation({ summary: 'Reset instructor password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Password reset successfully')
  @Post('password/reset')
  async resetPassword(@Body() resetPasswordDto: ResetPassDto): Promise<string>  {
    try {
      await this.instructorService.isOtpVerified(resetPasswordDto.email);
      await this.instructorService.resetPassword(resetPasswordDto);
      return 'Password reset successfully' ;
    } catch (err) {
      throw err;
    }
  }

  // api/v1/instructor/getInstructor
  @ApiOperation({ summary: 'Get instructor for instructor' })
  @ApiResponse({ status: 201, description: 'Instructor retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Instructor retrieved successfully')
  @Roles(['instructor'])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Get("getInstructor")
  async getInstructor(@User() user: UserInterface): Promise<any>{
    try{
      const instructor = await this.instructorService.getInstructor(user.sub);
      return instructor;
    }catch(err){
      throw err;
    }
  }

  // api/v1/instructor/getInstructorById
  @ApiOperation({ summary: 'Get instructor for admin' })
  @ApiResponse({ status: 201, description: 'Instructor retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'instructorId', description: "Id for the instructor", type: 'string'})
  @ResponseMessage('Instructor retrieved successfully')
  @Roles(['admin'])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Get("getInstructor/:instructorId")
  async getInstructorById(@Param("instructorId") instructorId: string): Promise<any>{
    try{
      const instructor = await this.instructorService.getInstructor(instructorId);
      return instructor;
    }catch(err){
      throw err;
    }
  }

  // api/v1/instructor/getInstructors
  @ApiOperation({ summary: 'Get all instructors' })
  @ApiResponse({ status: 201, description: 'Instructors retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Instructors retrieved successfully')
  @Roles(['admin'])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Get("getInstructors")
  async getInstructors(@Query() paginationQuery: PaginationDTO): Promise<any>{
    try{
      const instructors = await this.instructorService.getAllInstructors(paginationQuery);
      return instructors;
    }catch(err){
      throw err;
    }
  }

  // api/v1/instructor
  @ApiOperation({ summary: 'Update instructor' })
  @ApiResponse({ status: 201, description: 'Instructor Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({type: UpdateInstructorDto})
  @ResponseMessage('Instructor updated successfully')
  @Roles(['instructor'])
  @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
  @Patch()
  async updateInstructor(
    @User() user: UserInterface,
    @Body() updateInstructorDto: UpdateInstructorDto
  ): Promise<any>{
    try{
      const respose = await this.instructorService.updateInstructor(user.sub, updateInstructorDto);
      return respose;
    }catch(err){
      throw err;
    }
  }
}
