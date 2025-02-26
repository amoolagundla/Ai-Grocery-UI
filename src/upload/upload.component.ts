import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { environment } from '../assets/environment'; 
import { AppInsightsService } from '../services/AppInsightsService';

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
  
  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private appInsights: AppInsightsService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userEmail = user.email;
        this.familyId = user.familyId || null;
        
        if (!this.familyId) {
          console.warn('No family ID available for user');
          this.appInsights.logTrace('No family ID available for user', { email: this.userEmail });
        }
      }
    });
  }

  /** Take photo using device camera */
  async takePhoto() {
    try {
      this.appInsights.logEvent('TakePhoto_Started', { platform: 'Native' });
      
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
        
        this.appInsights.logEvent('TakePhoto_Completed', { 
          platform: 'Native',
          fileSize: file.size,
          fileType: file.type
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      this.appInsights.logException(error instanceof Error ? error : new Error('Unknown error taking photo'));
      this.appInsights.logEvent('TakePhoto_Failed', { platform: 'Native', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /** Take photo using browser camera */
  async takeBrowserPhoto() {
    try {
      this.appInsights.logEvent('TakePhoto_Started', { platform: 'Browser' });
      
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
      
      this.appInsights.logEvent('TakePhoto_Completed', { 
        platform: 'Browser',
        fileSize: file.size,
        fileType: file.type,
        dimensions: `${canvas.width}x${canvas.height}`
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.appInsights.logException(error instanceof Error ? error : new Error('Unknown error accessing camera'));
      this.appInsights.logEvent('TakePhoto_Failed', { platform: 'Browser', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /** Handle file selection manually */
  onFilesSelected(event: any) {
    this.appInsights.logEvent('FilesSelected', { 
      count: event.target.files.length,
      method: 'FileDialog'
    });
    this.processFiles(event.target.files);
  }

  /** Handle file dropping */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.appInsights.logEvent('FilesSelected', { 
        count: event.dataTransfer.files.length,
        method: 'DragAndDrop'
      });
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
    const fileSizes: number[] = [];
    const fileTypes: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.uploadProgress.push(0);
      fileSizes.push(files[i].size);
      fileTypes.push(files[i].type);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(files[i]);
    }
    
    this.appInsights.logEvent('FilesProcessed', {
      count: files.length,
      totalSize: fileSizes.reduce((a, b) => a + b, 0),
      averageSize: fileSizes.reduce((a, b) => a + b, 0) / files.length,
      fileTypes: fileTypes.join(',')
    });
  }

  removeFile(index: number) {
    const removedFile = this.selectedFiles[index];
    this.appInsights.logEvent('FileRemoved', {
      fileType: removedFile.type,
      fileSize: removedFile.size,
      fileName: removedFile.name
    });
    
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.uploadProgress.splice(index, 1);
  }
 
  async uploadSingleFile(index: number) {
    const file = this.selectedFiles[index];
    const startTime = new Date().getTime();
    
    try {
      this.appInsights.logEvent('FileUpload_Started', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        index: index
      });
      
      this.uploadErrors[index] = '';
      const url = environment.apiUrl + `/api/GetUploadUrlFunction?nocache=${new Date().getTime()}`;
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
              
              // Log progress milestones (25%, 50%, 75%)
              if (this.uploadProgress[index] === 25 || 
                  this.uploadProgress[index] === 50 || 
                  this.uploadProgress[index] === 75) {
                this.appInsights.logEvent('FileUpload_Progress', {
                  fileName: file.name,
                  progress: this.uploadProgress[index],
                  fileSize: file.size
                });
              }
            } else if (event.type === HttpEventType.Response) {
              console.log('File uploaded successfully:', event.body);
              delete this.uploadErrors[index];
              
              const endTime = new Date().getTime();
              const duration = endTime - startTime;
              
              this.appInsights.logEvent('FileUpload_Completed', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                durationMs: duration,
                uploadSpeed: Math.round((file.size / 1024) / (duration / 1000)) + ' KB/s'
              });
              
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
            
            this.appInsights.logEvent('FileUpload_Failed', {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              errorType: error.status ? error.status.toString() : 'unknown',
              errorMessage: errorMessage
            });
            
            this.appInsights.logException(
              error instanceof Error ? error : new Error(`Upload failed: ${errorMessage}`),
              2 // Medium severity
            );
            
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
      
      this.appInsights.logEvent('FileUpload_Failed', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        stage: 'GetUploadUrl',
        errorMessage: errorMessage
      });
      
      this.appInsights.logException(
        error instanceof Error ? error : new Error(`Upload failed (GetUploadUrl): ${errorMessage}`),
        2 // Medium severity
      );
      
      throw error; // Re-throw to be caught by uploadFiles
    }
  }

  async uploadFiles() {
    const startTime = new Date().getTime();
    const fileCount = this.selectedFiles.length;
    const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
    
    if (!this.selectedFiles.length || !this.familyId) {
      this.generalError = 'No files selected or no family ID available';
      this.appInsights.logEvent('UploadFiles_Error', {
        error: this.generalError,
        hasFiles: this.selectedFiles.length > 0,
        hasFamilyId: !!this.familyId
      });
      return;
    }

    this.appInsights.logEvent('UploadFiles_Started', {
      fileCount: fileCount,
      totalSize: totalSize,
      familyId: this.familyId
    });
    
    this.uploading = true;
    this.generalError = null;
    this.uploadErrors = {};

    let hasErrors = false;
    let successCount = 0;

    for (let i = 0; i < this.selectedFiles.length; i++) {
      try {
        await this.uploadSingleFile(i);
        successCount++;
      } catch (error) {
        hasErrors = true;
        // Individual file errors are already handled in uploadSingleFile
      }
    }

    this.uploading = false;
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    this.appInsights.logEvent('UploadFiles_Completed', {
      fileCount: fileCount,
      successCount: successCount,
      errorCount: fileCount - successCount,
      totalSize: totalSize,
      durationMs: duration,
      hasErrors: hasErrors
    });
    
    // Add metrics for uploads
    this.appInsights.logMetric('Upload_BatchSize', fileCount);
    this.appInsights.logMetric('Upload_SuccessRate', (successCount / fileCount) * 100);
    this.appInsights.logMetric('Upload_Duration', duration);
    
    if (!hasErrors) {
      this.closeupload.emit(true);
    }
  } 
}