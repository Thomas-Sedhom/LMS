import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model } from 'mongoose';
import { Blog } from './schema/blog.schema';
import { BlogDto } from './dto/blog.dto';
import { UpdateBlogDto } from './dto/update_blog.dto';
import { v4 as uuidv4 } from 'uuid';
import { CourseInterface } from '../course/interface/course.interface';
import { FirebaseService } from '../../shared/services/firebase.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel('Blog') private readonly blogModel: Model<Blog>,
    private readonly firebaseService: FirebaseService
    ) {}

  async createBlog(files: any, blogDto: BlogDto){

    const session: ClientSession = await this.blogModel.startSession();
    session.startTransaction();
    try{
      // Generate a unique ID for the folder
      const uniqueFolderId: string = uuidv4();
      const image = await this.firebaseService.uploadImageToCloud(files.image, `\`${uniqueFolderId}\`/`);
      const blog = await this.blogModel.create({
        title: blogDto.title,
        details: blogDto.details,
        image
      });
      await session.commitTransaction();
      return blog;
    }catch(err){
      await session.abortTransaction();
      throw err;
    }finally{
      await session.endSession();
    }
  }

  async getBlog(blogId: string){
    const blog_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(blogId);
    const blog = await this.blogModel.findById(blog_id);
    return blog;
  }

  async getAllBlogs(){
    const blog = await this.blogModel.find();
    return blog;
  }

  async updateBlog(blogId: string, blogDto: UpdateBlogDto, files?: any){
    const blog_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(blogId);
    console.log(blogDto, files)
    let blog:any;
    if(files){
      const uniqueFolderId: string = uuidv4();
      const image = await this.firebaseService.uploadImageToCloud(files.image, `\`${uniqueFolderId}\`/`);
      blog = await this.blogModel.findByIdAndUpdate(blog_id, { image },  {new: true});
      console.log(44)
    }else{
      blog = await this.blogModel.findByIdAndUpdate(blog_id, { ...blogDto },  {new: true});
    }
    return blog;
  }

  async deleteBlog(blogId: string){
    const blog_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(blogId);
    const blog = await this.blogModel.findByIdAndDelete(blog_id);
    return blog;
  }

}
