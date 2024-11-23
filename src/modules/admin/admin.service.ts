import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Admin } from './schema/admin.scema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { EmailService } from '../../shared/services/email.service';
import { AdminRegisterDto } from './dto/admin_register.dto';
import { checkEmail } from '../../common/utils/email.util';
import { comparePass, hashPass } from '../../common/utils/bcrypt.uti';
import { AdminLoginDto } from './dto/admin_login.dto';
import { generateOtp } from '../../common/utils/generate-otp.util';
import { VerifyOtpByEmailDto } from './dto/verify_otp_byEmail.dto';
import { ResetPassDto } from './dto/reset_pass.dto';
import { UpdateAdminDto } from './dto/admin_update.dto';
import { AdminInterface } from './interface/admin.interface';
import { PaginationUtil } from './utils/pagination.util';
import { PaginationDTO } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    ) {}

  async saveTemporaryRegistrationData(admin: AdminRegisterDto) {
    const isEmailTaken =  await checkEmail(admin.email, this.adminModel);
    if (isEmailTaken) {
      throw new BadRequestException({ message: 'Email is already registered. Please use a different email.' });
    }

    admin.password = await hashPass(admin.password);

    await this.cacheManager.set(`verification-${admin.phone}`, admin );
  }

  async completeRegistration(phone: string) {
    const adminDto: AdminRegisterDto = await this.cacheManager.get(`verification-${phone}`);

    if (!adminDto) {
      throw new BadRequestException({ message: 'Registration data not found or expired.' });
    }
    adminDto.registrationDate = new Date();

    const newAdmin = await this.adminModel.create(adminDto);

    const accessToken = await this.jwtService.generateAccessToken(newAdmin);
    const refreshToken = await this.jwtService.generateRefreshToken(newAdmin);

    return {
      accessToken,
      refreshToken,
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role
      },
    };
  }

  async login(admin: AdminLoginDto) {
    const existingAdmin = await this.adminModel.findOne({ email: admin.email });
    if (!existingAdmin) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePass(admin.password, existingAdmin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const accessToken = await this.jwtService.generateAccessToken(existingAdmin);
    const refreshToken = await this.jwtService.generateRefreshToken(existingAdmin);

    return {
      accessToken,
      refreshToken,
      admin: {
        id: existingAdmin._id,
        email: existingAdmin.email,
        role: existingAdmin.role
      },
    };
  }

  // async refreshTokens(refreshToken: string) {
  //   const decodedToken = await this.jwtService.verifyToken(refreshToken);
  //   const instructor = await this.instructorModel.findById(decodedToken.sub);
  //   if (!instructor) {
  //     throw new UnauthorizedException('User not found');
  //   }
  //
  //   const newAccessToken = await this.jwtService.generateAccessToken(instructor);
  //   const newRefreshToken = await this.jwtService.generateRefreshToken(instructor);
  //
  //   return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  // }

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
    const admin = await this.adminModel.findOne({email: resetPass.email});
    if (!admin) {
      throw new UnauthorizedException('User not found');
    }
    admin.password = await hashPass(resetPass.password);
    await admin.save();
    await this.cacheManager.del(`otp-verified-${resetPass.email}`)
  }

  async getAdmin(adminId: string): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(adminId)
    const admin = await this.adminModel.findById(id, '-password')
    if(!admin){
      throw new UnauthorizedException('Admin not found');
    }
    return admin;
  }

  async getAllAdmins(paginationQuery: PaginationDTO) {
    // const filter = {password: 0};
    const allAdmins = await PaginationUtil(paginationQuery, this.adminModel);
    if(allAdmins.length == 0)
      throw new BadRequestException("There is no admin")
    return allAdmins
  }

  async updateInstructor(adminId: string , updateAdmin: UpdateAdminDto): Promise<AdminInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(adminId)
    const admin: AdminInterface = await this.adminModel.findByIdAndUpdate(
      id,
      updateAdmin,
      {new: true}
    );
    if(!admin)
      throw new BadRequestException("Admin not found");
    return admin;
  }

  async pushNewCourse(adminId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId):Promise<void>{
    const course = await this.adminModel.findByIdAndUpdate(
      adminId,
      { $push: { coursesId: courseId } },
      { new: true }
    );
  }

  async popCourse(adminId: string, courseId: mongoose.Types.ObjectId):Promise<void>{
    const admin = await this.getAdmin(adminId);
    admin.coursesId = admin.coursesId.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(courseId)
    );
    await admin.save();
  }
}
