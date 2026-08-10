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
import { AdminLogin } from './pages/admin-login/admin-login';
import { Addstudent } from './pages/addstudent/addstudent';
import { TrainingStatistics } from './pages/training-statistics/training-statistics';
import { TrainingSummary } from './pages/training-summary/training-summary';
import { TrainingResults } from './pages/training-results/training-results';
import { Register } from './pages/register/register';
import { ScoreSubmission } from './pages/score-submission/score-submission';


export const routes: Routes = [
  // หน้าแรก
  { path: '', component: Home },

  // ส่วนของนักเรียน
  {
    path: 'student',
    children: [
      { path: '', component: Student }, // เข้าด้วย /student
      { path: 'login', component: Login }, // เข้าด้วย /student/login
    ],
  },
  //สรุปผลสถิติ
   {
    path: 'training-results',
    children: [
      { path: '', component: TrainingResults }, 
      { path: 'training-statistics', component: TrainingStatistics },
      { path: 'training-summary', component: TrainingSummary }     
    ]
  },

  // ส่วนของครู
  { path: 'teacher', component: Teacher },

  // ส่วนของแอดมิน
  {
    path: 'admin',
    children: [
      { path: '', component: Admin }, // เข้าด้วย /admin
      { path: 'login', component: AdminLogin }, // เข้าด้วย /admin/login
      { path: 'scoremanagement', component: ScoreManagement },
      { path: 'ScoreList', component: ScoreList },
      { path: 'form', component: From },
      { path: 'classoverview', component: ClassOverview },
      { path: 'addstudent', component: Addstudent },
    ],
  },

  {path:'register',component: Register},

  {path:'score-submission',component: ScoreSubmission},

  // ส่วนของคะแนน (ทั่วไป)
  { path: 'score', component: Score },

  // กรณีพิมพ์ URL ผิดให้เด้งกลับหน้าแรก
  { path: '**', redirectTo: '' }
];
