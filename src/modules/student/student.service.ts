import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Instructor } from '../instructor/schema/instructor.schema';
import { UserInterface } from '../auth/interface/user.interface';
import { User } from '../auth/schema/user.schema';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { PaginationUtil } from './utils/pagination.util';

@Injectable()
export class StudentService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>){}

    async getStudent(userId: string): Promise<UserInterface>{
        const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(userId);
        const user: UserInterface = await this.userModel.findById(id, {password: 0, role: 0});
        return user;
    }

    async updateStudent(studentId: string, userData: UserInterface): Promise<UserInterface> {
        const user: UserInterface = await this.userModel.findByIdAndUpdate(studentId, userData,{new: true});
        return user;
    }

    async getAllStudents(paginationQuery: PaginationDTO ) {
        const students: UserInterface[] = await PaginationUtil(paginationQuery, this.userModel)
        if(students.length == 0)
            throw new BadRequestException("There is no students")
        return students;
    }
}