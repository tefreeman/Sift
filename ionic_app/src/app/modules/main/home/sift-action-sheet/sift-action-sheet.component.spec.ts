import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiftActionSheetComponent } from './sift-action-sheet.component';

describe('SiftActionSheetComponent', () => {
  let component: SiftActionSheetComponent;
  let fixture: ComponentFixture<SiftActionSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiftActionSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiftActionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
