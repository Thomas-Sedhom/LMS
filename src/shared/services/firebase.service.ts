import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  updateMetadata
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

  async uploadPdfToCloud(file: Express.Multer.File, storagePath: string): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Ensure the file is a PDF
    const allowedMimeType = 'application/pdf';
    if (file.mimetype !== allowedMimeType) {
      throw new BadRequestException('Unsupported file type. Only PDFs are allowed.');
    }

    const fileName = encodeURIComponent(file.originalname);
    const storageRef = ref(this.storage, `${storagePath}/${fileName}`);

    // Set the correct metadata for PDFs
    const metadata = { contentType: file.mimetype };

    const uploadTask = uploadBytesResumable(storageRef, file.buffer, metadata);

    try {
      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.error(`Error uploading file ${file.originalname}: ${err.message}`);
      throw new BadRequestException(`Error uploading file ${file.originalname}: ${err.message}`);
    }
  }


  /**
   * Delete a PDF from Firebase Storage
   * @param pdfPath - The storage path of the PDF to delete
   */
  async removePdfFromCloud(pdfPath: string): Promise<void> {
    const storageRef = ref(this.storage, pdfPath);

    try {
      // Attempt to delete the file
      await deleteObject(storageRef);
    } catch (error) {
      // Handle specific errors
      if (error.code === 'storage/object-not-found') {
        throw new NotFoundException(`File not found: ${pdfPath}`);
      } else {
        console.error(`Error deleting file ${pdfPath}: ${error.message}`);
        throw new BadRequestException(`Error deleting file: ${error.message}`);
      }
    }
  }

  async setFileToDownload(filePath: string) {
    const storage = getStorage();
    const fileRef = ref(storage, filePath);

    const newMetadata = {
      contentDisposition: 'attachment',
    };

    await updateMetadata(fileRef, newMetadata);
    console.log('Metadata updated to force download.');
  }
}