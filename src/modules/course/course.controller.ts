import {
  Body,
  Controller,
  Delete,
  Get,
  Param, Patch,
  Post,
  Query, UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from './service/course.service';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { VideoDto } from './dto/video.dto';
import { CourseDto } from './dto/course.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { VideoService } from './service/video.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from '../../shared/services/firebase.service';
import { UpdateCourseDto } from './dto/update_course.dto';
import { UpdateVideoDto } from './dto/update_video.dto'; // Import UUID generator

@ApiTags('course')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly videoService: VideoService,
  ) {}

  // api/v1/course
  @ApiOperation({ summary: 'Create new course' })
  @ApiConsumes('multipart/form-data') // Specifies the content type
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Upload the cover image for the course',
          example: 'Cover image file here',
        },
        courseName: {
          type: 'string',
          example: 'Python',
        },
        description: {
          type: 'string',
          example: 'This course covers advanced concepts in python',
        },
        whatYouLearn: {
          type: 'string',
          example: 'You will learn a lot',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Course created successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
  ]))
  @Post("/:instructorId")
  async createCourse(
    @Param('instructorId') instructorId: string,
    @Body() course: CourseDto,
    @UploadedFiles() files: {coverImage: Express.Multer.File[]}
  ): Promise<any>{
    try{
      const respose = await this.courseService.createCourse(instructorId, course, files);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/:courseId
  @ApiOperation({ summary: 'Get course' })
  @ApiResponse({ status: 201, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Course retrieved successfully')
  @Get("getCourse/:courseId")
  async getCourse(
    @Param('courseId') courseId: string,
  ): Promise<any>{
    try{
      const course = await this.courseService.getCourse(courseId);
      return course;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/:instructorId
  @ApiOperation({ summary: 'Get instructor courses' })
  @ApiResponse({ status: 201, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Courses retrieved successfully')
  @Get("instructorCourses/:instructorId")
  async getCourses(
    @Param('instructorId') instructorId: string,
  ): Promise<any>{
    try{
      const courses = await this.courseService.getCourses(instructorId);
      return courses;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 201, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Courses retrieved successfully')
  @Get()
  async getAllCourses(): Promise<any>{
    try{
      const allCourses = await this.courseService.getAllCourses();
      return allCourses;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/:courseId
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 201, description: 'Course Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Course updated successfully')
  @Patch(":courseId")
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourse: UpdateCourseDto
  ): Promise<any>{
    try{
      const respose = await this.courseService.updateCourse(courseId, updateCourse);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/:courseId
  @ApiOperation({ summary: 'Update cover image course' })
  @ApiConsumes('multipart/form-data') // Specifies the content type
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Upload the cover image for the course',
          example: 'Cover image file here',
        }
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Cover image course Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Cover image course updated successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
  ]))
  @Patch("coverImage/:courseId")
  async updateCoverImageCourse(
    @Param('courseId') courseId: string,
    @UploadedFiles() files: {coverImage: Express.Multer.File[]}
  ): Promise<any>{
    try{
      const respose = await this.courseService.updateCoverImageCourse(courseId, files.coverImage);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/:courseId
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 201, description: 'Course deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Course deleted successfully')
  @Delete(":courseId")
  async deleteCourse(
    @Param('courseId') courseId: string,
  ): Promise<any>{
    try{
      const respose = await this.courseService.deleteCourse(courseId);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/:courseId/upload-credentials
  @ApiOperation({ summary: "Upload new video credentials" })
  @ApiResponse({ status: 201, description: 'Credentials uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('credentials uploaded successfully')
  @Get(':courseId/upload-credentials')
  async getUploadCredentials(
    @Param('courseId') courseId: string,
    @Query('videoTitle') videoTitle: string,
  ) : Promise<any>{
    try{
      const data = await this.videoService.generateUploadCredentials(courseId, videoTitle);
      return data
    }catch (err){
      throw err;
    }
  }

  // api/v1/course/:courseId/save-video
  @ApiOperation({ summary: "Save new video" })
  @ApiBody({ type: VideoDto })
  @ApiResponse({ status: 201, description: 'Video saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Video saved successfully')
  @Post(':courseId/save-video')
  async saveVideoDetails(
    @Param('courseId') courseId: string,
    @Body() videoData: VideoDto
  ) : Promise<any>{
    try{
      const video = await this.videoService.saveVideo(courseId, videoData);
      return video;
    }catch (err){
      throw err;
    }
  }

  // api/v1/course/:videoId/otp
  @ApiOperation({ summary: "Get video OTP" })
  @ApiResponse({ status: 201, description: 'OTP got successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTP got successfully')
  @Get(':videoId/otp')
  async getOtp(@Param('videoId') videoId: string): Promise<any> {
    try{
      const data = this.videoService.getVideoOTP(videoId);
      return data;
    }catch (err){
      throw err;
    }
  }

  // api/v1/course/:courseId/videos/otps
  @ApiOperation({ summary: "Get videos OTP" })
  @ApiResponse({ status: 201, description: 'OTPs got successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('OTPs got successfully')
  @Get(':courseId/videos/otps')
  async getVideosOTPForCourse(@Param('courseId') courseId: string): Promise<any> {
    try{
      const OTPs = await this.videoService.getVideosOTPForCourse(courseId);
      return OTPs
    }catch (err){
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update video' })
  @ApiResponse({ status: 201, description: 'Video Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Video updated successfully')
  @Patch('videos/videoData/:videoId')
  async updateVideoData(
    @Param("videoId") videoId: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ):Promise<any>{
    try{
      // const video = await this.videoService.updateVideoData(videoId, updateVideoDto);
      // return video
    }catch (err){
      throw err
    }
  }

  // api/v1/course/deleteVideos
  @ApiOperation({ summary: "Delete videos" })
  @ApiResponse({ status: 201, description: 'Videos deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Videos deleted successfully')
  @Delete("deleteVideos")
  async deleteVideos(@Body('videoIds') videoIds: string[]): Promise<any> {
    try{
      // Step 1: Delete videos from VideoCipher
      await this.videoService.deleteVideos(videoIds);
      // Step 2: Remove video entries from MongoDB
      await this.videoService.removeVideoFromDB(videoIds);
      return { message: 'Videos deleted successfully' };
    }catch (err){
      throw err;
    }
  }
}
