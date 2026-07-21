import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Login } from './pages/login/login';
import { Score } from './pages/score/score';
import { Teacher } from './main/teacher/teacher';
import { Admin } from './main/admin/admin';
import { ScoreManagement } from './pages/score-management/score-management';
import { From } from './main/from/from';
import { ScoreList } from './pages/score-list/score-list';
import { ClassOverview } from './pages/class-overview/class-overview';

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
  {
    path: 'admin',
    children: [
      { path: '', component: Admin },
      { path: 'scoremanagement', component: ScoreManagement },

      // 💡 เปลี่ยนตรงนี้จาก 'scorelist' เป็น 'ScoreList' ให้ตรงกับที่ Error ฟ้องครับ
      { path: 'ScoreList', component: ScoreList },

      { path: 'form', component: From },
      { path: 'classoverview', component: ClassOverview },
    ],
  },
];
