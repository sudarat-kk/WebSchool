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

  // 2. หมวดหมู่นักเรียน
  {
    path: 'student',
    children: [
      { path: '', component: Student },      // /student
      { path: 'login', component: Login },   // /student/login
      { path: 'score', component: Score },   // /student/score
    ],
  },

  // 3. หมวดหมู่ครูและแอดมิน (ย้ายออกมาให้อยู่ระดับเดียวกับ student)
  { path: 'teacher', component: Teacher }, // เข้าด้วย /teacher
  { path: 'admin', component: Admin }, // เข้าด้วย /admin
];
