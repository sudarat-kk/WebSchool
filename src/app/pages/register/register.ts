import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onBack(): void {
    console.log('Back clicked');
  }

  onSubmit(): void {
    console.log('Submit clicked');
  }

  onGoogleLogin(): void {
    console.log('Google Login clicked');
    // ตรงนี้ใส่ Logic การทำ Google OAuth2 หรือ Firebase Auth เพิ่มเติมได้เลยครับ
  }
}
