import { Component, Input, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ImageCacheService } from '../../services/ImageCacheService'; 

@Component({
  selector: 'app-cached-image',
  standalone: true,
  imports: [CommonModule ],
  template: `
    <div class="image-container">
      <img 
        [src]="imageSource || placeholderImage" 
        [alt]="alt"
        (error)="onImageError()"
        [class.loading]="loading"
        class="image"
      />
      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      overflow: hidden;
    }

    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .image.loading {
      opacity: 0.5;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.5);
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class CachedImageComponent implements OnInit {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() placeholderImage: string = 'assets/placeholder.png';

  imageSource: string | null = null;
  loading: boolean = true;

  constructor(private imageCacheService: ImageCacheService) {}

  ngOnInit(): void {
    this.loadImage();
  }

  private loadImage(): void {
    this.loading = true;
    this.imageCacheService.getImage(this.src).subscribe({
      next: (base64Image) => {
        this.imageSource = base64Image;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading image:', error);
        this.onImageError();
      }
    });
  }

  onImageError(): void {
    this.imageSource = this.placeholderImage;
    this.loading = false;
  }
}