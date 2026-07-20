import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Login } from './pages/login/login';
import { Score } from './pages/score/score';
import { Teacher } from './main/teacher/teacher';
import { Admin } from './main/admin/admin';

export const routes: Routes = [
  // 1. หน้าแรก
  { path: '', component: Home },
  {
    path: 'student',
    children: [
      { path: '', component: Student }, // เข้าด้วย /student
      { path: 'login', component: Login }, // เข้าด้วย /student/login
      { path: '', component: Home },
      { path: 'student', component: Student },
      { path: 'teacher', component: Teacher },
      { path: 'admin', component: Admin },
    ],
  },
];
