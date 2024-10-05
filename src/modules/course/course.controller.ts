import {
  BadRequestException,
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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { VideoService } from './service/video.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateCourseDto } from './dto/update_course.dto';
import { UpdateVideoDataDto } from './dto/update_video_data.dto';
import { UpdateVideoDto } from './dto/update_video.dto';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { QuestionDto } from './dto/question.dto';
import { FirebaseService } from '../../shared/services/firebase.service';
import { QuestionService } from './service/question.service';
import { UpdateQuestionDataDto } from './dto/update_question_data.dto';

@ApiTags('course')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly videoService: VideoService,
    private readonly questionService: QuestionService,
    private readonly firebaseService: FirebaseService
  ) {}

  // api/v1/course
  @ApiOperation({ summary: 'Create new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "instructorId", description: "ID of the instructor", type: String})
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
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
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
  @ApiParam({name: "instructorId", description: "ID of the instructor", type: String})
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
  @ApiQuery({ name: 'page', description: 'Page number for pagination', type: Number})
  @ApiQuery({ name: 'limit', description: 'Limit of items per page for pagination', type: Number})
  @ResponseMessage('Courses retrieved successfully')
  @Get()
  async getAllCourses(@Query() pagination: PaginationDTO): Promise<any>{
    try{
      console.log(pagination)
      const allCourses = await this.courseService.getAllCourses(pagination);
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
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
  @ApiBody({type: UpdateCourseDto})
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
  @ApiResponse({ status: 201, description: 'Cover image course Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description:"ID of the course", type: String})
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
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
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
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
  @ApiQuery({ name: 'videoTitle', description: 'Title of the video to upload', type: String, })
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
  @ApiParam({ name: 'courseId', description: 'ID of the course', type: String })
  @ApiBody({type: VideoDto})
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
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ResponseMessage('OTP got successfully')
  // videoId => vidCipher ID
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
  @ApiParam({ name: 'courseId', description: 'ID of the course', type: String })
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

  @ApiOperation({ summary: 'Update video data' })
  @ApiResponse({ status: 201, description: 'Video data Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ApiBody({ type: UpdateVideoDataDto })
  @ResponseMessage('Video data updated successfully')
  // videoId => mongo ID
  @Patch('videos/videoData/:videoId')
  async updateVideoData(
    @Param("videoId") videoId: string,
    @Body() updateVideoDataDto: UpdateVideoDataDto,
  ):Promise<any>{
    try{
      const video = await this.videoService.updateVideoData(videoId, updateVideoDataDto);
      return video
    }catch (err){
      throw err
    }
  }

  @ApiOperation({ summary: 'Update video' })
  @ApiResponse({ status: 201, description: 'Video Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ApiBody({ type: UpdateVideoDto })
  @ResponseMessage('Video updated successfully')
  // videoId => mongo ID
  @Patch('videos/:videoId')
  async updateVideo(
    @Param("videoId") videoId: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ):Promise<any>{
    try{
      const video = await this.videoService.updateVideo(videoId, updateVideoDto);
      return video
    }catch (err){
      throw err
    }
  }

  // api/v1/course/deleteVideos
  @ApiOperation({ summary: "Delete videos" })
  @ApiResponse({ status: 201, description: 'Videos deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'courseId', description: 'ID of the course', type: String })
  @ApiBody({
    description: 'Array of video IDs (VideoCipher IDs) to be deleted',
    schema: {
      type: 'object',
      properties: {
        videoIds: {
          type: 'array',
          items: {
            type: 'string',
            description: 'ID of the video',
          },
        },
      },
    },
  })
  @ResponseMessage('Videos deleted successfully')
  @Delete("deleteVideos/:courseId")
  // videoIds => vidCipher IDs
  async deleteVideos(
    @Body('videoIds') videoIds: string[],
    @Param("courseId") courseId: string
    ): Promise<any> {
    try{
      // Step 1: Remove video entries from MongoDB
      const course = await this.videoService.removeVideoFromDB(courseId, videoIds);

      // Step 2: Delete videos from VideoCipher
      await this.videoService.deleteVideos(videoIds);

      return course;
    }catch (err){
      throw err;
    }
  }

  @ApiOperation({ summary: 'Create new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "videoId", description: "ID of the video", type: String})
  @ResponseMessage('Question created successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'choice1', maxCount: 1 },
    { name: 'choice2', maxCount: 1 },
    { name: 'choice3', maxCount: 1 },
    { name: 'choice4', maxCount: 1 },
  ]))
  @Post("question/:videoId")
  async createQuestion(
    @Param('videoId') videoId: string,
    @Body() questionDTO: QuestionDto,
    @UploadedFiles() files: {
      choice1?: Express.Multer.File[],
      choice2?: Express.Multer.File[],
      choice3?: Express.Multer.File[],
      choice4?: Express.Multer.File[],
    }
  ): Promise<any>{
    try{
      let uploadPromises: Promise<void>[] = []
      if(files.choice1)
        uploadPromises.push(
          this.firebaseService.uploadImageToCloud(files.choice1, `\`${videoId}\`/`)
            .then((url) => { questionDTO.choice1 = url; })
        );
      if(files.choice2)
        uploadPromises.push(
          this.firebaseService.uploadImageToCloud(files.choice2, `\`${videoId}\`/`)
            .then((url) => { questionDTO.choice2 = url; })
        );
      if(files.choice3)
        uploadPromises.push(
          this.firebaseService.uploadImageToCloud(files.choice3, `\`${videoId}\`/`)
            .then((url) => { questionDTO.choice3 = url; })
        );
      if(files.choice4)
        uploadPromises.push(
          this.firebaseService.uploadImageToCloud(files.choice4, `\`${videoId}\`/`)
            .then((url) => { questionDTO.choice4 = url; })
        );
      const uploadResults = await Promise.allSettled(uploadPromises);

      uploadResults.forEach((result, index) => {
        if (result.status === "rejected") {
          throw new BadRequestException(`Upload failed: ${result.reason}`);
          // Optionally, you can add logic here to handle retries or mark which files failed.
        } else {
          console.log(`Upload succeeded with status : ${result.status}`);
        }
      });
      const question = await this.questionService.createQuestion(videoId, questionDTO);
      console.log(question)
      return question;
    }catch (err){
      throw err;
    }
  }
  // api/v1/course/uploadTaskVideo/:videoId/upload-credentials
  @ApiOperation({ summary: "Upload new video credentials for task" })
  @ApiResponse({ status: 201, description: 'Credentials uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "videoId", description: "ID of the video", type: String})
  @ApiQuery({ name: 'videoTitle', description: 'Title of the video to upload', type: String, })
  @ResponseMessage('credentials uploaded successfully')
  @Get('uploadTaskVideo/:videoId/upload-credentials')
  // videoId => main video id for the course => mongodb id
  async getUploadCredentialsForVideoTask(
    @Param('videoId') videoId: string,
    @Query('videoTitle') videoTitle: string,
  ) : Promise<any>{
    try{
      const data = await this.videoService.getUploadCredentialsForVideoTask(videoId, videoTitle);
      return data
    }catch (err){
      throw err;
    }
  }

  // api/v1/course/:videoId/saveTaskVideo
  @ApiOperation({ summary: "Save new task video" })
  @ApiResponse({ status: 201, description: 'Task video saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'courseId', description: 'ID of the course', type: String })
  @ApiBody({type: VideoDto})
  @ResponseMessage('Task video saved successfully')
  // videoId => mongoDB ID
  @Post(':videoId/saveTaskVideo')
  async saveTaskVideoDetails(
    @Param('videoId') videoId: string,
    @Query('videoDate') videoDate: string,
    @Body() videoData: VideoDto
  ) : Promise<any>{
    try{
      const video = await this.videoService.saveTaskVideo(videoId, videoDate, videoData);
      return video;
    }catch (err){
      throw err;
    }
  }

  // api/v1/course/:courseId
  @ApiOperation({ summary: 'Get question' })
  @ApiResponse({ status: 201, description: 'Question retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
  @ResponseMessage('Question retrieved successfully')
  @Get("getQuestion/:questionId")
  async getQuestions(
    @Param('questionId') questionId: string,
  ): Promise<any>{
    try{
      const course = await this.questionService.getQuestion(questionId);
      return course;
    }catch(err){
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update Question data' })
  @ApiResponse({ status: 201, description: 'Question data Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ApiBody({ type: UpdateQuestionDataDto })
  @ResponseMessage('Question data updated successfully')
  // questionId => mongo ID
  @Patch('questions/questionData/:questionId')
  async updateQuestionData(
    @Param("questionId") questionId: string,
    @Body() updateQuestionDataDto: UpdateQuestionDataDto,
  ):Promise<any>{
    try{
      const question = await this.questionService.updateQuestionData(questionId, updateQuestionDataDto);
      return question
    }catch (err){
      throw err
    }
  }

  // api/v1/course/:questionId
  @ApiOperation({ summary: 'Delete question' })
  @ApiResponse({ status: 201, description: 'Question deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "questionId", description: "ID of the question", type: String})
  @ResponseMessage('Question deleted successfully')
  @Delete("question/:questionId")
  async deleteQuestion(
    @Param('questionId') questionId: string,
  ): Promise<any>{
    try{
      const question = await this.questionService.deleteQuestion(questionId);
      return question;
    }catch(err){
      throw err;
    }
  }


}
