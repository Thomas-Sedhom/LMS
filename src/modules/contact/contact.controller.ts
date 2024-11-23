import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseInterceptors,
  UseGuards, Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { ContactInterface } from './interface/contact.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { PaginationDTO } from '../../common/dto/pagination.dto';

@ApiTags('contact')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtRefreshGuard, JwtAuthGuard)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({ summary: 'Create new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Contact created successfully')
  @Roles([RoleEnum.user])
  @UseGuards(RolesGuard)
  @Post()
  async createContact(@Body() contactDto: ContactDto, @User() user: UserInterface): Promise<ContactInterface> {
    try{
      const contact = await this.contactService.createContact(user.sub, contactDto);
      return contact
    }catch (err){
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 201, description: 'Contacts retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'page', description: 'Page number for pagination', type: Number})
  @ApiQuery({ name: 'limit', description: 'Limit of items per page for pagination', type: Number})
  @ResponseMessage('Contacts retrieved successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Get()
  async findAllContacts(@Query() pagination: PaginationDTO): Promise<any> {
    try{
      const contacts = await this.contactService.findAllContacts(pagination);
      return contacts
    }catch(err){
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get contact' })
  @ApiResponse({ status: 201, description: 'Contact retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Contact retrieved successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Get('/:contactId')
  async findContact(@Param('contactId') contactId: string): Promise<any> {
    try{
      const contact = this.contactService.findContact(contactId);
      return contact
    }catch(err){
      throw err;
    }
  }

  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 201, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Contact deleted successfully')
  @Roles([RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Delete('/:contactId')
  async deleteContact(@Param('contactId') contactId: string): Promise<ContactInterface> {
    try{
      const contact: ContactInterface = await this.contactService.deleteContact(contactId);
      return contact
    }catch (err){
      throw err;
    }
  }
}
