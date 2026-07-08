import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'student', component: Student },
];
