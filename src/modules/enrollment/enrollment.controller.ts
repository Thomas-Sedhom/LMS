import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './schema/enrollment.schema';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { User } from '../../common/decorators/user.decorator';
import { EnrollmentInterface } from './interface/enrollment.interface';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { PaginationDTO } from '../../common/dto/pagination.dto';

@ApiTags('enrollment')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtRefreshGuard, JwtAuthGuard)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // api/v1/enrollment
  @ApiOperation({ summary: 'Create new enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'courseId', description: 'Id for the course to enroll', type: String})
  @ResponseMessage('Enrollment object created successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Post("enrollNewStudent/:courseId")
  async enrollNewStudent(
    @Param('courseId') courseId: string,
    @User() user: UserInterface
  ): Promise<EnrollmentInterface> {
    try{
      const enrollment: EnrollmentInterface = await this.enrollmentService.enrollNewStudent(user.sub, courseId);
      return enrollment;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment
  @ApiOperation({ summary: 'Get enrollment for student' })
  @ApiResponse({ status: 201, description: 'Enrollment retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description:"Id of the course", type: String})
  @ResponseMessage('Enrollment retrieved successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Get("getEnrollment/:courseId")
  async getEnrollment(
    @Param('courseId') courseId: string,
    @User() user: UserInterface
  ): Promise<EnrollmentInterface> {
    try{
      const enrollment: EnrollmentInterface = await this.enrollmentService.getEnrollment(user.sub, courseId);
      return enrollment;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment
  @ApiOperation({ summary: 'Get enrollment for admin' })
  @ApiResponse({ status: 201, description: 'Enrollment retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "studentId", description:"Id of the student", type: String})
  @ApiParam({name: "courseId", description:"Id of the course", type: String})
  @ResponseMessage('Enrollment retrieved successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Get("getEnrollment/:studentId/:courseId")
  async getEnrollmentByStudentId(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ): Promise<EnrollmentInterface> {
    try{
      const enrollment: EnrollmentInterface = await this.enrollmentService.getEnrollment(studentId, courseId);
      return enrollment;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment/getAllCoursesForStudent
  @ApiOperation({ summary: 'Get all courses for student guarded for student' })
  @ApiResponse({ status: 201, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Courses retrieved successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Get('getAllCoursesForStudent')
  async getAllCoursesForStudent(
    @User() user: UserInterface,
    @Query() paginationQuery: PaginationDTO
    ): Promise<any[]> {
    try{
      const courses: EnrollmentInterface[] = await this.enrollmentService.getAllCoursesForStudent(user.sub, paginationQuery);
      return courses;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment/getAllCoursesForStudent/:studentId
  @ApiOperation({ summary: 'Get all courses for student guarded for admin' })
  @ApiResponse({ status: 201, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'studentId', description: "Id for the student", type: String})
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Courses retrieved successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Get('getAllCoursesForStudent/:studentId')
  async getAllCoursesForStudentById(
    @Param('studentId') studentId: string,
    @Query() paginationQuery: PaginationDTO
  ): Promise<any[]> {
    try{
      const courses: EnrollmentInterface[] = await this.enrollmentService.getAllCoursesForStudent(studentId, paginationQuery);
      return courses;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment/getAllStudentsForCourse/:courseId
  @ApiOperation({ summary: 'Get all students for course guarded ' })
  @ApiResponse({ status: 201, description: 'Students retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description: "Id for the course", type: String})
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Students retrieved successfully')
  @Roles([RoleEnum.admin, RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Get('getAllStudentsForCourse/:courseId')
  async getAllStudentsForCourseByInstructorId(
    @Param("courseId") courseId: string,
    @Query() paginationQuery: PaginationDTO
    ): Promise<any> {
    try{
      const students = await this.enrollmentService.getAllStudentsForCourse(courseId, paginationQuery);
      return students;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment/deleteEnrollment/:courseId
  @ApiOperation({ summary: 'Delete enrollment for student' })
  @ApiResponse({ status: 201, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description: "Id for the course", type: String})
  @ResponseMessage('Enrollment deleted successfully')
  @Roles([RoleEnum.user, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Get('deleteEnrollment/:courseId')
  async deleteEnrollment(
    @User() student: UserInterface,
    @Param("courseId") courseId: string
    ): Promise<EnrollmentInterface> {
    try{
      const enrollment: EnrollmentInterface = await this.enrollmentService.deleteEnrollment(student.sub, courseId);
      return enrollment;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment/deleteEnrollment/:studentId/:courseId
  @ApiOperation({ summary: 'Delete enrollment for instructor' })
  @ApiResponse({ status: 201, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "studentId", description: "Id for the student", type: String})
  @ApiParam({name: "courseId", description: "Id for the course", type: String})
  @ResponseMessage('Enrollment deleted successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Delete('deleteEnrollment/:studentId/:courseId')
  async deleteEnrollmentByStudentId(
    @Param("studentId") studentId: string,
    @Param("courseId") courseId: string
  ): Promise<EnrollmentInterface> {
    try{
      const enrollment: EnrollmentInterface = await this.enrollmentService.deleteEnrollment(studentId, courseId);
      return enrollment;
    }catch(error){
      throw error;
    }
  }

  // api/v1/enrollment/updateProgress/:courseId/:videoId
  @ApiOperation({ summary: 'Update Progress' })
  @ApiResponse({ status: 201, description: 'Progress updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "courseId", description: "Id for the course", type: String})
  @ApiParam({name: "videoId", description: "Id for the video", type: String})
  @ResponseMessage('Progress updated successfully')
  @Roles([RoleEnum.user, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Patch('updateProgress/:courseId/:videoId')
  async updateProgress(
    @User() student: UserInterface,
    @Param("courseId") courseId: string,
    @Param("videoId") videoId: string
  ): Promise<any> {
    try {
      const enrollment = await this.enrollmentService.updateProgress(student.sub, courseId, videoId);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  //api/v1/enrollment/getAllActiveEnrollments
  @ApiOperation({ summary: 'Get all active enrollments' })
  @ApiResponse({ status: 201, description: 'Active enrollments retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Active enrollments retrieved successfully')
  @Roles([RoleEnum.admin ,RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Get("getAllActiveEnrollments")
  async getAllActiveEnrollments(@Query() paginationQuery: PaginationDTO): Promise<any> {
    try {
      const enrollments = await this.enrollmentService.getAllActiveEnrollments(paginationQuery);
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  //api/v1/enrollment/getAllInactiveEnrollments
  @ApiOperation({ summary: 'Get all inactive enrollments' })
  @ApiResponse({ status: 201, description: 'Inactive enrollments retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Inactive enrollments retrieved successfully')
  @Roles([RoleEnum.admin, RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Get("getAllInactiveEnrollments")
  async getAllInactiveEnrollments(@Query() paginationQuery: PaginationDTO): Promise<any> {
    try {
      const enrollments = await this.enrollmentService.getAllInactiveEnrollments(paginationQuery);
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  //api/v1/enrollment/activeEnrollment
  @ApiOperation({ summary: 'activate enrollment for student' })
  @ApiResponse({ status: 201, description: 'Enrollment activated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "studentId", description:"Id of the student", type: String})
  @ApiParam({name: "courseId", description:"Id of the course", type: String})
  @ResponseMessage('Enrollment activated successfully')
  @Roles([RoleEnum.admin, RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Post("activeEnrollment/:studentId/:courseId")
  async activeEnrollment(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ): Promise<any> {
    try {
      const enrollment = await this.enrollmentService.activeEnrollment(studentId, courseId);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  //api/v1/enrollment/createCode
  @ApiOperation({ summary: 'Creat code' })
  @ApiResponse({ status: 201, description: 'Code created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to validate',
          example: 'ABC123',
        },
      },
      required: ['code'],
    },
  })
  @ResponseMessage('Code created successfully')
  @Roles([RoleEnum.admin, RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Post("createCode")
  async createCode(@Body('code') code: string): Promise<any> {
    try {
      const otp = await this.enrollmentService.createCode(code);
      return otp;
    } catch (error) {
      throw error;
    }
  }

  //api/v1/enrollment/getAllCodes
  @ApiOperation({ summary: 'Get all codes' })
  @ApiResponse({ status: 201, description: 'Codes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
  @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
  @ResponseMessage('Codes retrieved successfully')
  @Roles([RoleEnum.admin, RoleEnum.instructor])
  @UseGuards(RolesGuard)
  @Get("getAllCodes")
  async getAllCodes(@Query() paginationQuery: PaginationDTO): Promise<any> {
    try {
      const otp = await this.enrollmentService.getAllCodes(paginationQuery);
      return otp;
    } catch (error) {
      throw error;
    }
  }

  //api/v1/enrollment/validateCode
  @ApiOperation({ summary: 'Validate code' })
  @ApiResponse({ status: 201, description: 'Code validated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: 'courseId', description: 'Id for the course to enroll', type: String})

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to validate',
          example: 'ABC123',
        },
      },
      required: ['code'],
    },
  })
  @ResponseMessage('Code validated successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Post("validateCode/:courseId")
  async validateCode(
    @Body("code") code: string,
    @Param('courseId') courseId: string,
    @User() user: UserInterface
  ): Promise<any> {
    try {
      const otp = await this.enrollmentService.validateCode(user.sub, courseId, code);
      return otp;
    } catch (error) {
      throw error;
    }
  }
}
