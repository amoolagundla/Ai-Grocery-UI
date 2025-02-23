import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCacheService } from '../../services/ImageCacheService';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-cached-image',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule  // Make sure this is included
  ],
  providers: [
    ImageCacheService
  ],
  template: `
    <div class="image-container">
      <img 
        [src]="imageSource || placeholderImage" 
        [alt]="alt"
        (error)="onImageError()"
        [class.loading]="loading"
        class="max-w-lg max-h-[80vh] rounded-lg shadow-lg"
      />
       
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
export class CachedImageComponent implements OnInit, OnChanges {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() placeholderImage: string = 'assets/placeholder.png';

  imageSource: string | null = null;
  loading: boolean = true;

  constructor(private imageCacheService: ImageCacheService) { }
  ngOnChanges(changes: SimpleChanges): void {
    const { src } = changes;
    if (src != null && src.currentValue != null) {
      this.imageSource = src.currentValue;
      this.loading=false;
    }
  }

  ngOnInit(): void {
    this.loadImage();
  }

  private loadImage(): void {
    this.loading = true;
  }

  onImageError(): void {
    this.imageSource = this.placeholderImage;
    this.loading = false;
  }
}