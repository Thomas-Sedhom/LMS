import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { checkEmail } from '../../common/utils/email.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from './interface/user.interface';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { comparePass, hashPass } from '../../common/utils/bcrypt.uti';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TwilioService } from '../../shared/services/twilio.service';
import { VerifyOtpByPhoneDto } from './dto/verify-otp-by-phone.dto';
import { ResetPassDto } from './dto/reset-pass.dto';
import { generateOtp } from '../../common/utils/generate-otp.util';
import { MailgunService } from '../../shared/services/mailgun.service';
import { VerifyOtpByEmailDto } from './dto/verify-otp-by-email.dto';
import { EmailService } from '../../shared/services/email.service';
import { Instructor } from '../instructor/schema/instructor.schema';
import { Admin } from '../admin/schema/admin.scema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Instructor.name) private readonly instructorModel: Model<Instructor>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async saveTemporaryRegistrationData(user: RegisterAuthDto) {
    const isEmailTaken =  await checkEmail(user.email, this.userModel);
    if (isEmailTaken) {
      throw new BadRequestException({ message: 'Email is already registered. Please use a different email.' });
    }

    user.password = await hashPass(user.password);

    await this.cacheManager.set(`verification-${user.phone}`, user );
  }

  async completeRegistration(phone: string) {
    const userDto: RegisterAuthDto = await this.cacheManager.get(`verification-${phone}`);

    if (!userDto) {
      throw new BadRequestException({ message: 'Registration data not found or expired.' });
    }
    userDto.registrationDate = new Date();

    const newUser = await this.userModel.create(userDto);

    const accessToken = await this.jwtService.generateAccessToken(newUser);
    const refreshToken = await this.jwtService.generateRefreshToken(newUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
    };
  }

  async login(user: LoginAuthDto) {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (!existingUser) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePass(user.password, existingUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const accessToken = await this.jwtService.generateAccessToken(existingUser);
    const refreshToken = await this.jwtService.generateRefreshToken(existingUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const decodedToken = await this.jwtService.verifyToken(refreshToken);
    console.log(decodedToken)
    let data: any
    if(decodedToken.role == "student")
      data = await this.userModel.findById(decodedToken.sub);
    else if(decodedToken.role == "instructor")
      data = await this.instructorModel.findById(decodedToken.sub);
    else
      data = await this.adminModel.findById(decodedToken.sub);

    if (!data) throw new UnauthorizedException('User not found');

    const newAccessToken = await this.jwtService.generateAccessToken(data);
    const newRefreshToken = await this.jwtService.generateRefreshToken(data);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async validateOAuthGoogleLogin(profile: GoogleProfile): Promise<any> {
    const userObj: UserInterface = {};
     userObj.email = profile.emails[0].value;
    let user: UserInterface = await this.userModel.findOne({ email: userObj.email });
    if (!user) {
      const nameParts = profile.displayName.split(' '); // Split displayName into first and last name
      userObj.firstName = nameParts[0] || ''; // Default to empty string if not provided
      userObj.lastName = nameParts[1] || ''; // Default to empty string if not provided
      userObj.password = null;
      userObj.phone = null;
      userObj.registrationDate = new Date()

      user = await this.userModel.create(userObj);
    }

    const accessToken = await this.jwtService.generateAccessToken(user);
    const refreshToken = await this.jwtService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }
  async validateOAuthFacebookLogin(profile: FacebookProfile): Promise<any> {
    const userObj: UserInterface = {};
    userObj.email = profile.emails[0].value;
    let user: UserInterface = await this.userModel.findOne({ email: userObj.email });
    if (!user) {
      userObj.firstName = profile._json.first_name; // Default to empty string if not provided
      userObj.lastName = profile._json.last_name; // Default to empty string if not provided
      userObj.password = null;
      userObj.phone = null;
      userObj.registrationDate = new Date();

      user = await this.userModel.create(userObj);
    }

    const accessToken = await this.jwtService.generateAccessToken(user);
    const refreshToken = await this.jwtService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }

  async requestPasswordReset(email: string): Promise<any> {
    const otpCode = generateOtp()
    await this.emailService.sendOtpEmail(email, otpCode);
  }

  async verifyOtpAndAllowPasswordReset(verifyOtp: VerifyOtpByEmailDto): Promise<void> {
    await this.emailService.verifyOtpVerification(verifyOtp);
    await this.cacheManager.set(`otp-verified-${verifyOtp.email}`, true)
  }

  async isOtpVerified(email: string): Promise<void> {
    const isVerified = await this.cacheManager.get(`otp-verified-${email}`);
    if(!isVerified) {
      throw new BadRequestException({ message: 'OTP has not been verified. You cannot reset the password without OTP verification.' });
    }
  }

  async resetPassword(resetPass: ResetPassDto): Promise <void>{
    const user = await this.userModel.findOne({email: resetPass.email});
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.password = await hashPass(resetPass.password);
    await user.save();
    await this.cacheManager.del(`otp-verified-${resetPass.email}`)
  }
}
