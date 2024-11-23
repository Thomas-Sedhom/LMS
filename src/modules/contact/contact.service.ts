import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Contact } from './schema/contact.schema';
import { ContactDto } from './dto/contact.dto';
import { ContactInterface } from './interface/contact.interface';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { PaginationUtil } from './utils/pagination.util';

@Injectable()
export class ContactService {
  constructor(@InjectModel('Contact') private readonly contactModel: Model<Contact>) {}
  
  async createContact(studentId: string, contactDto: ContactDto): Promise<ContactInterface> {
    const student_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(studentId) 
    const contact: ContactInterface = await this.contactModel.create({
      name: contactDto.name,
      email: contactDto.email,
      message: contactDto.message,
      studentId: student_id,
    });
    return contact;
  }

  async findAllContacts(pagination: PaginationDTO): Promise<ContactInterface[]>{
    const allContacts: ContactInterface[] = await PaginationUtil(pagination, this.contactModel);
    if(allContacts.length == 0)
      throw new BadRequestException("There is no contacts")
    return allContacts
  }

  async findContact(contactId: string): Promise<ContactInterface>  {
    const contact_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(contactId);
    const contact: ContactInterface = await this.contactModel.findById(contact_id)
    return contact;
  }

  async deleteContact(contactId: string):Promise<ContactInterface>   {
    const contact_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(contactId);
    const contact: ContactInterface = await this.contactModel.findOneAndDelete(contact_id);
    return contact;
  }
}
