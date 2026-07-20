import { Component, OnInit, ElementRef, inject, ChangeDetectorRef } from '@angular/core';


// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CourseService } from '../services/course.service';


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
  // สร้าง Array มารอรับข้อมูลจาก Backend
  // โครงสร้างเมนูของคุณ (แก้ไขตามที่มีอยู่จริง)
  menuData: any[] = [
    {
      title: 'สำหรับผู้เรียน',
      submenus: [], // เราจะเอาข้อมูล API มายัดใส่ตรงนี้
    },
    {
      title: 'สำหรับครู-อาจารย์',
      submenus: [], // เราจะเอาข้อมูล API มายัดใส่ตรงนี้
    },
    {
      title: 'สำหรับคณะกับกำหลักสูตร',
      submenus: [], // เราจะเอาข้อมูล API มายัดใส่ตรงนี้
    },
    {
      title: 'แบบประเมินติดตามผู้สำเร็จฯ',
      submenus: [
        { course_name: 'นายสิบอาวุโส (เร่งรัด)', batches: [] },
        { course_name: 'นายสิบชั้นต้น (เร่งรัด)', batches: [] },
        { course_name: 'ช่างอิเล็กทรอนิกส์', batches: [] },
        { course_name: 'นนส.ทบ. เหล่า ส.', batches: [] },
      ], // เราจะเอาข้อมูล API มายัดใส่ตรงนี้
    },
    {
      title: 'สรุปผลการฝึกอบรม',
      simpleItems: [
        'ชั้นนายพัน',
        'นายสิบอาวุโส',
        'นายสิบชั้นต้น',
        'ช่างอิเล็กทรอนิกส์',
        'นักเรียนนายสิบ เหล่า ส.',
      ], // เราจะเอาข้อมูล API มายัดใส่ตรงนี้
    },
    {
      title: 'สรุปผลการประเมินฯ',
      simpleItems: [
        'ชั้นนายพัน',
        'ชั้นนายร้อย',
        'นายสิบอาวุโส (เร่งรัด)',
        'นายสิบชั้นต้น (เร่งรัด)',
        'ช่างอิเล็กทรอนิกส์',
        'นนส.ทบ.',
      ], // เราจะเอาข้อมูล API มายัดใส่ตรงนี้
    },
  ];

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (response) => {
        if (response.success) {
          // หา index ของเมนูที่ชื่อ 'สำหรับผู้เรียน'
          const studentMenuIndex = this.menuData.findIndex((m) => m.title === 'สำหรับผู้เรียน');
          if (studentMenuIndex !== -1) {
            // เอาข้อมูลจาก API ยัดเข้าไปแทนที่
            this.menuData[studentMenuIndex].submenus = response.data;
          }

          // หา index ของเมนูที่ชื่อ 'สำหรับครู-อาจารย์'
          const teacherMenuIndex = this.menuData.findIndex((m) => m.title === 'สำหรับครู-อาจารย์');
          if (teacherMenuIndex !== -1) {
            // เอาข้อมูลจาก API ยัดเข้าไปแทนที่
            this.menuData[teacherMenuIndex].submenus = response.data;
          }

          // 3. ใส่ข้อมูลให้เมนู "สำหรับคณะกับกำหลักสูตร"
          const committeeMenuIndex = this.menuData.findIndex(
            (m) => m.title === 'สำหรับคณะกับกำหลักสูตร',
          );
          if (committeeMenuIndex !== -1) {
            this.menuData[committeeMenuIndex].submenus = response.data;
          }
        }
      },
      error: (error) => {
        console.error('API Error:', error);
      },
    });
  }

  private setMockData(): void {
    this.menuData = [
      { id: 'menu_1', title: 'หน้าแรก (Mock)', path: '/', role: 'all' },
      { id: 'menu_2', title: 'สำหรับผู้เรียน', path: '/student', role: 'student' }
    ];
  }
}