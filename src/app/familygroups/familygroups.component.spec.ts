import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilygroupsComponent } from './familygroups.component';

describe('FamilygroupsComponent', () => {
  let component: FamilygroupsComponent;
  let fixture: ComponentFixture<FamilygroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilygroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilygroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
