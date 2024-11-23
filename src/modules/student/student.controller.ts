import {
    BadRequestException,
    Body,
    Controller, Get,
    HttpStatus, Param, Patch,
    Post, Query, Req,
    Res,
    UseFilters, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { StudentService } from './student.service';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { UpdateStudentDto } from './dto/update_student.dto';
import { PaginationDTO } from '../../common/dto/pagination.dto';

@ApiTags('Student')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)

@Controller('student')
export class StudentController {
    constructor(
        private readonly studentService: StudentService,
    ) {}
    
    // api/v1/student/getStudent
    @ApiOperation({ summary: 'Get student for Student' })
    @ApiResponse({ status: 201, description: 'Student retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ResponseMessage('Student retrieved successfully')
    @Roles(['user'])
    @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
    @Get("getStudent")
    async getStudent(@User() user: UserInterface): Promise<any> {
        try {
            const student = await this.studentService.getStudent(user.sub);
            return student;
        } catch (err) {
            throw err;
        }
    }

    // api/v1/student/getStudentById/:studentId
    @ApiOperation({ summary: 'Get student for Admin' })
    @ApiResponse({ status: 201, description: 'Student retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ResponseMessage('Student retrieved successfully')
    @Roles(['admin'])
    @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
    @Get("getStudentById/:studentId")
    async getStudentById(@Param("studentId") studentId: string): Promise<any> {
        try {
            console.log(studentId)
            const student = await this.studentService.getStudent(studentId);
            return student;
        } catch (err) {
            throw err;
        }
    }

    // api/v1/student/getStudents
    @ApiOperation({ summary: 'Get all students' })
    @ApiResponse({ status: 201, description: 'Students retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiQuery({name: "page", description: "Page number for pagination", type: Number})
    @ApiQuery({name: "limit", description: "limits of objects in the page", type: Number})
    @ResponseMessage('Students retrieved successfully')
    @Roles(['admin'])
    @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
    @Get("getStudents")
    async getInstructors(@Query() paginationQuery: PaginationDTO): Promise<any> {
        try {
            const students = await this.studentService.getAllStudents(paginationQuery);
            return students;
        } catch (err) {
            throw err;
        }
    }

    // api/v1/student
    @ApiOperation({ summary: 'Update student' })
    @ApiResponse({ status: 201, description: 'Student Updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBody({ type: UpdateStudentDto })
    @ResponseMessage('Student updated successfully')
    @Roles(['user'])
    @UseGuards(JwtRefreshGuard, JwtAuthGuard, RolesGuard)
    @Patch()
    async updateInstructor(
        @User() user: UserInterface,
        @Body() updateStudentDto: UpdateStudentDto
    ): Promise<any> {
        try {
            const respose = await this.studentService.updateStudent(user.sub, updateStudentDto);
            return respose;
        } catch (err) {
            throw err;
        }
    }
}
