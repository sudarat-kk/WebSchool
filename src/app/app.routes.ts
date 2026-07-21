import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Login } from './pages/login/login';
import { Score } from './pages/score/score';
import { Teacher } from './main/teacher/teacher';
import { Admin } from './main/admin/admin';
import { AdminLogin } from './pages/admin-login/admin-login';
import { ScoreManagement } from './pages/score-management/score-management';

export const routes: Routes = [
  { path: '', component: Home },

  { path: 'student', component: Student },

  // 2. หน้า Admin Login → เข้าสู่ระบบผู้ดูแล
  { path: 'admin-login', component: AdminLogin },

  // 3. หน้า Admin Dashboard
  { path: 'admin', component: Admin },

  // 4. หน้ากรอกคะแนน (admin)
  { path: 'admin/scoremanagement', component: ScoreManagement },

  {
    path: 'student',
    children: [
      { path: '', component: Student }, // เข้าด้วย /student
      { path: 'login', component: Login }, // เข้าด้วย /student/login
      { path: 'score', component: Score }, // เข้าด้วย /student/score
      { path: 'teacher', component: Teacher },
      { path: 'admin', component: Admin },
    ],
  },
];
