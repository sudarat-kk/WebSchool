import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavService } from '../services/nav';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  // สร้าง Array มารอรับข้อมูลจาก Backend
  menuData: any[] = [];

  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.getNavigationData().subscribe({
      next: (data) => {
        this.menuData = data;
      },
      error: (err) => {
        console.error('ไม่สามารถดึงข้อมูลเมนูได้, ใช้ข้อมูลจำลองแทน:', err);
        this.menuData = [
          { id: 'menu_1', title: 'หน้าแรก (Mock)', path: '/', role: 'all' },
          { id: 'menu_2', title: 'สำหรับผู้เรียน', path: '/student', role: 'student' },
        ];
      },
    });
  }
}
