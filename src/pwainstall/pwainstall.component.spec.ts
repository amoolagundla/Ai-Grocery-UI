import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwainstallComponent } from './pwainstall.component';

describe('PwainstallComponent', () => {
  let component: PwainstallComponent;
  let fixture: ComponentFixture<PwainstallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwainstallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwainstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
