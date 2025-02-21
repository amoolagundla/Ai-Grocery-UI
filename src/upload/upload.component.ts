import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload', 
  imports:[CommonModule],
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
  isDraggingOver = false; // UI effect for drag-and-drop area
  familyId: string | null = null;
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

  /** Handles file selection manually */
  onFilesSelected(event: any) {
    this.processFiles(event.target.files);
  }

  /** Handles file dropping */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false; // Reset drag effect

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  /** Handles file drag over */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  /** Handles file drag leave */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  /** Processes selected or dropped files */
  processFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.uploadProgress.push(0); // Initialize progress tracking

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(files[i]);
    }
  }

  /** Removes a file */
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.uploadProgress.splice(index, 1);
  }

  /** Uploads all selected files */
  async uploadFiles() {
    if (!this.selectedFiles.length) return;

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

  /** Uploads a single file with progress tracking */
  async uploadSingleFile(index: number) {
    try {
      // Get signed URL
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