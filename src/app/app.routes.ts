import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Login } from './pages/login/login';
import { Teacher } from './main/teacher/teacher';
import { Admin } from './main/admin/admin';
import { ScoreManagement } from './pages/score-management/score-management';


export const routes: Routes = [
  { path: '', component: Home },
  { 
  path: 'student', 
  children: [
    { path: '', component: Student }, // เข้าด้วย /student
    { path: 'login', component: Login } ,// เข้าด้วย /student/login
    { path: '', component: Home },
  { path: 'student', component: Student },
  { path: 'teacher', component: Teacher },
  ] 
},
{
    path: 'admin',
    children: [
      { path: '', component: Admin }, // เข้าด้วย /admin
      { path: 'scoremanagement', component: ScoreManagement } // เข้าด้วย /admin/scoremanagement
    ]
  },
]
