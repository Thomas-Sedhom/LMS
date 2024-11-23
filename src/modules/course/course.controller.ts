import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param, Patch,
  Post,
  Query, UploadedFile, UploadedFiles,
  UseFilters, UseGuards,
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
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UpdateCourseDto } from './dto/update_course.dto';
import { UpdateVideoDataDto } from './dto/update_video_data.dto';
import { UpdateVideoDto } from './dto/update_video.dto';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { QuestionDto } from './dto/question.dto';
import { FirebaseService } from '../../shared/services/firebase.service';
import { QuestionService } from './service/question.service';
import { UpdateQuestionDataDto } from './dto/update_question_data.dto';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { RoleEnum } from '../../common/enum/role.enum';


@ApiTags('course')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtRefreshGuard, JwtAuthGuard)
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly videoService: VideoService,
    private readonly questionService: QuestionService,
    private readonly firebaseService: FirebaseService
  ) {}

  // api/v1/course
  @ApiOperation({ summary: 'Create new course by instructor' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @Roles([RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Post()
  async createCourse(
    @User() user: UserInterface,
    @Body() course: CourseDto,
    @UploadedFiles() files: {coverImage: Express.Multer.File[]}
  ): Promise<any>{
    try{
      const respose = await this.courseService.createCourseByInstructor(user.sub, course, files);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/course/createCourseByAdmin
  @ApiOperation({ summary: 'Create new course by admin' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @Roles([RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Post("createCourseByAdmin")
  async createCourseByAdmin(
    @User() user: UserInterface,
    @Body() course: CourseDto,
    @UploadedFiles() files: {coverImage: Express.Multer.File[]}
  ): Promise<any>{
    try{
      const respose = await this.courseService.createCourseByAdmin(user.sub, course, files);
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
  @Roles([RoleEnum.instructor, RoleEnum.admin, RoleEnum.user])
  @UseGuards(RolesGuard)
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

  // api/v1/course/instructorCourses
  @ApiOperation({ summary: 'Get instructor courses' })
  @ApiResponse({ status: 201, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'page', description: 'Page number for pagination', type: Number})
  @ApiQuery({ name: 'limit', description: 'Limit of items per page for pagination', type: Number})
  @ResponseMessage('Courses retrieved successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Get("instructorCourses")
  async getCourses(
    @Query() pagination: PaginationDTO,
  @User() user: UserInterface,
  ): Promise<any>{
    try{
      const courses = await this.courseService.getCourses(user.sub, pagination);
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
  @Roles([RoleEnum.admin, RoleEnum.user])
  @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @ApiOperation({ summary: 'Delete course for instructor' })
  @ApiResponse({ status: 201, description: 'Course deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
  @ResponseMessage('Course deleted successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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

  // api/v1/course/deleteCourseByAdmin/:courseId
  @ApiOperation({ summary: 'Delete course for admin' })
  @ApiResponse({ status: 201, description: 'Course deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description: "ID of the course", type: String})
  @ResponseMessage('Course deleted successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Delete("deleteCourseByAdmin/:courseId")
  async deleteCourseByAdmin(
    @Param('courseId') courseId: string,
  ): Promise<any>{
    try{
      const respose = await this.courseService.deleteCourseByAdmin(courseId);
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
  // @Roles([RoleEnum.instructor, RoleEnum.admin])
  // @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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

  // api/v1/course/:courseId/upload_PDf
  @ApiOperation({ summary: "upload new pdf" })
  @ApiResponse({ status: 201, description: 'Pdf uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ResponseMessage('Pdf uploaded successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post(':videoId/upload_PDf')
  async uploadPDF(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) : Promise<any>{
    try{
        const allowedMimeType = 'application/pdf';
        if (file.mimetype !== allowedMimeType) {
          throw new BadRequestException('Unsupported file type. Only PDFs are allowed.');
        }
        const storagePath = `courses/${videoId}/pdfs`;
        const pdfPath = await this.firebaseService.uploadPdfToCloud(file, storagePath);
        const finalPath = await this.firebaseService.setFileToDownload(pdfPath);
        const video = await this.videoService.addPDF(videoId, pdfPath);
        console.log(pdfPath);
        return video;
    }catch (err){
      throw err;
    }
  }

  // api/v1/course/:courseId/save-video
  @ApiOperation({ summary: "write new notes" })
  @ApiResponse({ status: 201, description: 'Notes wrote successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ResponseMessage('Notes wrote successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Post(':videoId/notes')
  async writeNotes(
    @Param('videoId') videoId: string,
    @Body('notes') notes: string,
  ) : Promise<any>{
    try{
     const video = await this.videoService.setNotes(videoId, notes);
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.user, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: QuestionDto})
  @ResponseMessage('Question created successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'choice1', maxCount: 1 },
    { name: 'choice2', maxCount: 1 },
    { name: 'choice3', maxCount: 1 },
    { name: 'choice4', maxCount: 1 },
  ]))
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
      console.log("choice1")
      console.log("choice1",files)
      console.log("choice2")

      let uploadPromises: Promise<void>[] = []
      if(files){
        if(files.choice1)
          uploadPromises.push(
            this.firebaseService.uploadImageToCloud(files.choice1, `\`${videoId}\`/`)
              .then((url) => { questionDTO.choice1 = url; })
          );
        console.log(files.choice1)

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
        console.log("err")

        const uploadResults = await Promise.allSettled(uploadPromises);

        uploadResults.forEach((result, index) => {
          if (result.status === "rejected") {
            throw new BadRequestException(`Upload failed: ${result.reason}`);
            // Optionally, you can add logic here to handle retries or mark which files failed.
          } else {
            console.log(`Upload succeeded with status : ${result.status}`);
          }
        });
      }

      console.log(questionDTO)
      const question = await this.questionService.createQuestion(videoId, questionDTO);
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
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
  @ApiParam({ name: 'videoId', description: 'ID of the video', type: String })
  @ApiQuery({ name: 'videoDate', description: 'Date of the video task', type: String, })
  @ApiBody({type: VideoDto})
  @ResponseMessage('Task video saved successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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

  // api/v1/course/getQuestion/:questionId
  @ApiOperation({ summary: 'Get question' })
  @ApiResponse({ status: 201, description: 'Question retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "questionId", description: "ID of the question", type: String})
  @ResponseMessage('Question retrieved successfully')
  @Roles([RoleEnum.instructor, RoleEnum.user, RoleEnum.admin])
  @UseGuards(RolesGuard)
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

  // api/v1/course/questions/questionData/:questionId
  @ApiOperation({ summary: 'Update Question data' })
  @ApiResponse({ status: 201, description: 'Question data Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'questionId', description: 'ID of the question', type: String })
  @ApiBody({ type: UpdateQuestionDataDto })
  @ResponseMessage('Question data updated successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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

  // api/v1/course/question/:questionId
  @ApiOperation({ summary: 'Delete question' })
  @ApiResponse({ status: 201, description: 'Question deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "questionId", description: "ID of the question", type: String})
  @ResponseMessage('Question deleted successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
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
