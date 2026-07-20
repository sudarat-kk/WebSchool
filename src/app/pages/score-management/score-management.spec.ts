import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreManagement } from './score-management';

describe('ScoreManagement', () => {
  let component: ScoreManagement;
  let fixture: ComponentFixture<ScoreManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
