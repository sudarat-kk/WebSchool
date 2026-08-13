import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DropdownService } from '../../services/dropdown.service';
import { StudentService } from '../../services/student.service';
import { CourseService, CourseGroup, BatchItem } from '../../services/course.service';
import Swal from 'sweetalert2';

export interface Student {
  id: number;
  rank: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  password?: string;
  affiliation: string;
  student_code?: string;
  rank_name?: string;
  first_name?: string;
  last_name?: string;
  showPassword?: boolean; // สำหรับเปิดปิดตาดูรหัสในตาราง
}

@Component({
  selector: 'app-addstudent',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './addstudent.html',
  styleUrls: ['./addstudent.scss'],
})
export class Addstudent implements OnInit {
  constructor(
    private router: Router,
    private location: Location,
    private courseService: CourseService,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  activeTab: 'single' | 'excel' | 'file' = 'single';
  students: Student[] = [];
  studentForm: Student = this.getEmptyForm();
  isEditing: boolean = false;
  editingId: number | null = null;
  excelData: string = '';
  selectedFileName: string = '';
  selectedFile: File | null = null;
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  courseGroups: CourseGroup[] = [];
  availableBatches: BatchItem[] = [];
  selectedCourse: string = '';
  selectedBatch: string = '';

  ngOnInit() {
    this.fetchCourses();
  }

  fetchCourses() {
    this.courseService.getCourses().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.courseGroups = res.data;
        }
      },
      error: (err) => console.error('Failed to load courses', err),
    });
  }

  onCourseChange() {
    const selectedGroup = this.courseGroups.find((c) => c.course_name === this.selectedCourse);
    if (selectedGroup) {
      this.availableBatches = selectedGroup.batches;
    } else {
      this.availableBatches = [];
    }
    this.selectedBatch = '';
    this.fetchStudents();
  }

  onBatchChange() {
    this.fetchStudents();
  }

  fetchStudents() {
    if (!this.selectedBatch) {
      this.students = [];
      this.cdr.detectChanges();
      return;
    }
    this.studentService.getStudents(this.selectedBatch).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.students = data.map((s: any) => ({
          id: s.id,
          rank: s.rank_name || s.rankName || '',
          firstName: s.first_name || s.firstName || '',
          lastName: s.last_name || s.lastName || '',
          studentCode: s.student_code || s.studentCode || '',
          password: s.password || '', // เก็บข้อมูลรหัสผ่านจาก DB
          affiliation: s.affiliation || '',
          showPassword: false // ค่าเริ่มต้นให้ซ่อนรหัสผ่านในตาราง
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load students', err),
    });
  }

  onCancel(): void {
    this.location.back();
  }

  switchTab(tabId: 'single' | 'excel' | 'file') {
    this.activeTab = tabId;
  }

  resetForm() {
    this.studentForm = this.getEmptyForm();
    this.isEditing = false;
    this.editingId = null;
  }

  private getEmptyForm(): Student {
    return {
      id: 0,
      rank: '',
      firstName: '',
      lastName: '',
      studentCode: '',
      password: '',
      affiliation: '',
    };
  }

  onEditStudent(student: Student) {
    this.isEditing = true;
    this.editingId = student.id;
    this.studentForm = { ...student, password: '' };
    this.activeTab = 'single';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteStudent(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบข้อมูลนักเรียนคนนี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.studentService.deleteStudent(id).subscribe({
          next: (res) => {
            Swal.fire('สำเร็จ', 'ลบข้อมูลนักเรียนสำเร็จ', 'success');
            this.students = this.students.filter(s => s.id !== id);
            if (this.editingId === id) {
              this.resetForm();
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Delete failed', err);
            Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน', 'error');
          }
        });
      }
    });
  }

  onSubmitSingle() {
    if (!this.selectedCourse || !this.selectedBatch) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกหลักสูตรและรุ่นก่อนทำการเพิ่มนักเรียน', 'warning');
      return;
    }

    if (
      !this.studentForm.firstName ||
      !this.studentForm.lastName ||
      !this.studentForm.studentCode
    ) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูล ชื่อ, นามสกุล และรหัสนักเรียน ให้ครบถ้วน', 'warning');
      return;
    }

    const payload = {
      batch_id: this.selectedBatch,
      student_code: this.studentForm.studentCode,
      password: this.studentForm.password || '1234',
      rank_name: this.studentForm.rank,
      first_name: this.studentForm.firstName,
      last_name: this.studentForm.lastName,
      affiliation: this.studentForm.affiliation,
    };

    if (this.isEditing && this.editingId !== null) {
      this.studentService.updateStudent(this.editingId, payload).subscribe({
        next: (res) => {
          Swal.fire('สำเร็จ', 'อัปเดตข้อมูลนักเรียนสำเร็จ', 'success');
          this.resetForm();
          this.fetchStudents();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Update failed', err);
          Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลนักเรียน', 'error');
        }
      });
    } else {
      this.studentService.addStudent(payload).subscribe({
        next: (res) => {
          Swal.fire('สำเร็จ', 'เพิ่มข้อมูลนักเรียนสำเร็จ', 'success');
          this.resetForm();
          this.fetchStudents();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Add failed', err);
          Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน', 'error');
        },
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  onSubmitFile() {
    if (!this.selectedCourse || !this.selectedBatch) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกหลักสูตรและรุ่นก่อนทำการอัปโหลดไฟล์', 'warning');
      return;
    }
    if (!this.selectedFile) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกไฟล์ CSV หรือ TXT ก่อนทำการบันทึก', 'warning');
      return;
    }

    this.studentService.uploadStudentCsv(this.selectedBatch, this.selectedFile).subscribe({
      next: (res) => {
        Swal.fire('สำเร็จ', 'อัปโหลดข้อมูลสำเร็จ', 'success');
        this.selectedFile = null;
        this.selectedFileName = '';
        this.fetchStudents();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Upload failed', err);
        Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 'error');
      },
    });
  }
}


