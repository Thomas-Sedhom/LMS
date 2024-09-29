import { HttpException, HttpStatus, Injectable, UseFilters } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CustomExceptionFilter } from '../../common/filters/custom-exception.filter'; // Correct import

@UseFilters(CustomExceptionFilter)
@Injectable()
export class VideoCipherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService

  ) {}
  private readonly apiUrl = this.configService.get<string>('VDOCIPHER_API_URL');
  private readonly apiKey = this.configService.get<string>('VDOCIPHER_API_KEY');

  // Get all folders in VideoCipher
  async getRootFolderId(): Promise<string> {
    try {
      // Replace with your actual API endpoint for fetching folders
      const apiUrl = 'https://dev.vdocipher.com/api/videos/folders';

      // Make the HTTP GET request
      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            Authorization: `Apisecret ${this.apiKey}`,
          },
        }),
      );

      // Extract the root folder ID from the response
      const folders = response.data; // Adjust according to actual response structure
      const rootFolder = folders.find(folder => folder.name === 'root'); // Adjust based on your folder structure

      if (!rootFolder) {
        throw new HttpException('Root folder not found', HttpStatus.NOT_FOUND);
      }

      return rootFolder.id;
    } catch (error) {
      throw error;
    }
  }

  // search on folder in VideoCipher
  async searchFolder(folderName: string): Promise<any> {
    const url = `https://dev.vdocipher.com/api/videos/folders/search`;
    const headers = {
      Authorization: `Apisecret ${this.apiKey}`,
    };
    const body = {
      name: folderName,
    };
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, body, { headers })
      );
      return response.data.folders; // Assuming `folders` contains a list of matching folders
    } catch (error) {
      throw error;
    }
  }

  // Create a folder in VideoCipher
  async createFolder(folderName: string, parentFolderId?: string): Promise<any> {
    const url = `https://dev.vdocipher.com/api/videos/folders`; // Assuming the folder creation endpoint is /folders
    const headers = {
      Authorization: `Apisecret ${this.apiKey}`,
    };

    const body = {
      name: folderName,
      parent: 'root',
      // ...(parentFolderId ? { parent: parentFolderId } : {}),
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, body, { headers })
      );
      return response.data; // This will contain the folderId
    } catch (error) {
      throw error;
    }
  }

  // get credentials to upload video
  async getUploadCredentials(videoTitle: string, folderId?: string): Promise<any> {
    const params = {
      title: videoTitle,
      ...(folderId ? { folderId } : {}),
    };
    const headers = {
      Authorization: `Apisecret ${this.apiKey}`,
    };
    try {
      const response = await lastValueFrom(
        this.httpService.put(this.apiUrl, null, { params, headers })
      );
      return response.data; // This will contain the policy, upload link, and videoId
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async deleteVideos(videoIds: string[]){
    const query = videoIds.join(',');
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Apisecret ${this.apiKey}`,
      },
      params: { videos: query }
    };
    try{
      const response = await lastValueFrom(this.httpService.delete(this.apiUrl, options));
      return response.data;
    }catch (error){
      throw error;
    }
  }

  async getVideoOTP(videoId: string){
    const url = `${this.apiUrl}/${videoId}/otp`;
    const body = {
      ttl: 72000 // Set Time-To-Live (TTL) for the OTP in seconds (here it's 72000)
    };
    try {
      const response = await lastValueFrom(this.httpService.post(url, body, {
        headers: {
          Authorization: `Apisecret ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }));

      return response.data; // Contains OTP and playback info
    } catch (error) {
      throw error;
    }
  }

  async getVideosInFolder(folderId: string): Promise<any[]> {
    console.log(folderId)
    const url = `https://dev.vdocipher.com/api/videos?folderId=${folderId}`; // Assuming the API allows fetching videos in a folder
    const headers = {
      Authorization: `Apisecret ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await lastValueFrom(this.httpService.get(url, { headers }));
      return response.data.rows; // Adjust according to the API response structure
    } catch (error) {
      console.log(error)
      throw new HttpException(
        'Error fetching videos in folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFolder(courseId: string): Promise<any> {
    let folderId: string
    try {
      // Search for the folder
      const folderSearchResponse = await this.searchFolder(courseId);

      if (folderSearchResponse && folderSearchResponse.length > 0) {
        // Folder found, use its ID
        folderId = folderSearchResponse[0].id;
      }
    } catch (error) {
      throw new Error('Error searching or creating folder in VideoCipher: ' + error.message);
    }

    const videos = await this.getVideosInFolder(folderId);

    // If there are videos, delete them one by one
    if (videos && videos.length > 0) {
      const videoIds = videos.map(video => video.id); // Assuming `id` is the identifier for videos
      await this.deleteVideos(videoIds); // This will delete the videos
    }

    const url = `${this.apiUrl}/folders/${folderId}`; // Assuming this is the endpoint for folder deletion
    const headers = {
      Authorization: `Apisecret ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await lastValueFrom(
        this.httpService.delete(url, { headers })
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error deleting folder from VdoCipher',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}