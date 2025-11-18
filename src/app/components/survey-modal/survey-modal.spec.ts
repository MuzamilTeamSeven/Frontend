import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyModal } from './survey-modal';

describe('SurveyModal', () => {
  let component: SurveyModal;
  let fixture: ComponentFixture<SurveyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
