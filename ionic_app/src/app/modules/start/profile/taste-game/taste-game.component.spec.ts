import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasteGameComponent } from './taste-game.component';

describe('TasteGameComponent', () => {
  let component: TasteGameComponent;
  let fixture: ComponentFixture<TasteGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasteGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasteGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
