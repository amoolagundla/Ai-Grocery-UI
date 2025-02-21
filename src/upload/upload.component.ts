import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

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

  async uploadFiles() {
    if (!this.selectedFiles.length || !this.familyId) {
      console.error('No files selected or no family ID available');
      return;
    }

    this.uploading = true;
    for (let i = 0; i < this.selectedFiles.length; i++) {
      await this.uploadSingleFile(i);
    }

    this.uploading = false;
    this.closeupload.emit(true);
  }

  async uploadSingleFile(index: number) {
    try {
      const url = `https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/GetUploadUrlFunction?nocache=${new Date().getTime()}`;
      const response: any = await this.http.get(url).toPromise();

      const uploadUrl = response.uploadUrl;
      const headers = new HttpHeaders({
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': this.selectedFiles[index].type,
        'x-ms-meta-email': this.userEmail || '',
        'x-ms-meta-familyId': this.familyId || '1',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      this.http.put(uploadUrl, this.selectedFiles[index], { headers, reportProgress: true, observe: 'events' })
        .subscribe((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress[index] = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            console.log('File uploaded successfully:', event.body);
          }
        });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
}