import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CourseService } from '../../services/course.service';
import Swal from 'sweetalert2';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-course-dialog.html',
  styleUrl: './add-course-dialog.scss',
})
export class AddCourse implements OnInit {
  
  // Data lists from DB
  courses: any[] = [];
  batches: any[] = [];
  groups: any[] = [];
  
  // Form states
  courseForm = { course_name: '', curriculum_year: null };
  
  // Cascading states for Batch Form
  selectedCourseNameForBatch: string = '';
  batchForm = { course_id: '', batch_name: '', start_date: '', end_date: '' };
  
  // Cascading states for Group Form
  selectedCourseNameForGroup: string = '';
  selectedCourseIdForGroup: string = '';
  groupForm = { batch_id: '', group_name: '', credits: null };
  
  // Cascading states for Subject Form
  selectedCourseNameForSubject: string = '';
  selectedCourseIdForSubject: string = '';
  selectedBatchForSubject: string = '';
  subjectForm = { group_id: '' };
  subjectsList: { subject_name: string }[] = [{ subject_name: '' }];

  constructor(private location: Location, private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.courseService.getAllCourses().subscribe({
      next: (res) => { if(res.success) this.courses = res.data; },
      error: (err) => console.error(err)
    });
    this.courseService.getAllBatches().subscribe({
      next: (res) => { if(res.success) this.batches = res.data; },
      error: (err) => console.error(err)
    });
    this.courseService.getAllSubjectGroups().subscribe({
      next: (res) => { if(res.success) this.groups = res.data; },
      error: (err) => console.error(err)
    });
  }

  // Helpers for Course Names
  getUniqueCourseNames(): string[] {
    const names = this.courses.map(c => c.course_name);
    return Array.from(new Set(names));
  }

  getCoursesByName(name: string): any[] {
    if (!name) return [];
    return this.courses.filter(c => c.course_name === name);
  }

  // Filter methods for cascading dropdowns
  getBatchesForCourse(courseId: string) {
    if (!courseId) return [];
    return this.batches.filter((b: any) => b.course_id.toString() === courseId.toString());
  }

  getGroupsForBatch(batchId: string) {
    if (!batchId) return [];
    return this.groups.filter((g: any) => g.batch_id.toString() === batchId.toString());
  }

  onClose(): void {
    this.location.back();
  }

  onSubmitCourse() {
    this.courseService.addCourse(this.courseForm).subscribe({
      next: (res) => {
        Swal.fire('สำเร็จ!', 'เพิ่มหลักสูตรเรียบร้อยแล้ว', 'success');
        this.courseForm = { course_name: '', curriculum_year: null };
        this.loadAllData(); // reload
      },
      error: (err) => {
        Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเพิ่มหลักสูตรได้', 'error');
        console.error(err);
      }
    });
  }

  onSubmitBatch() {
    this.courseService.addBatch(this.batchForm).subscribe({
      next: (res) => {
        Swal.fire('สำเร็จ!', 'เพิ่มรุ่นเรียบร้อยแล้ว', 'success');
        this.batchForm = { course_id: '', batch_name: '', start_date: '', end_date: '' };
        this.selectedCourseNameForBatch = '';
        this.loadAllData();
      },
      error: (err) => {
        Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเพิ่มรุ่นได้', 'error');
        console.error(err);
      }
    });
  }

  onSubmitSubjectGroup() {
    this.courseService.addSubjectGroup(this.groupForm).subscribe({
      next: (res) => {
        Swal.fire('สำเร็จ!', 'เพิ่มกลุ่มวิชาเรียบร้อยแล้ว', 'success');
        this.groupForm = { batch_id: '', group_name: '', credits: null };
        this.selectedCourseNameForGroup = '';
        this.selectedCourseIdForGroup = '';
        this.loadAllData();
      },
      error: (err) => {
        Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเพิ่มกลุ่มวิชาได้', 'error');
        console.error(err);
      }
    });
  }

  addSubjectField() {
    this.subjectsList.push({ subject_name: '' });
  }

  removeSubjectField(index: number) {
    if (this.subjectsList.length > 1) {
      this.subjectsList.splice(index, 1);
    }
  }

  async onSubmitSubject() {
    if (!this.subjectForm.group_id) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกกลุ่มวิชา', 'warning');
      return;
    }

    const validSubjects = this.subjectsList.filter(s => s.subject_name.trim() !== '');
    if (validSubjects.length === 0) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อรายวิชาอย่างน้อย 1 วิชา', 'warning');
      return;
    }

    try {
      // ยิง API วนลูปทีละวิชา หรือพร้อมกัน
      const promises = validSubjects.map(s => 
        lastValueFrom(this.courseService.addSubject({
          group_id: this.subjectForm.group_id,
          subject_name: s.subject_name
        }))
      );

      await Promise.all(promises);

      Swal.fire('สำเร็จ!', `เพิ่มรายวิชาทั้งหมด ${validSubjects.length} วิชา เรียบร้อยแล้ว`, 'success');
      this.subjectsList = [{ subject_name: '' }];
      this.selectedCourseNameForSubject = '';
      this.selectedCourseIdForSubject = '';
      this.selectedBatchForSubject = '';
      this.subjectForm.group_id = '';
      
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเพิ่มรายวิชาได้บางส่วน', 'error');
      console.error(err);
    }
  }

  getGroupLabel(g: any): string {
    const nameUpper = (g.group_name || '').toUpperCase();
    let type = '';
    if (nameUpper.startsWith('MN')) type = 'วิชารอง';
    else if (nameUpper.startsWith('M')) type = 'วิชาหลัก';
    else if (nameUpper.startsWith('S')) type = 'วิชาประกอบ';
    else if (nameUpper.startsWith('P')) type = 'ภาคปฏิบัติ';
    
    let label = g.group_name;
    if (type) {
      label += ` (${type})`;
    }
    if (g.credits) {
      label += ` - ${g.credits} หน่วยกิต`;
    }
    return label;
  }
}