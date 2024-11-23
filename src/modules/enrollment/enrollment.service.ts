import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Enrollment } from './schema/enrollment.schema';
import { EnrollmentInterface } from './interface/enrollment.interface';
import { CourseService } from '../course/service/course.service';
import { CourseInterface } from '../course/interface/course.interface';
import { VideoService } from '../course/service/video.service';
import { VideoInterface } from '../course/interface/video.interface';
import { StatusEnum } from './enums/status.enum';
import * as path from 'node:path';
import { PaginationUtil } from './utils/pagination.util';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { Code } from './schema/code.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel('Code') private readonly codeModel: Model<Code>,
    private readonly  courseService: CourseService,
    private readonly videoService: VideoService
    ) {}

  async enrollNewStudent(studentId: string, courseId: string): Promise<EnrollmentInterface> {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const checkEnrollment: EnrollmentInterface = await this.enrollmentModel
      .findOne({studentId: student_id, courseId: course_id});
    if(checkEnrollment){
      throw new BadRequestException('Enrollment already exists');
    }
    const enrollment: EnrollmentInterface = await this.enrollmentModel.create({
      studentId: student_id,
      courseId: course_id
    })
    return enrollment
  }
  
  async getAllCoursesForStudent(studentId: string, paginationQuery: PaginationDTO): Promise<any> {
    console.log(paginationQuery)
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const populate = {
      path: 'courseId',
      select: '_id courseName description whatYouLearn coverImage instructorId'
    };
    const filter = { studentId: id };
    const enrollments = await  PaginationUtil(paginationQuery, this.enrollmentModel, filter, populate);
    return enrollments;
  }

  async getAllStudentsForCourse(courseId: string, paginationQuery: PaginationDTO): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const populate = {
      path: 'studentId',
      select: '_id firstName lastName email'
    };
    const filter = { courseId: id };
    const enrollments = await  PaginationUtil(paginationQuery, this.enrollmentModel, filter, populate);
    return enrollments;
  }

  async deleteEnrollment(studentId: string, courseId: string): Promise<EnrollmentInterface> {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);

    const deletedEnrollment: EnrollmentInterface = await this.enrollmentModel
      .findOneAndDelete({studentId: student_id, courseId: course_id});

    return deletedEnrollment;
  }

  async updateProgress(studentId: string, courseId: string, videoId: string): Promise<any> {
    const course: CourseInterface = await this.courseService.getCourseById(courseId);
    const videosNum = course.videosId.length;

    const video: VideoInterface = await this.videoService.getVideoById(videoId);
    const videoIndex = Number(video.index);

    const perc = (videoIndex / videosNum) * 100;

    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId)
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId)

    const enrollment = await this.enrollmentModel.findOne({
      studentId: student_id,
      courseId: course_id
    });

    if(perc == 100)
      enrollment.status = StatusEnum.completed;
    else{
      enrollment.status = StatusEnum.active
    }

    enrollment.progress = perc;

    await enrollment.save();
    return enrollment;
  }
  async getAllActiveEnrollments(paginationQuery: PaginationDTO): Promise<any> {
    const populate1 = {
      path: "courseId",
      select: "_id courseName description whatYouLearn coverImage instructorId"
    };
    const populate2 = {
      path: "studentId",
      select:"_id firstName lastName email"
    }

    const filter = {active: true}
    const enrollments = await  PaginationUtil(paginationQuery, this.enrollmentModel, filter, populate1, populate2);
    return enrollments;
  }

  async getAllInactiveEnrollments(paginationQuery: PaginationDTO): Promise<any> {
    const populate1 = {
      path: "courseId",
      select: "_id courseName description whatYouLearn coverImage instructorId"
    };
    const populate2 = {
      path: "studentId",
      select:"_id firstName lastName email"
    }
    const filter = {active: false}

    const enrollments = await  PaginationUtil(paginationQuery, this.enrollmentModel, filter, populate1, populate2);
    return enrollments;
  }

  async getEnrollment(studentId: string, courseId: string) {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const enrollments = await this.enrollmentModel
      .findOne({studentId: student_id, courseId: course_id})
      .populate({
        path: 'courseId',
        select: '_id courseName description whatYouLearn coverImage instructorId'
      });
    return enrollments;
  }

  async activeEnrollment(studentId: string, courseId: string) {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const course = await this.enrollmentModel.findOneAndUpdate(
      {studentId: student_id, courseId: course_id},
      {active: true},
      {new: true}
    );
    return course;
  }

  async createCode(code: string) {
    const otp = await this.codeModel.create({code});
    return otp;
  }

  async getAllCodes(paginationQuery: PaginationDTO) {
    const codes = await  PaginationUtil(paginationQuery, this.codeModel);
    return codes;
  }

  async validateCode(studentId: string , courseId: string,  code: string) {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId);
    const course_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);

    const session = await this.codeModel.startSession();
    session.startTransaction()
    try{
      const otp = await this.codeModel.findOne({code}).session(session);
      if(!otp){
        throw new BadRequestException("Code not found")
      }
      await this.codeModel.findOneAndDelete({code}).session(session)

      const activeEnrollment = await this.enrollmentModel.findOneAndUpdate(
        {studentId: student_id, courseId: course_id},
        {active: true},
        {new: true},
      )
      await session.commitTransaction();
      return activeEnrollment;
    }catch (err){
      await session.abortTransaction()
      throw err;
    }finally {
      await session.endSession();
    }

  }
}
