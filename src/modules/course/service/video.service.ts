import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../schema/course.schema';
import mongoose, { ClientSession, Model } from 'mongoose';
import { VideoCipherService } from '../../../shared/services/videoCipher.service';
import { VideoDto } from '../dto/video.dto';
import { Video } from '../schema/video.schema';
import { VideoInterface } from '../interface/video.interface';
import { UpdateVideoDataDto } from '../dto/update_video_data.dto';
import { UpdateVideoDto } from '../dto/update_video.dto';
import { Question } from '../schema/question.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,

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
      const course = await this.courseModel.findByIdAndUpdate(
        id,
        { $push: { videosId: newVideo._id } },
        { new: true, session }
      );
      // Commit the transaction
      if(!course)
        throw new BadRequestException("Course not found")

      await session.commitTransaction();
      return newVideo;
    }catch (err){
      await session.abortTransaction();
      throw err;
    }finally{
      await session.endSession();
    }
  }

  async getVideoOTP(videoID: string): Promise<any> {
    const credentials = await this.videoCipherService.getVideoOTP(videoID);
    const videoData = await this.videoModel
      .findOne({videoId: videoID})
      .populate({
        path: 'questionsId',  // field to populate
        select:
          '_id videoId questionTime question choice1 choice2 choice3 choice4 chooseAnswer' +
          'expressiveAnswer paragraphAnswer trueFalseAnswer completeAnswer videoRevisionId creationDate quizNumber',  // only select specific fields from the video model
      });

    // Step 3: Initialize an object to group questions by `questionTime`
    const questionsByTime = {};

    // Step 4: Loop through the questions and group them by `questionTime`
    videoData.questionsId.forEach((question: any) => {
      const time = question.questionTime;

      // If no group exists for this `questionTime`, initialize an array
      if (!questionsByTime[time]) {
        questionsByTime[time] = [];
      }

      // Push the question into the corresponding `questionTime` group
      questionsByTime[time].push(question);
    });
    const {_id, videoId, videoTitle, videoDescription, index, videoUrl, courseId} =  videoData
    const data =  {_id, videoId, videoTitle, videoDescription, index, videoUrl, courseId}
    return { credentials, data, questionsByTime };
  }

  async getVideoById(videoId: string): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId)
    const video = await this.videoModel.findOne(id);
    return video;
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

  async updateVideoData(videoId: string, updateVideoDataDto: UpdateVideoDataDto) {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId);
    const video = await this.videoModel.findByIdAndUpdate(id, updateVideoDataDto, {new: true});
    if(updateVideoDataDto.videoTitle)
      await this.videoCipherService.updateVideoTitle(video.videoId, video.videoTitle)
    return video;
  }

  async updateVideo(videoId: string, updateVideoDto: UpdateVideoDto){
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId);
    const video = await this.videoModel.findById(id);
    const videosId: string[] = [video.videoId];
    await this.deleteVideos(videosId)
    video.videoId = updateVideoDto.videoId;
    video.videoUrl = updateVideoDto.videoUrl;
    await video.save();
    return video;
  }

  async addPDF(videoId: string, pdf: any){
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId);
    console.log(pdf)
    let video = await this.videoModel.findByIdAndUpdate(id, {pdf}, {new: true});
    return video;
  }

  async deleteVideos(videoIds: string[]): Promise<any> {
    if (!videoIds || videoIds.length === 0)
      throw new BadRequestException('No video IDs provided.');

    const data = await this.videoCipherService.deleteVideos(videoIds);
    return data;
  }
  // Method to remove video entry from your MongoDB after deletion from VideoCipher
  async removeVideoFromDB(courseId: string, videoIds: string[]): Promise<any> {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(courseId);

    // Retrieve the videos matching the provided video IDs
    const ids = await this.videoModel.find({ videoId: { $in: videoIds } }, { _id: 1 });

    const idsList: mongoose.Types.ObjectId[] = ids.map(video => video._id);

    if (idsList.length === 0) {
      throw new BadRequestException('No videos found for this course');
    }
    // Fetch the course document
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }

    // Filter out the videos from the course using equals for comparison
    course.videosId = course.videosId.filter(videoId => {
      return !idsList.some(id => id.equals(videoId));  // Use equals for ObjectId comparison
    });
    await this.videoModel.deleteMany({ videoId: { $in: videoIds } }).exec();
    // Save the updated course document
    await course.save();
    return course;
  }

  async removeVideoFromDBForTask(videoIds: string[]): Promise<any> {

    // Retrieve the videos matching the provided video IDs
    const ids = await this.videoModel.find({ videoId: { $in: videoIds } }, { _id: 1 });

    const idsList: mongoose.Types.ObjectId[] = ids.map(video => video._id);

    if (idsList.length === 0) {
      throw new BadRequestException('No videos found for this course');
    }

    const videos = await this.videoModel.deleteMany({ videoId: { $in: videoIds } }).exec();
    // Save the updated course document
    return videos;
  }

  async getUploadCredentialsForVideoTask(videoId: string, videoTitle: string) {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId)
    // Fetch the course details
    const video = await this.videoModel.findById(id).exec();

    if (!video)
      throw new Error('Video not found');

    // Check if a folder for this course exists in VideoCipher
    let folderId: string;

    try {
      // Search for the folder
      const folderSearchResponse = await this.videoCipherService.searchFolder(videoId);

      if (folderSearchResponse && folderSearchResponse.length > 0) {
        // Folder found, use its ID
        folderId = folderSearchResponse[0].id;
      } else {
        // Folder not found, create a new one
        const folderResponse = await this.videoCipherService.createFolder(videoId);
        folderId = folderResponse.id; // Assuming response contains `id` of the folder
      }
    } catch (error) {
      throw new Error('Error searching or creating folder in VideoCipher: ' + error.message);
    }

    // Get the upload credentials and pass the folderId
    const uploadCredentials = await this.videoCipherService.getUploadCredentials(videoTitle, folderId);

    return {
      uploadCredentials,
      mainVideoId: videoId,
    };
  }
  async saveTaskVideo(videoId: string, videoDate: string, videoData: VideoDto) {
    if(!videoId)
        throw new BadRequestException("video id is required")
    const session: ClientSession = await this.videoModel.startSession();
    session.startTransaction();
    try {
      const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId);
      const uploadedAt: string = new Date().toISOString();

      if(await this.videoModel.findOne({videoId: videoData.videoId}))
        throw new BadRequestException("Video already exist ");

      const newVideoArray = await this.videoModel.create([{
        videoId: videoData.videoId,
        videoTitle: videoData.videoTitle,
        videoDescription: videoData.videoDescription,
        videoUrl: videoData.videoUrl,
        index: videoData.index,
        mainVideoId: id,
        uploadedAt
      }], { session });

      const newVideo: VideoInterface = newVideoArray[0];
      // Update the course document to push the new video ID into the videosId array
      const course = await this.questionModel.updateMany(
        {videoId: id, questionTime: videoDate},
        {videoRevisionId: newVideo._id },
        { new: true, session }
      );
      // Commit the transaction
      if(!course)
        throw new BadRequestException("Course not found")

      await session.commitTransaction();
      return newVideo;
    }catch (err){
      await session.abortTransaction();
      throw err;
    }finally{
      await session.endSession();
    }
  }


  async setNotes(videoId: string, notes: string) {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(videoId);
    let video = await this.videoModel.findByIdAndUpdate(id, {notes}, {new: true});
    return video;
  }
}