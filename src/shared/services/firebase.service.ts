import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import firebase from "firebase/compat";
import Storage = firebase.storage.Storage;
import { app } from '../../config/firebase.config';

const metadata = { contentType: 'image/png' };

@Injectable()
export class FirebaseService {
  private storage;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    this.storage = getStorage(app);
  }

  async uploadImageToCloud(files: Express.Multer.File[], url: string): Promise<string> {
    let downloadURL: string = ''
    for (const file of files) {
      if (!file || !file.buffer) {
        throw new BadRequestException('No file uploaded');
      }

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Unsupported file type');
      }

      const fileName = encodeURIComponent(file.originalname);
      const storageRef = ref(this.storage, `${url}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file.buffer, metadata);

      try {
        await uploadTask; // You can handle the task's events as shown above
        downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // console.log('File available at', downloadURL);
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}: ${err.message}`);
        throw new BadRequestException(`Error uploading file ${file.originalname}: ${err.message}`);
      }
    }
    return downloadURL;
  }

  async removeImageFromCloud(imagePath: string): Promise<void> {
    const storageRef = ref(this.storage, imagePath);
    try {
      // Attempt to delete the file
      await deleteObject(storageRef);
      // console.log(`Successfully deleted ${imagePath}`);
    } catch (error) {
      // Handle specific errors
      if (error.code === 'storage/object-not-found') {
        throw new NotFoundException(`File not found: ${imagePath}`);
      } else {
        console.error(`Error deleting file ${imagePath}: ${error.message}`);
        throw new BadRequestException(`Error deleting file: ${error.message}`);
      }
    }
  }
}