import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-training-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './training-results.html',
  styleUrl: './training-results.scss',
})
export class TrainingResults {
  // 2. Inject Router ผ่าน Constructor
  constructor(private router: Router) {}

  goBack(): void {
    // นำทางกลับหน้าก่อนหน้า
    window.history.back();
  }

  // ในไฟล์ .ts
  selectMenu(menuType: string): void {
    // ตรวจสอบว่ากำหนดเป็น string
    switch (menuType) {
      case 'statistics':
        this.router.navigate(['/training-results/training-statistics']);
        break;
      case 'summary':
        this.router.navigate(['/training-results/training-summary']);
        break;
    }
  }
}
