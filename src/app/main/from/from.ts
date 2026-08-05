import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseGroup, BatchItem } from '../../services/course.service';
import { GeneralEvaluationService } from '../../services/general-evaluation.service';

@Component({
  selector: 'app-from',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatButtonModule,
    MatIconModule, 
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './from.html',
  styleUrl: './from.scss',
})
export class From implements OnInit {
  isEditMode: boolean = false;
  selectedFormId: any = null;

  // สำหรับเก็บข้อมูลหลักสูตรและรุ่น
  courseGroups: CourseGroup[] = [];
  availableBatches: BatchItem[] = [];

  // ประเภทของฟอร์ม
  formTypes = [
    { value: 'instructor', label: 'ประเมินอาจารย์ผู้สอน' },
    { value: 'director', label: 'แบบประเมินอาจารย์กำกับหลักสูตร' },
    { value: 'course', label: 'แบบประเมินหลักสูตร' },
    { value: 'committee', label: 'แบบประเมินสำหรับคณะกำกับหลักสูตร' },
    { value: 'followup', label: 'แบบประเมินติดตามผู้สำเร็จการศึกษา' }
  ];

  // โครงสร้างตัวแปรสำหรับผูกข้อมูลกับทุกช่องกรอกในฟอร์ม
  formData = {
    courseName: '', 
    formType: '',
    googleFormUrl: '',
    formName: '',
    generationId: '',
    subjectId: '' // เพิ่มฟิลด์สำหรับเก็บ ID วิชา
  };

  // รายการวิชาสำหรับรุ่นนั้นๆ (ใช้ข้อมูลจำลองไปก่อนระหว่างรอ Backend)
  availableSubjects: any[] = [];

  // รายการแบบฟอร์มที่มี (สำหรับแสดงในตารางด้านล่าง)
  formList: any[] = [];

