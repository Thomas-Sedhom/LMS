import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose, { ClientSession, Model } from 'mongoose';
import { Video } from '../schema/video.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../schema/course.schema';
import { CourseDto } from '../dto/course.dto';
import { CourseInterface } from '../interface/course.interface';
import { VideoInterface } from '../interface/video.interface';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { session } from 'passport';
import { UpdateCourseDto } from '../dto/update_course.dto';
import { v4 as uuidv4 } from 'uuid';
import { VideoCipherService } from '../../../shared/services/videoCipher.service';
import { PaginationDTO } from '../../../common/dto/pagination.dto';
import { PaginationUtil } from '../utils/pagination.util';
import { InstructorService } from '../../instructor/instructor.service';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    private readonly videoCipherService: VideoCipherService,
    private readonly firebaseService: FirebaseService,
    private readonly instructorService: InstructorService,
    private readonly adminService: AdminService,

  ) {}

  async createCourseByInstructor(instructorID: string, course: CourseDto, files: any): Promise<CourseInterface> {

    const session: ClientSession = await this.courseModel.startSession();
    session.startTransaction();
    try{
      // Generate a unique ID for the folder
      const uniqueFolderId: string = uuidv4();
      const image = await this.firebaseService.uploadImageToCloud(files.coverImage, `\`${uniqueFolderId}\`/`);

      const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(instructorID)
      const createdDate: Date = new Date();

      const [response]: CourseInterface[] = await this.courseModel.create([{
        courseName: course.courseName,
        description: course.description,
        whatYouLearn: course.whatYouLearn,
        category: course.category,
        subCategory: course.subCategory,
        coverImage: image,
        instructorId: id,
        createdDate
      }], {session});

      await this.instructorService.pushNewCourse(id, response._id);

      await session.commitTransaction();
      return response;
    }catch(err){
      await session.abortTransaction();
      throw err;
    }finally{
      await session.endSession();
    }

  }

  async createCourseByAdmin(adminId: string, course: CourseDto, files: any): Promise<CourseInterface> {

    const session: ClientSession = await this.courseModel.startSession();
    session.startTransaction();
    try{
      // Generate a unique ID for the folder
      const uniqueFolderId: string = uuidv4();
      const image = await this.firebaseService.uploadImageToCloud(files.coverImage, `\`${uniqueFolderId}\`/`);

      const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(adminId)
      const createdDate: Date = new Date();

      const [response]: CourseInterface[] = await this.courseModel.create([{
        courseName: course.courseName,
        description: course.description,
        whatYouLearn: course.whatYouLearn,
        category: course.category,
        subCategory: course.subCategory,
        coverImage: image,
        instructorId: id,
        createdDate
      }], {session});

      await this.adminService.pushNewCourse(id, response._id);

      await session.commitTransaction();
      return response;
    }catch(err){
      await session.abortTransaction();
      throw err;
    }finally{
      await session.endSession();
    }
  }

  async findCourseById(courseId: mongoose.Types.ObjectId):Promise<any>{
    const course = await this.courseModel.findById(courseId);
    if(!course)
      throw new BadRequestException("Course not found");
  }

  async getCourse(courseId: string): Promise<CourseInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const course: CourseInterface = await this.courseModel
      .findById(id)
      .populate({
        path: 'videosId',  // field to populate
        select: '_id videoId videoTitle videoDescription index videoUrl uploadedAt',  // only select specific fields from the video model
      })
      .exec()
    return course;
  }

  async getCourseById(courseId: string): Promise<CourseInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const course: CourseInterface = await this.courseModel
      .findById(id)
      .exec()
    return course;
  }

  async getCourses(instructorId: string, pagination: PaginationDTO): Promise<CourseInterface[]> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(instructorId);
    let filter: {} = {instructorId: id};
    const courses: CourseInterface[] = await PaginationUtil(pagination, this.courseModel, filter);
    return courses;
  }

  async getAllCourses(paginationQuery: PaginationDTO): Promise<CourseInterface[]> {
    const allCourses = await PaginationUtil(paginationQuery, this.courseModel);
    return allCourses;
  }

  async updateCourse(courseId: string, updateCourse: UpdateCourseDto): Promise<CourseInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    await this.findCourseById(id);
    const course: CourseInterface = await this.courseModel.findByIdAndUpdate(id, updateCourse,);
    return course;
  }

  async updateCoverImageCourse(courseId: string, coverImage: any): Promise<CourseInterface> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
    const uniqueFolderId: string = uuidv4();

    const imageUrl: string = await this.firebaseService.uploadImageToCloud(coverImage, `\`${uniqueFolderId}\`/`)
    const course = await this.courseModel.findById(id);
    if(course.coverImage)
      await this.firebaseService.removeImageFromCloud(course.coverImage);
    course.coverImage = imageUrl;
    await course.save();
    return course;
  }

  async deleteCourse(courseId: string): Promise<any> {
    const session: ClientSession = await this.courseModel.startSession();
    session.startTransaction();
    try{
      const id: mongoose.Types.ObjectId  = new mongoose.Types.ObjectId(courseId);
      const course = await this.courseModel.findByIdAndDelete(id, {session});
      if (!course)
        throw new BadRequestException("Course not found");

      if(course.videosId.length > 0)
        await this.videoCipherService.deleteFolder(courseId);

     // Delete all videos associated with the course
      await this.videoModel.deleteMany({ courseId: id }, { session });

      // Commit the transaction
      await this.firebaseService.removeImageFromCloud(course.coverImage);

      const instructorId: string = course.instructorId.toString();

      // remove course id from course ids array in instructor object
      await this.instructorService.popCourse(instructorId, id);

      await session.commitTransaction();

      return course;
    }catch(error){
      await session.abortTransaction();
      throw error; // R
    }finally {
      // End the session
      await session.endSession();
    }
  }

  async deleteCourseByAdmin(courseId: string): Promise<any> {
    const session: ClientSession = await this.courseModel.startSession();
    session.startTransaction();
    try{
      const id: mongoose.Types.ObjectId  = new mongoose.Types.ObjectId(courseId);
      const course = await this.courseModel.findByIdAndDelete(id, {session});
      if (!course)
        throw new BadRequestException("Course not found");

      if(course.videosId.length > 0)
        await this.videoCipherService.deleteFolder(courseId);

      // Delete all videos associated with the course
      await this.videoModel.deleteMany({ courseId: id }, { session });

      // Commit the transaction
      await this.firebaseService.removeImageFromCloud(course.coverImage);

      const adminId: string = course.instructorId.toString();

      // remove course id from course ids array in instructor object
      await this.adminService.popCourse(adminId, id);

      await session.commitTransaction();

      return course;
    }catch(error){
      await session.abortTransaction();
      throw error; // R
    }finally {
      // End the session
      await session.endSession();
    }
  }
}