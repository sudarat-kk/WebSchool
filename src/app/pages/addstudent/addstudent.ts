import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DropdownService } from '../../services/dropdown.service';
import { StudentService } from '../../services/student.service';
import { CourseService, CourseGroup, BatchItem } from '../../services/course.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

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
  ) {}

  activeTab: 'single' | 'excel' | 'file' = 'single';
  students: Student[] = [];
  studentForms: Student[] = [this.getEmptyForm()];
  isEditing: boolean = false;
  editingId: number | null = null;
  excelData: string = '';
  selectedFileName: string = '';
  selectedFile: File | null = null;
  showPassword = false;

  pastedData: string = '';
  showPasteArea: boolean = false;

  togglePasteArea() {
    this.showPasteArea = !this.showPasteArea;
  }

  processPastedData() {
    if (!this.pastedData.trim()) return;

    const rows = this.pastedData.split('\n');
    const newForms: Student[] = [];

    for (let row of rows) {
      if (!row.trim()) continue;
      
      // Excel/Google Sheets copy puts tabs between cells
      const columns = row.split('\t');
      
      // Expected format based on user's Excel:
      // columns[0] = ลำดับ (Student Code)
      // columns[1] = รหัสผ่าน (Password)
      // columns[2] = ยศ - ชื่อ - สกุล
      // columns[3] = สังกัด (Affiliation)
      
      if (columns.length >= 3) {
        const newStudent = this.getEmptyForm();
        
        // 1. ลำดับ -> รหัสประจำตัวนักเรียน
        newStudent.studentCode = columns[0]?.trim() || '';
        
        // 2. รหัสผ่าน
        newStudent.password = columns[1]?.trim() || ''; // ถ้ารหัสผ่านว่าง เดี๋ยวตอน Submit จะตั้งเป็น 1234 ให้อัตโนมัติ
        
        // 3. แยก ยศ ชื่อ สกุล
        const fullNameStr = columns[2] || '';
        // ตัดช่องว่างซ้ำซ้อนออกแล้วแยกคำด้วยช่องว่าง
        const nameParts = fullNameStr.trim().split(/\s+/);
        
        if (nameParts.length >= 3) {
          newStudent.rank = nameParts[0];
          newStudent.firstName = nameParts[1];
          // นามสกุลคือส่วนที่เหลือทั้งหมดมาต่อกัน
          newStudent.lastName = nameParts.slice(2).join(' ');
        } else if (nameParts.length === 2) {
          // ถ้ามีแค่ 2 คำ สมมติว่าเป็น ชื่อ และ นามสกุล (ไม่มียศ) หรือ ยศ และ ชื่อ
          // ส่วนใหญ่คงเป็น ยศ ชื่อ หรือ ชื่อ สกุล แต่เอาชัวร์ๆ ตาม format ปกติ
          newStudent.rank = '';
          newStudent.firstName = nameParts[0];
          newStudent.lastName = nameParts[1];
        } else if (nameParts.length === 1) {
          newStudent.firstName = nameParts[0];
        }
        
        // 4. สังกัด
        newStudent.affiliation = columns[3]?.trim() || '';
        
        // เพิ่มข้อมูลลงใน array ถ้ามีลำดับ หรือชื่อ อย่างใดอย่างหนึ่ง
        if (newStudent.studentCode || newStudent.firstName) {
          newForms.push(newStudent);
        }
      }
    }

    if (newForms.length > 0) {
      if (this.studentForms.length === 1 && !this.studentForms[0].firstName && !this.studentForms[0].studentCode) {
        this.studentForms = newForms;
      } else {
        this.studentForms = [...this.studentForms, ...newForms];
      }
      this.pastedData = '';
      this.showPasteArea = false;
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: `ดึงข้อมูลสำเร็จ ${newForms.length} รายการ กรุณาตรวจสอบข้อมูลและกดบันทึก`
      });
    } else {
      Swal.fire('ผิดพลาด', 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาก๊อปปี้จากตาราง (ลำดับ | รหัสผ่าน | ยศ-ชื่อ-สกุล | สังกัด)', 'error');
    }
  }

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
    this.studentForms = [this.getEmptyForm()];
    this.isEditing = false;
    this.editingId = null;
  }

  addFormRow() {
    this.studentForms.push(this.getEmptyForm());
  }

  removeFormRow(index: number) {
    if (this.studentForms.length > 1) {
      this.studentForms.splice(index, 1);
    }
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
    this.studentForms = [{ ...student, password: '' }];
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

    // ตรวจสอบว่าทุกแถวกรอกข้อมูลครบหรือไม่
    for (let form of this.studentForms) {
      if (!form.firstName || !form.lastName || !form.studentCode) {
        Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูล ชื่อ, นามสกุล และรหัสนักเรียน ให้ครบถ้วนทุกรายการ', 'warning');
        return;
      }
    }

    if (this.isEditing && this.editingId !== null) {
      const form = this.studentForms[0];
      const payload = {
        batch_id: this.selectedBatch,
        student_code: form.studentCode,
        password: form.password || '1234',
        rank_name: form.rank,
        first_name: form.firstName,
        last_name: form.lastName,
        affiliation: form.affiliation,
      };

      this.studentService.updateStudent(this.editingId, payload).subscribe({
        next: (res) => {
          Swal.fire('สำเร็จ', 'อัปเดตข้อมูลนักเรียนสำเร็จ', 'success');
          this.resetForm();
          this.fetchStudents();
        },
        error: (err) => {
          console.error('Update failed', err);
          Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลนักเรียน', 'error');
        }
      });
    } else {
      // เพิ่มหลายคนพร้อมกัน
      const requests = this.studentForms.map(form => {
        const payload = {
          batch_id: this.selectedBatch,
          student_code: form.studentCode,
          password: form.password || '1234',
          rank_name: form.rank,
          first_name: form.firstName,
          last_name: form.lastName,
          affiliation: form.affiliation,
        };
        return this.studentService.addStudent(payload);
      });

      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      forkJoin(requests).subscribe({
        next: (responses) => {
          Swal.fire('สำเร็จ', `เพิ่มข้อมูลนักเรียน ${requests.length} รายการสำเร็จ`, 'success');
          this.resetForm();
          this.fetchStudents();
        },
        error: (err) => {
          console.error('Add failed', err);
          Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียนบางรายการ', 'error');
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
      },
      error: (err) => {
        console.error('Upload failed', err);
        Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 'error');
      },
    });
  }
}
