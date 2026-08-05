import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Admin } from './admin';
import { RouterModule } from '@angular/router';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin, RouterModule.forRoot([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
