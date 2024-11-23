import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Instructor } from './schema/instructor.schema';
import { checkEmail } from '../../common/utils/email.util';
import { comparePass, hashPass } from '../../common/utils/bcrypt.uti';
import { generateOtp } from '../../common/utils/generate-otp.util';
import { VerifyOtpByEmailDto } from '../auth/dto/verify-otp-by-email.dto';
import { ResetPassDto } from '../auth/dto/reset-pass.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '../../shared/modules/jwt/jwt.service';
import { InstructorRegisterDto } from './dto/instructor_register.dto';
import { InstructorLoginDto } from './dto/instructor_login.dto';
import { EmailService } from '../../shared/services/email.service';
import { InstructorInterface } from './interface/instructor.interface';
import { UpdateInstructorDto } from './dto/instructor_update.dto';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { PaginationUtil } from './utils/pagination.util';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel('Instructor') private readonly instructorModel: Model<Instructor>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async saveTemporaryRegistrationData(instructor: InstructorRegisterDto) {
    const isEmailTaken =  await checkEmail(instructor.email, this.instructorModel);
    if (isEmailTaken) {
      throw new BadRequestException({ message: 'Email is already registered. Please use a different email.' });
    }

    instructor.password = await hashPass(instructor.password);

    await this.cacheManager.set(`verification-${instructor.phone}`, instructor );
  }

  async completeRegistration(phone: string) {
    const instructorDto: InstructorRegisterDto = await this.cacheManager.get(`verification-${phone}`);

    if (!instructorDto) {
      throw new BadRequestException({ message: 'Registration data not found or expired.' });
    }
    instructorDto.registrationDate = new Date();

    const newInstructor = await this.instructorModel.create(instructorDto);

    const accessToken = await this.jwtService.generateAccessToken(newInstructor);
    const refreshToken = await this.jwtService.generateRefreshToken(newInstructor);

    return {
      accessToken,
      refreshToken,
      instructor: {
        id: newInstructor._id,
        email: newInstructor.email,
        role: newInstructor.role
      },
    };
  }

  async login(instructor: InstructorLoginDto) {
    const existingInstructor = await this.instructorModel.findOne({ email: instructor.email });
    if (!existingInstructor) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePass(instructor.password, existingInstructor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const accessToken = await this.jwtService.generateAccessToken(existingInstructor);
    const refreshToken = await this.jwtService.generateRefreshToken(existingInstructor);

    return {
      accessToken,
      refreshToken,
      instructor: {
        id: existingInstructor._id,
        email: existingInstructor.email,
        role: existingInstructor.role
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const decodedToken = await this.jwtService.verifyToken(refreshToken);
    const instructor = await this.instructorModel.findById(decodedToken.sub);
    if (!instructor) {
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = await this.jwtService.generateAccessToken(instructor);
    const newRefreshToken = await this.jwtService.generateRefreshToken(instructor);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
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
    const instructor = await this.instructorModel.findOne({email: resetPass.email});
    if (!instructor) {
      throw new UnauthorizedException('User not found');
    }
    instructor.password = await hashPass(resetPass.password);
    await instructor.save();
    await this.cacheManager.del(`otp-verified-${resetPass.email}`)
  }

  async getInstructor(instructorId: string): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(instructorId)
    const instructor = await this.instructorModel
      .findById(id, '-password')
      .populate({
      path: 'coursesId',
      select: '_id courseName description whatYouLearn coverImage videosId createdDate',
    });
    if(!instructor){
      throw new UnauthorizedException('Instructor not found');
    }
    return instructor;
  }

  async getAllInstructors(paginationQuery: PaginationDTO) {
    const instructors = await PaginationUtil(paginationQuery, this.instructorModel)
    if(instructors.length == 0)
      throw new BadRequestException("There is no instructors")
    return instructors
  }

  async updateInstructor(instructorId: string , updateInstructor: UpdateInstructorDto): Promise<InstructorInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(instructorId)
    const instructor: InstructorInterface = await this.instructorModel.findByIdAndUpdate(
      id,
      updateInstructor,
      {new: true}
    );
    if(!instructor)
      throw new BadRequestException("Instructor not found");
    return instructor;
  }

  async pushNewCourse(instructorId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId):Promise<void>{
    const course = await this.instructorModel.findByIdAndUpdate(
      instructorId,
      { $push: { coursesId: courseId } },
      { new: true }
    );
  }

  async popCourse(instructorId: string, courseId: mongoose.Types.ObjectId):Promise<void>{
    const instructor = await this.getInstructor(instructorId);
    instructor.coursesId = instructor.coursesId.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(courseId)
    );
    await instructor.save();
  }
}
