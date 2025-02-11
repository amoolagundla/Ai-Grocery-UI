import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  uploadUrl: string | null = null;
  userEmail: string | null = null;

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

  async uploadFile() {
    if (!this.uploadUrl || !this.selectedFile) return;

    const headers = new HttpHeaders({
      'x-ms-blob-type': 'BlockBlob',
      'x-ms-meta-email': this.userEmail || '',
      'x-ms-meta-familyId': '1' // Hardcoded, you can replace this with a dynamic value
    });

    try {
      await this.http.put(this.uploadUrl, this.selectedFile, { headers }).toPromise();
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
  closeUpload(){
    
  }
}
