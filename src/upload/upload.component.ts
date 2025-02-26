import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { environment } from '../assets/environment';

@Component({
  selector: 'app-upload',
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  @Output() closeupload = new EventEmitter<boolean>();
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  uploadProgress: number[] = [];
  uploading = false;
  userEmail: string | null = null;
  isDraggingOver = false;
  familyId: string | null = null;
  isNative = Capacitor.isNativePlatform();
  uploadErrors: { [index: number]: string } = {};
  generalError: string | null = null;
  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userEmail = user.email;
        this.familyId = user.familyId || null;
        
        if (!this.familyId) {
          console.warn('No family ID available for user');
        }
      }
    });
  }

  /** Take photo using device camera */
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        // Convert data URL to File object
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.${image.format}`, {
          type: `image/${image.format}`
        });

        this.selectedFiles.push(file);
        this.uploadProgress.push(0);
        this.imagePreviews.push(image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  /** Take photo using browser camera */
  async takeBrowserPhoto() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.srcObject = stream;
      await video.play();

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
      }

      // Stop video stream
      stream.getTracks().forEach(track => track.stop());

      // Convert canvas to blob
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // Create File object
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      this.selectedFiles.push(file);
      this.uploadProgress.push(0);
      this.imagePreviews.push(canvas.toDataURL('image/jpeg'));
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  /** Handle file selection manually */
  onFilesSelected(event: any) {
    this.processFiles(event.target.files);
  }

  /** Handle file dropping */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  processFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.uploadProgress.push(0);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(files[i]);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.uploadProgress.splice(index, 1);
  }
 

  async uploadSingleFile(index: number) {
    try {
      this.uploadErrors[index] = '';
      const url = environment.apiUrl + `/GetUploadUrlFunction?nocache=${new Date().getTime()}`;
      const response: any = await this.http.get(url).toPromise();

      const uploadUrl = response.uploadUrl;
      const headers = new HttpHeaders({
       "x-ms-blob-type": "BlockBlob",
        'Content-Type': 'image/jpeg',
        'x-ms-meta-email': this.userEmail || '',
        'x-ms-meta-familyId': this.familyId || '1' 
       
      }); 
      // Convert to Promise to better handle errors
      await new Promise((resolve, reject) => {
        this.http.put(uploadUrl, this.selectedFiles[index], { 
          headers, 
          reportProgress: true, 
          observe: 'events'
        }).subscribe({
          next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.uploadProgress[index] = Math.round((100 * event.loaded) / event.total);
            } else if (event.type === HttpEventType.Response) {
              console.log('File uploaded successfully:', event.body);
              delete this.uploadErrors[index];
              resolve(event);
            }
          },
          error: (error) => {
            console.error('Upload failed:', error);
            let errorMessage = 'Upload failed';
            
            // Handle different types of errors
            if (error.status === 0) {
              errorMessage = 'Network error - please check your connection';
            } else if (error.status === 413) {
              errorMessage = 'File is too large';
            } else if (error.status === 403) {
              errorMessage = 'Permission denied';
            } else if (error.status === 401) {
              errorMessage = 'Unauthorized access';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
      
            // Update the error in the next tick to ensure Angular's change detection catches it
            setTimeout(() => {
              this.uploadErrors[index] = errorMessage;
              this.uploadProgress[index] = 0;
            });
            
            reject(error);
          },
          complete: () => {
            resolve(true);
          }
        });
      });

    } catch (error: any) {
      console.error('Upload failed:', error);
      let errorMessage = 'Upload failed';
      
      if (error.status === 0) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.uploadErrors[index] = `Failed to upload ${this.selectedFiles[index].name}: ${errorMessage}`;
      this.uploadProgress[index] = 0;
      throw error; // Re-throw to be caught by uploadFiles
    }
  }

  async uploadFiles() {
    if (!this.selectedFiles.length || !this.familyId) {
      this.generalError = 'No files selected or no family ID available';
      return;
    }

    this.uploading = true;
    this.generalError = null;
    this.uploadErrors = {};

    let hasErrors = false;

    for (let i = 0; i < this.selectedFiles.length; i++) {
      try {
        await this.uploadSingleFile(i);
      } catch (error) {
        hasErrors = true;
        // Individual file errors are already handled in uploadSingleFile
      }
    }

    this.uploading = false;
    
    if (!hasErrors) {
      this.closeupload.emit(true);
    }
  } 
}