import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Login } from './pages/login/login';
import { Teacher } from './main/teacher/teacher';
import { Admin } from './main/admin/admin';
import { ScoreManagement } from './pages/score-management/score-management';
import { From } from './main/from/from';
import { ScoreList } from './pages/score-list/score-list';
import { ClassOverview } from './pages/class-overview/class-overview';

export const routes: Routes = [
  // 1. หน้าหลัก (Root)
  { path: '', component: Home },
  
  // 2. หน้าสำหรับอาจารย์/ผู้สอน (/teacher)
  { path: 'teacher', component: Teacher },

  // 3. กลุ่มของนักเรียน (/student)
  { 
    path: 'student', 
    children: [
      { path: '', component: Student },       // เข้าด้วย /student
      { path: 'login', component: Login }      // เข้าด้วย /student/login
    ] 
  },

  // 4. กลุ่มของแอดมิน (/admin)
  // 📄 แก้ไขในไฟล์ app.routes.ts
{
  path: 'admin',
  children: [
    { path: '', component: Admin },
    { path: 'scoremanagement', component: ScoreManagement },
    
    // 💡 เปลี่ยนตรงนี้จาก 'scorelist' เป็น 'ScoreList' ให้ตรงกับที่ Error ฟ้องครับ
    { path: 'ScoreList', component: ScoreList }, 
    
    { path: 'form', component: From },
    { path: 'classoverview', component: ClassOverview },
  ]
}
];