  constructor(
    private courseService: CourseService,
    private generalEvaluationService: GeneralEvaluationService
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.courseGroups = res.data;
          this.fetchAllForms(); // โหลดรายการฟอร์มทั้งหมดหลังจากได้ข้อมูลหลักสูตรรุ่นมาแล้ว
        }
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร:', err);
        this.fetchAllForms(); // โหลดเหมือนเดิมเผื่อกรณี fail
      }
    });
  }

  // ดึงข้อมูลฟอร์มทั้งหมดจาก Backend
  fetchAllForms(): void {
    this.generalEvaluationService.getAllForms().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // แปลงชื่อตัวแปรจาก Database (Backend) ให้ตรงกับที่ Frontend ใช้แสดงผลตาราง
          this.formList = res.data.map((item: any) => {
            
            // 1. หาชื่อหลักสูตรและชื่อรุ่น จาก batch_id
            let cName = 'ไม่ระบุ';
            let gName = 'ไม่ระบุรุ่น';
            if (item.batch_id) {
              for (const group of this.courseGroups) {
                const foundBatch = group.batches?.find(b => b.batch_id == item.batch_id);
                if (foundBatch) {
                  cName = group.course_name;
                  gName = foundBatch.batch_name;
                  break;
                }
              }
            }

            // 2. หาชื่อประเภทภาษาไทย
            const typeObj = this.formTypes.find(t => t.value === item.evaluation_type);
            const typeLabel = typeObj ? typeObj.label : (item.evaluation_type || 'ไม่ระบุ');

            return {
              id: item.id,
              courseName: cName,
              generationId: item.batch_id, // เก็บเป็น ID ไว้ใช้เวลาแก้ไข
              generationName: gName,       // เอาไว้โชว์บนตาราง
              formType: item.evaluation_type,
              formTypeName: typeLabel,
              formName: item.form_name,
              googleFormUrl: item.form_url,
              subjectId: item.subject_id || '', // เผื่อ Backend ส่ง subject_id กลับมา
              subjectName: item.subject_name || '-', // เอาไว้โชว์ชื่อวิชาในตาราง
              isActive: item.is_active === 1 || item.is_active === true
            };
          });
          
          this.generateTableData(); // อัปเดตตารางด้านล่างด้วยข้อมูลล่าสุด
        } else {
          this.formList = [];
          this.generateTableData();
        }
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแบบฟอร์ม:', err);
        this.formList = [];
        this.generateTableData();
      }
    });
  }

  onCourseChange(resetGen: boolean = true): void {
    // เมื่อเลือกหลักสูตรใหม่ ให้หา batches ของหลักสูตรนั้นๆ
    const selectedGroup = this.courseGroups.find(c => c.course_name === this.formData.courseName);
    if (selectedGroup) {
      this.availableBatches = selectedGroup.batches;
    } else {
      this.availableBatches = [];
    }
    
    // รีเซ็ตรุ่นที่เลือกไว้ เฉพาะเวลาแอดมินเปลี่ยนหลักสูตรเอง
    if (resetGen) {
      this.formData.generationId = '';
      this.formData.subjectId = '';
    }
  }

  onGenerationChange(resetSubject: boolean = true): void {
    // ฟังก์ชันนี้จะถูกเรียกเมื่อแอดมินเลือกรุ่น (Generation) เสร็จ
    if (resetSubject) {
      this.formData.subjectId = '';
    }
    if (this.formData.generationId) {
      this.courseService.getSubjectsByBatch(this.formData.generationId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            
            // ข้อมูลจาก Backend ส่งมาเป็น Group (มี group_name และ subjects เป็น Array ซ้อนอยู่ข้างใน)
            // เราต้องวนลูปเพื่อดึงวิชาทั้งหมดออกมาเรียงเป็นก้อนเดียว
            let allSubjects: any[] = [];
            
            res.data.forEach((group: any) => {
              if (group.subjects && Array.isArray(group.subjects)) {
                group.subjects.forEach((s: any) => {
                  allSubjects.push({
                    id: s.id || s.subject_id || s.subjectId,
                    name: s.subject_name || s.name || 'ไม่ระบุชื่อวิชา'
                  });
                });
              }
            });

            this.availableSubjects = allSubjects;
          } else {
            this.availableSubjects = [];
          }
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิชา:', err);
          this.availableSubjects = [];
        }
      });
    } else {
      this.availableSubjects = [];
    }
  }

  onTypeChange(): void {
    // ถ้าเปลี่ยนประเภทแบบฟอร์มแล้วไม่ใช่ "ประเมินอาจารย์ผู้สอน" ให้เคลียร์วิชาทิ้ง
    if (this.formData.formType !== 'instructor') {
      this.formData.subjectId = '';
    }
  }

  // 1. ฟังก์ชันเมื่อกดปุ่ม "สร้างและแชร์แบบฟอร์มประเมินนี้"
  onCreateForm() {
    // ตรวจสอบว่ากรอกข้อมูลครบหรือยัง (เบื้องต้น)
    if (!this.formData.courseName || !this.formData.generationId || !this.formData.formType) {
      alert('กรุณาเลือกหลักสูตร รุ่น และประเภทแบบฟอร์มให้ครบถ้วน');
      return;
    }
    
    // บังคับเลือกวิชา หากประเภทเป็น "ประเมินอาจารย์ผู้สอน"
    if (this.formData.formType === 'instructor' && !this.formData.subjectId) {
      alert('กรุณาเลือกวิชา สำหรับแบบประเมินอาจารย์ผู้สอน');
      return;
    }

    if (!this.formData.googleFormUrl) {
      alert('กรุณากรอกลิงก์ Google Form');
      return;
    }

    // ทำความสะอาด subjectId ป้องกันกรณี HTML แปลง undefined เป็นสตริง 'undefined'
    const cleanSubjectId = (this.formData.subjectId === 'undefined' || !this.formData.subjectId) 
      ? null 
      : this.formData.subjectId;

    const payload = {
      // ส่งชื่อตัวแปรแบบเก่า (กันกรณี Backend บน Render ยังไม่อัปเดต)
      batch_id: this.formData.generationId || null,
      evaluation_type: this.formData.formType,
      form_url: this.formData.googleFormUrl,
      form_name: this.formData.formName,
      subject_id: cleanSubjectId,
      
      // ส่งชื่อตัวแปรแบบใหม่ (ตามโค้ด Backend ล่าสุดที่คุณแก้)
      courseName: this.formData.courseName,
      formType: this.formData.formType,
      googleFormUrl: this.formData.googleFormUrl,
      formName: this.formData.formName,
      generationId: this.formData.generationId || null,
      subjectId: cleanSubjectId
    };

    console.log('กำลังสร้างฟอร์มใหม่ด้วยข้อมูลนี้:', payload);
    
    // เรียกใช้ Service เพื่อส่งข้อมูลไปให้ Backend
    this.generalEvaluationService.createGeneralEvaluation(payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert('สร้างฟอร์มสำเร็จ');
          this.resetForm();
          this.fetchAllForms(); // โหลดข้อมูลตารางใหม่
        } else {
          alert('เกิดข้อผิดพลาดในการสร้างฟอร์ม: ' + (res.message || ''));
        }
      },
      error: (err) => {
        console.error('Error จาก Backend:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ (กรุณาเช็ค Console F12)');
      }
    });
  }

  // 2. ฟังก์ชันเมื่อกดปุ่มแก้ไข (ปุ่มรูปดวงตา/แก้ไขจากรายการตารางด้านล่าง)
  onEditAction(item: any) {
    this.isEditMode = true;
    this.selectedFormId = item.id;
    
    // นำข้อมูลจากตารางมาใส่ในฟอร์มด้านบน
    this.formData = {
      courseName: item.courseName || '',
      formType: item.formType || '',
      googleFormUrl: item.googleFormUrl || '',
      formName: item.formName || '',
      generationId: item.generationId || '',
      subjectId: item.subjectId || ''
    };
    
    // โหลดรายการรุ่นของหลักสูตรนี้ แต่ "ไม่ต้อง" รีเซ็ตค่า generationId ทิ้ง
    this.onCourseChange(false); 
    this.onGenerationChange(false); // โหลดวิชาแต่ไม่ทิ้งค่า subjectId
    
    // เลื่อนหน้าจอกลับขึ้นไปด้านบนเพื่อให้ผู้ใช้เห็นช่องกรอกและแก้ไขได้ทันที
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 3. ฟังก์ชันเมื่อกดปุ่ม "บันทึกการแก้ไขแบบฟอร์ม"
  onUpdateForm() {
    // บังคับเลือกวิชา หากประเภทเป็น "ประเมินอาจารย์ผู้สอน"
    if (this.formData.formType === 'instructor' && !this.formData.subjectId) {
      alert('กรุณาเลือกวิชา สำหรับแบบประเมินอาจารย์ผู้สอน');
      return;
    }

    // ทำความสะอาด subjectId ป้องกันกรณี HTML แปลง undefined เป็นสตริง 'undefined'
    const cleanSubjectId = (this.formData.subjectId === 'undefined' || !this.formData.subjectId) 
      ? null 
      : this.formData.subjectId;

    const payload = {
      // ส่งชื่อตัวแปรแบบเก่า (กันกรณี Backend บน Render ยังไม่อัปเดต)
      batch_id: this.formData.generationId || null,
      evaluation_type: this.formData.formType,
      form_url: this.formData.googleFormUrl,
      form_name: this.formData.formName,
      subject_id: cleanSubjectId,
      
      // ส่งชื่อตัวแปรแบบใหม่ (ตามโค้ด Backend ล่าสุดที่คุณแก้)
      courseName: this.formData.courseName,
      formType: this.formData.formType,
      googleFormUrl: this.formData.googleFormUrl,
      formName: this.formData.formName,
      generationId: this.formData.generationId || null,
      subjectId: cleanSubjectId
    };

    console.log('กำลังอัปเดตข้อมูลฟอร์ม ID:', this.selectedFormId, 'เป็นข้อมูลใหม่:', payload);
    
    // เรียกใช้ Service เพื่อส่งข้อมูลแก้ไขไปให้ Backend
    this.generalEvaluationService.updateGeneralEvaluation(this.selectedFormId, payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert('อัปเดตข้อมูลฟอร์มสำเร็จ');
          this.resetForm();
          this.fetchAllForms(); // โหลดข้อมูลตารางใหม่
        } else {
          alert('เกิดข้อผิดพลาดในการอัปเดตฟอร์ม');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }
    });
  }

  // ฟังก์ชันลบแบบฟอร์ม
  onDeleteAction(id: any) {
    if(confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแบบฟอร์มนี้?')) {
      console.log('ลบฟอร์ม ID:', id);
      // TODO: เรียก API DELETE ไปที่ Backend
      // this.generalEvaluationService.deleteGeneralEvaluation(id).subscribe(...)
      alert('ลบฟอร์มเรียบร้อย (จำลอง)');
    }
  }

  // ฟังก์ชันสําหรับล้างค่าในช่องกรอกให้กลับมาว่างเปล่า
  resetForm() {
    this.isEditMode = false;
    this.selectedFormId = null;
    this.formData = { 
      courseName: '', 
      formType: '', 
      googleFormUrl: '', 
      formName: '', 
      generationId: '',
      subjectId: ''
    };
    this.availableBatches = [];
    this.availableSubjects = [];
  }

  // ==========================================
  // ส่วนใหม่: การกรองและจัดการตารางด้านล่าง
  // ==========================================

  filterCourse: string = '';
  filterGeneration: string = '';
  filterType: string = 'instructor'; // ค่าเริ่มต้น

  filterBatches: BatchItem[] = [];
  filterSubjects: any[] = [];
  displayTableData: any[] = [];

  onFilterCourseChange() {
    const selectedGroup = this.courseGroups.find(c => c.course_name === this.filterCourse);
    if (selectedGroup) {
      this.filterBatches = selectedGroup.batches;
    } else {
      this.filterBatches = [];
    }
    this.filterGeneration = '';
    this.filterSubjects = [];
    this.displayTableData = [];
  }

  onFilterGenerationChange() {
    this.displayTableData = [];
    if (this.filterGeneration) {
      this.courseService.getSubjectsByBatch(this.filterGeneration).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            let allSubjects: any[] = [];
            res.data.forEach((group: any) => {
              if (group.subjects && Array.isArray(group.subjects)) {
                group.subjects.forEach((s: any) => {
                  allSubjects.push({
                    id: s.id || s.subject_id || s.subjectId,
                    name: s.subject_name || s.name || 'ไม่ระบุชื่อวิชา'
                  });
                });
              }
            });
            this.filterSubjects = allSubjects;
            this.generateTableData();
          } else {
            this.filterSubjects = [];
            this.generateTableData();
          }
        },
        error: (err) => {
          console.error('Error fetching subjects for filter:', err);
          this.filterSubjects = [];
          this.generateTableData();
        }
      });
    }
  }

  onFilterTypeChange() {
    this.generateTableData();
  }

  generateTableData() {
    if (!this.filterCourse || !this.filterGeneration || !this.filterType) {
      this.displayTableData = [];
      return;
    }

    // กรองหาฟอร์มทั้งหมดในระบบที่ตรงกับ รุ่น และ ประเภท นี้
    const matchedForms = this.formList.filter(f => 
      f.generationId == this.filterGeneration && 
      f.formType === this.filterType
    );

    if (this.filterType === 'instructor') {
      // โหมดเรียงตามรายวิชา
      this.displayTableData = this.filterSubjects.map(sub => {
        const form = matchedForms.find(f => f.subjectId == sub.id);
        return {
          isSubjectMode: true,
          subjectId: sub.id,
          subjectName: sub.name,
          hasForm: !!form,
          formDetails: form || null
        };
      });
    } else {
      // โหมดทั่วไป (ประเมินหลักสูตร, กำกับหลักสูตร ฯลฯ) มีแค่ 1 ฟอร์มต่อรุ่น
      const form = matchedForms.length > 0 ? matchedForms[0] : null;
      this.displayTableData = [{
        isSubjectMode: false,
        subjectId: null,
        subjectName: '-',
        hasForm: !!form,
        formDetails: form || null
      }];
    }
  }

  onAddLinkAction(row: any) {
    // นำข้อมูลหลักสูตร รุ่น ประเภท ไปกรอกในฟอร์มด้านบนให้อัตโนมัติ เพื่อเตรียมให้แอดมินกรอกลิงก์
    this.formData.courseName = this.filterCourse;
    this.onCourseChange(false);
    
    this.formData.generationId = this.filterGeneration;
    this.onGenerationChange(false); // โหลดรายชื่อวิชาของฟอร์มบน

    this.formData.formType = this.filterType;
    if (this.formData.formType !== 'instructor') {
      this.formData.subjectId = '';
    } else {
      this.formData.subjectId = row.subjectId;
    }

    this.formData.googleFormUrl = '';
    this.formData.formName = '';
    this.isEditMode = false;
    this.selectedFormId = null;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}