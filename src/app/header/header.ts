import { Component, OnInit, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

// Service
import { NavService } from '../services/nav';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
  menuData: any[] = [];

  // inject เครื่องมือช่วยอัปเดตหน้าจอของ Angular
  private cdr = inject(ChangeDetectorRef);

  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.getNavigationData().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.menuData = data;
        } else {
          // ใส่ข้อมูลสำรองกันพลาดไว้ ถ้ารีเฟรชแล้ว API ดึงข้อมูลมาช้า
          this.setMockData();
        }
        // สั่งให้ Angular บังคับเช็กและวาดหน้าจอใหม่ทันทีที่มีข้อมูลเข้ามา
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ไม่สามารถดึงข้อมูลเมนูได้, ใช้ข้อมูลจำลองแทน:', err);
        this.setMockData();
        this.cdr.detectChanges();
      }
    });
  }

  private setMockData(): void {
    this.menuData = [
      { id: 'menu_1', title: 'หน้าแรก (Mock)', path: '/', role: 'all' },
      { id: 'menu_2', title: 'สำหรับผู้เรียน', path: '/student', role: 'student' }
    ];
  }
}