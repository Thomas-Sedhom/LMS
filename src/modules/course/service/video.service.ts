import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../schema/course.schema';
import mongoose, { ClientSession, Model } from 'mongoose';
import { VideoCipherService } from '../../../shared/services/videoCipher.service';
import { VideoDto } from '../dto/video.dto';
import { Video } from '../schema/video.schema';
import { VideoInterface } from '../interface/video.interface';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,

    private readonly videoCipherService: VideoCipherService,
  ) {}


  async generateUploadCredentials(courseId: string, videoTitle: string): Promise<any> {

    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId)
    // Fetch the course details
    const course = await this.courseModel.findById(id).exec();

    if (!course)
      throw new Error('Course not found');

    // Check if a folder for this course exists in VideoCipher
    let folderId: string;

    try {
      // Search for the folder
      const folderSearchResponse = await this.videoCipherService.searchFolder(courseId);

      if (folderSearchResponse && folderSearchResponse.length > 0) {
        // Folder found, use its ID
        folderId = folderSearchResponse[0].id;
      } else {
        // Folder not found, create a new one
        const folderResponse = await this.videoCipherService.createFolder(courseId);
        folderId = folderResponse.id; // Assuming response contains `id` of the folder
      }
    } catch (error) {
      throw new Error('Error searching or creating folder in VideoCipher: ' + error.message);
    }

    // Get the upload credentials and pass the folderId
    const uploadCredentials = await this.videoCipherService.getUploadCredentials(videoTitle, folderId);

    return {
      uploadCredentials,
      courseId,
    };
  }

  async saveVideo(courseId: string, videoData: VideoDto) {
    const session: ClientSession = await this.videoModel.startSession();
    session.startTransaction();
    try {
      const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);
      const uploadedAt: string = new Date().toISOString();

      if(await this.videoModel.findOne({videoId: videoData.videoId}))
        throw new BadRequestException("Video already exist ");

      const newVideoArray = await this.videoModel.create([{
        videoId: videoData.videoId,
        videoTitle: videoData.videoTitle,
        videoDescription: videoData.videoDescription,
        videoUrl: videoData.videoUrl,
        index: videoData.index,
        courseId: id,
        uploadedAt
      }], { session });

      const newVideo: VideoInterface = newVideoArray[0];
      // Update the course document to push the new video ID into the videosId array
      await this.courseModel.findByIdAndUpdate(
        id,
        { $push: { videosId: newVideo._id } },
        { new: true, session }
      );
      // Commit the transaction
      await session.commitTransaction();
      return newVideo;
    }catch (err){
      await session.abortTransaction();
      throw err;
    }finally{
      await session.endSession();
    }
  }

  async getVideoOTP(videoId: string): Promise<any> {
    const credentials = await this.videoCipherService.getVideoOTP(videoId);
    const videoData = await this.videoModel.findOne({videoId});

    return { credentials, videoData };
  }

  async getVideosOTPForCourse(courseId: string): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId)
    const videos = await this.videoModel.find({ courseId: id }).exec();
    if (!videos || videos.length === 0) {
      throw new BadRequestException('No videos found for this course');
    }

    // Step 2: Request OTP for each video
    const videoOtpPromises = videos.map(async (video) => {
      const otpResponse = await this.getVideoOTP(video.videoId); // Fetch OTP for the current video
      return {
        videoId: video.videoId,
        title: video.videoTitle,
        description: video.videoDescription,
        otp: otpResponse.credentials.otp,
        playbackInfo: otpResponse.credentials.playbackInfo,
      };
    });

    // Resolve all the OTP requests
    return Promise.all(videoOtpPromises);
  }

  async deleteVideos(videoIds: string[]): Promise<any> {
    if (!videoIds || videoIds.length === 0)
      throw new BadRequestException('No video IDs provided.');

    const data = await this.videoCipherService.deleteVideos(videoIds);
    return data;
  }
  // Method to remove video entry from your MongoDB after deletion from VideoCipher
  async removeVideoFromDB(videoIds: string[]): Promise<void> {
    await this.videoModel.deleteMany({ videoId: { $in: videoIds } }).exec();
  }
}