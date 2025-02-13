import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'] 
})
export class UploadComponent {
  @Output() closeupload =new EventEmitter<boolean>(false);
  selectedFile: File | null = null;
  uploadUrl: string | null = null;
  userEmail: string | null = null;
  uploadProgress = 0;
  uploading = false;
  uploadedFileUrl: string | null = null;
  imagePreview: string | null = null;
  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    // Get user email from Google Auth
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userEmail = user.email;
      }
    });
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Generate a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Set the preview URL
      };
      reader.readAsDataURL(this.selectedFile); // Read the file as a Data URL
    }
  } 
  async getSignedUrl() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const url = `https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/GetUploadUrlFunction`;
    
    try {
      const response: any = await this.http.get(url).toPromise();
      this.uploadUrl = response.uploadUrl;
      await this.uploadFile();
    } catch (error) {
      console.error('Error fetching signed URL:', error);
    }
  }
  isImageFile(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|bmp)$/i.test(url);
  }
  async uploadFile() {
    if (!this.uploadUrl || !this.selectedFile) return;

    this.uploading = true;
    this.uploadProgress = 0;

    const headers = new HttpHeaders({
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': this.selectedFile.type,
      'x-ms-meta-email': this.userEmail || '',
      'x-ms-meta-familyId': '1' // Hardcoded, replace with dynamic value if needed
    });

    try {
      this.http.put(this.uploadUrl, this.selectedFile, { headers }).subscribe(
        (event: any) => {
           
          this.closeupload.emit(true);
        },
        () => {
          this.uploading = false;
         
        }
      );
    } catch (error) {
      console.error('Upload failed:', error);
    }
  } 
  closeUpload(){

  }
}
