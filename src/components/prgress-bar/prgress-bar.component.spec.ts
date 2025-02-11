import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrgressBarComponent } from './prgress-bar.component';

describe('PrgressBarComponent', () => {
  let component: PrgressBarComponent;
  let fixture: ComponentFixture<PrgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrgressBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
