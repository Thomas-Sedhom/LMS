import { Body, Controller, Get, Param, Post, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { EnrollmentInterface } from '../enrollment/interface/enrollment.interface';
import { QuizService } from './quiz.service';
import { QuizDto } from './dto/quiz.dto';
@ApiTags('quiz')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtRefreshGuard, JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // api/v1/quiz/completeQuizForStudent/:courseId/:videoId
  @ApiOperation({ summary: 'Create new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'studentId', description: 'Id for the student', type: String})
  @ApiParam({name: 'courseId', description: 'Id for the course', type: String})
  @ApiParam({name: 'videoId', description: 'Id for the video', type: String})
  @ResponseMessage('Quiz object created successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Post("completeQuizForStudent/:courseId/:videoId")
  async completeQuiz(
    @Param('courseId') courseId: string,
    @Param('videoId') videoId: string,
    @Body() quizDto: QuizDto,
    @User() user: UserInterface
  ): Promise<any> {
    try{
      console.log(quizDto)
      const quiz: EnrollmentInterface = await this.quizService.enrollNewQuiz(user.sub, courseId, videoId, quizDto);
      return quiz;
    }catch(error){
      throw error;
    }
  }

  //api/v1/quiz/completeQuizForAdmin/:courseId/:videoId
  @ApiOperation({ summary: 'Create new quiz by admin' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'studentId', description: 'Id for the student', type: String})
  @ApiParam({name: 'courseId', description: 'Id for the course', type: String})
  @ApiParam({name: 'videoId', description: 'Id for the video', type: String})
  @ResponseMessage('Quiz object created successfully')
  @Roles([RoleEnum.admin, RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Post("completeQuizForAdmin/:studentId/:courseId/:videoId")
  async completeQuizByAdmin(
    @Param('courseId') courseId: string,
    @Param('videoId') videoId: string,
    @Param('studentId') studentId: string,
    @Body() quizDto: QuizDto,
    @User() user: UserInterface
  ): Promise<any> {
    try{
      const quiz: EnrollmentInterface = await this.quizService.enrollNewQuiz(studentId, courseId, videoId, quizDto);
      return quiz;
    }catch(error){
      throw error;
    }
  }

  // api/v1/quiz/getQuizzesForStudentByStudent
  @ApiOperation({ summary: 'Get quizzes for student' })
  @ApiResponse({ status: 201, description: 'Quizzes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Quizzes retrieved successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Get("getQuizzesForStudentByStudent")
  async getQuizzesByStudent(
    @User() user: UserInterface
  ): Promise<any> {
    try{
      const quizzes: EnrollmentInterface = await this.quizService.getAllQuizzesForStudent(user.sub);
      return quizzes;
    }catch(error){
      throw error;
    }
  }

  // api/v1/quiz/getQuizzesForStudentByAdmin
  @ApiOperation({ summary: 'Get quizzes for student By Admin' })
  @ApiResponse({ status: 201, description: 'Quizzes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'studentId', description: 'Id for the student', type: String})
  @ResponseMessage('Quizzes retrieved successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Get("getQuizzesForStudentByStudent")
  async getQuizzesByAdmin(
    @Param('studentId') studentId: string,
    @User() user: UserInterface
  ): Promise<any> {
    try{
      const quizzes: EnrollmentInterface = await this.quizService.getAllQuizzesForStudent(studentId);
      return quizzes;
    }catch(error){
      throw error;
    }
  }
}
