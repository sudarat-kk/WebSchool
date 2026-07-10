import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './main/student/student';
import { Login } from './pages/login/login';


export const routes: Routes = [
  { path: '', component: Home },
  { 
  path: 'student', 
  children: [
    { path: '', component: Student }, // เข้าด้วย /student
    { path: 'login', component: Login } // เข้าด้วย /student/login
  ] 
}
];
