import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    Swal.fire({
      title: 'ออกจากระบบ',
      text: 'คุณต้องการออกจากระบบผู้ดูแลระบบใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.adminLogout();
        this.router.navigate(['/admin/login']);
      }
    });
  }
}
