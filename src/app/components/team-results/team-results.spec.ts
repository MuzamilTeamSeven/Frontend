import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamResults } from './team-results';

describe('TeamResults', () => {
  let component: TeamResults;
  let fixture: ComponentFixture<TeamResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
