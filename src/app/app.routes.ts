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
import { TrainingSummaryComponent } from './pages/training-summary/training-summary';
import { EvaluationSummaryComponent } from './pages/evaluation-summary/evaluation-summary';
import { FollowUpComponent } from './pages/follow-up/follow-up';
import { Committee } from './main/committee/committee';


import { AddCourse } from './pages/add-course-dialog/add-course-dialog';

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
      { path: 'addcourse', component: AddCourse },
    ],
  },

  // ส่วนของคะแนน (ทั่วไป)
  { path: 'score', component: Score },

  // หน้าใหม่ที่เพิ่มเข้ามา
  { path: 'training-summary', component: TrainingSummaryComponent },
  { path: 'evaluation-summary', component: EvaluationSummaryComponent },
  { path: 'follow-up', component: FollowUpComponent },
  { path: 'committee', component: Committee },

  // กรณีพิมพ์ URL ผิดให้เด้งกลับหน้าแรก
  { path: '**', redirectTo: '' }
];
