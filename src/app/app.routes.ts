import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Teacher } from './main/teacher/teacher';
import { Admin } from './main/admin/admin';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'student', component: Student },
  { path: 'teacher', component: Teacher },
  { path: 'admin', component: Admin },
];
