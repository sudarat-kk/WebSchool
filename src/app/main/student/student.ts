import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './student.html',
  styleUrl: './student.scss',
})
export class Student implements OnInit {
  courses: { text: string; status: string }[] = [];
  allSubjects: { text: string; status: string }[] = [];
  selectedAssessment: string = '';
  searchText: string = '';

  get filteredCourses() {
    if (!this.searchText) {
      return this.courses;
    }
    const lowerSearch = this.searchText.toLowerCase();
    return this.courses.filter(course => 
      course.text.toLowerCase().includes(lowerSearch)
    );
  }

  constructor(private http: HttpClient) {}

  onSearch(event: any) {
    this.searchText = event.target.value;
  }

  ngOnInit() {
    this.http.get<any[]>('assets/data/Subject .json').subscribe(data => {
      const subjects: { text: string; status: string }[] = [];
      data.forEach(group => {
        if (group.subjects && Array.isArray(group.subjects)) {
          group.subjects.forEach((subject: any) => {
            subjects.push({ text: subject.name, status: 'red' });
          });
        }
      });
      this.allSubjects = subjects;
    });
  }

  onAssessmentChange(event: any) {
    this.selectedAssessment = event.target.value;
    
    if (this.selectedAssessment === '1') {
      // 1: ประเมินอาจารย์ผู้สอน -> แสดงรายวิชาทั้งหมด
      this.courses = [...this.allSubjects];
    } else if (this.selectedAssessment === '2') {
      // 2: ประเมินอาจารย์กำกับหลักสูตร -> แสดง 1 กรอบ
      this.courses = [{ text: 'ประเมินอาจารย์กำกับหลักสูตร', status: 'red' }];
    } else if (this.selectedAssessment === '3') {
      // 3: ประเมินหลักสูตร -> แสดง 1 กรอบ
      this.courses = [{ text: 'ประเมินหลักสูตร', status: 'red' }];
    } else {
      this.courses = [];
    }
  }

  openForm(course: any) {
    let formUrl = '';
    
    // 1: ประเมินอาจารย์ผู้สอน, 2: ประเมินอาจารย์กำกับหลักสูตร, 3: ประเมินหลักสูตร
    if (this.selectedAssessment === '2') {
      formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSerSm-Idz-9DGSSx9IF3yc4mWTsrbnyQghnMYw3_QCGh6CEHg/viewform';
    } else if (this.selectedAssessment === '3') {
      formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdyF5cio1VlgkEDo7xm5GuvtQlUz7HKCclsQi7l_QHcmBNmSQ/viewform';
    }
     else if (this.selectedAssessment === '1') {
      formUrl = 'https://forms.gle/cGD8JZUmguSTagtp9';
    } else {
      // Default fallback
      formUrl = 'https://forms.gle/cGD8JZUmguSTagtp9';
    }
    
    // Open Google Form in a new tab
    window.open(formUrl, '_blank');
    
    // Wait a brief moment to allow the new tab to open, 
    // then show a confirmation dialog when they return to this tab.
    setTimeout(() => {
      const isConfirmed = window.confirm('คุณได้ทำแบบประเมินเสร็จสิ้นแล้วใช่หรือไม่?\n(กด OK เพื่อยืนยันว่าทำเสร็จแล้ว)');
      if (isConfirmed) {
        course.status = 'green';
      }
    }, 500);
  }
}
