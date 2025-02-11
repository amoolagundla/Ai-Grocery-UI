import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './prgress-bar.component.html',
  styleUrls: ['./prgress-bar.component.css']
})
export class PrgressBarComponent {
  @Input() progress = 0;
  @Input() show = false;
}
