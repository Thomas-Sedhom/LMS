import {
  Body,
  Controller, Delete,
  Get,
  Param, Patch,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { JwtRefreshGuard } from '../../common/guards/JwtRefresh.guard';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { ResponseMessage } from '../../common/decorators/responce_message.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/role.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { User } from '../../common/decorators/user.decorator';
import { UserInterface } from '../../common/interface/user.interface';
import { CourseDto } from '../course/dto/course.dto';
import { BlogDto } from './dto/blog.dto';
import { UpdateCourseDto } from '../course/dto/update_course.dto';
import { UpdateBlogDto } from './dto/update_blog.dto';
@ApiTags('blog')
@UseFilters(CustomExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtRefreshGuard, JwtAuthGuard)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // api/v1/blog
  @ApiOperation({ summary: 'Create new blog' })
  @ApiResponse({ status: 201, description: 'Blog created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiConsumes('multipart/form-data') // Specifies the content type
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Upload the cover image for the course',
          example: 'Cover image file here',
        },
        title: {
          type: 'string',
          example: 'blog',
        },
        details: {
          type: 'string',
          example: 'This blog details',
        },
      },
    },
  })
  @ResponseMessage('Blog created successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ]))
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Post()
  async createBlog(
    @Body() blog: BlogDto,
    @UploadedFiles() files: {image: Express.Multer.File[]}
  ): Promise<any>{
    try{
      console.log(blog, files)
      const respose = await this.blogService.createBlog(files, blog);
      return respose;
    }catch(err){
      throw err;
    }
  }


  // api/v1/blog/:blogId
  @ApiOperation({ summary: 'Get blog' })
  @ApiResponse({ status: 201, description: 'Blog retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "blogId", description: "ID of the blog", type: String})
  @ResponseMessage('Blog retrieved successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin, RoleEnum.user])
  @UseGuards(RolesGuard)
  @Get("getBlog/:blogId")
  async getBlog(
    @Param('blogId') blogId: string,
  ): Promise<any>{
    try{
      const blog = await this.blogService.getBlog(blogId);
      return blog;
    }catch(err){
      throw err;
    }
  }


  // api/v1/blogs
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({ status: 201, description: 'Blogs retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ResponseMessage('Blogs retrieved successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin, RoleEnum.user])
  @UseGuards(RolesGuard)
  @Get("getAllBlogs")
  async getAllBlogs(): Promise<any>{
    try{
      const blogs = await this.blogService.getAllBlogs();
      return blogs;
    }catch(err){
      throw err;
    }
  }


  // api/v1/blog/:blogId
  @ApiOperation({ summary: 'Update blog' })
  @ApiResponse({ status: 201, description: 'Blog Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "blogId", description: "ID of the blog", type: String})
  @ApiBody({type: UpdateBlogDto})
  @ResponseMessage('Course updated successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Patch(":blogId")
  async updateCourse(
    @Param('blogId') blogId: string,
    @Body() updateBlog: UpdateBlogDto
  ): Promise<any>{
    try{
      console.log(updateBlog)
      const respose = await this.blogService.updateBlog(blogId, updateBlog);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/blog/:blogId
  @ApiOperation({ summary: 'Update image blog' })
  @ApiResponse({ status: 201, description: 'Image blog Updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "blogId", description: "ID of the blog", type: String})
  @ApiConsumes('multipart/form-data') // Specifies the content type
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Upload the image for the blog',
          example: 'Image file here',
        }
      },
    },
  })
  @ResponseMessage('Blog image updated successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ]))
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Patch("updateImage/:blogId")
  async updateCoverImageCourse(
    @Param('blogId') blogId: string,
    @UploadedFiles() files: {image: Express.Multer.File[]}
  ): Promise<any>{
    try{
      const blogDto: UpdateBlogDto = {};
      const respose = await this.blogService.updateBlog(blogId, blogDto, files);
      return respose;
    }catch(err){
      throw err;
    }
  }

  // api/v1/blog/:blogId
  @ApiOperation({ summary: 'Delete blog' })
  @ApiResponse({ status: 201, description: 'Blog deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({name: "blogId", description: "ID of the blog", type: String})
  @ResponseMessage('Blog deleted successfully')
  @Roles([RoleEnum.instructor, RoleEnum.admin])
  @UseGuards(RolesGuard)
  @Delete(":blogId")
  async deleteBlog(
    @Param('blogId') blogId: string,
  ): Promise<any>{
    try{
      const respose = await this.blogService.deleteBlog(blogId);
      return respose;
    }catch(err){
      throw err;
    }
  }

}
