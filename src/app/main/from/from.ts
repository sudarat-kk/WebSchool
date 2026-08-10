import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseGroup, BatchItem } from '../../services/course.service';
import { GeneralEvaluationService } from '../../services/general-evaluation.service';

export interface Choice {
  choice_text: string;
  score_value: number;
}

export interface Question {
  question_text: string;
  question_type: 'choice' | 'text';
  choices?: Choice[];
}

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

  // โครงสร้างตัวแปรสำหรับผูกข้อมูลกับทุกช่องกรอกในฟอร์ม (ปรับใหม่ให้มี questions)
  formData = {
    courseName: '', 
    formType: '',
    formName: '',
    generationId: '',
    subjectId: '',
    questions: [] as Question[]
  };

  // รายการวิชาสำหรับรุ่นนั้นๆ
  availableSubjects: any[] = [];

  // รายการแบบฟอร์มที่มี (สำหรับแสดงในตารางด้านล่าง)
  formList: any[] = [];

  constructor(
    private courseService: CourseService,
    private generalEvaluationService: GeneralEvaluationService
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
    // เพิ่มคำถามตั้งต้น 1 ข้อให้เวลาเปิดหน้าจอมา
    this.addQuestion();
  }

  fetchCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.courseGroups = res.data;
          this.fetchAllForms(); 
        }
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร:', err);
        this.fetchAllForms(); 
      }
    });
  }

  fetchAllForms(): void {
    this.generalEvaluationService.getAllForms().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.formList = res.data.map((item: any) => {
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

            const typeObj = this.formTypes.find(t => t.value === item.evaluation_type);
            const typeLabel = typeObj ? typeObj.label : (item.evaluation_type || 'ไม่ระบุ');

            return {
              id: item.id,
              courseName: cName,
              generationId: item.batch_id, 
              generationName: gName,       
              formType: item.evaluation_type,
              formTypeName: typeLabel,
              formName: item.form_name,
              subjectId: item.subject_id || '',
              subjectName: item.subject_name || '-',
              isActive: item.is_active === 1 || item.is_active === true
            };
          });
          
          this.generateTableData();
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
    const selectedGroup = this.courseGroups.find(c => c.course_name === this.formData.courseName);
    if (selectedGroup) {
      this.availableBatches = selectedGroup.batches;
    } else {
      this.availableBatches = [];
    }
    
    if (resetGen) {
      this.formData.generationId = '';
      this.formData.subjectId = '';
    }
  }

  onGenerationChange(resetSubject: boolean = true): void {
    if (resetSubject) {
      this.formData.subjectId = '';
    }
    if (this.formData.generationId) {
      this.courseService.getSubjectsByBatch(this.formData.generationId).subscribe({
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
    if (this.formData.formType !== 'instructor') {
      this.formData.subjectId = '';
    }
  }

  // ==========================================
  // ส่วนจัดการคำถาม (Dynamic Form Builder)
  // ==========================================

  addQuestion() {
    this.formData.questions.push({
      question_text: '',
      question_type: 'choice',
      choices: [
        { choice_text: 'สามารถให้คำแนะนำ...อย่างเหมาะสม', score_value: 3 },
        { choice_text: 'สามารถให้คำแนะนำ...พอสมควร', score_value: 2 },
        { choice_text: 'ยังไม่เหมาะสม', score_value: 1 }
      ]
    });
  }

  removeQuestion(index: number) {
    this.formData.questions.splice(index, 1);
  }

  addChoice(qIndex: number) {
    if (!this.formData.questions[qIndex].choices) {
      this.formData.questions[qIndex].choices = [];
    }
    this.formData.questions[qIndex].choices!.push({ choice_text: '', score_value: 0 });
  }

  removeChoice(qIndex: number, cIndex: number) {
    this.formData.questions[qIndex].choices!.splice(cIndex, 1);
  }

  onQuestionTypeChange(qIndex: number) {
    // ถ้าเปลี่ยนเป็น text ให้ล้าง choices ไปเลย เพื่อลดข้อมูลขยะ
    if (this.formData.questions[qIndex].question_type === 'text') {
      this.formData.questions[qIndex].choices = [];
    } else {
      // ถ้าเปลี่ยนกลับมา choice ให้มีค่า default ไว้ให้
      if (!this.formData.questions[qIndex].choices || this.formData.questions[qIndex].choices!.length === 0) {
        this.formData.questions[qIndex].choices = [
          { choice_text: 'มาก', score_value: 3 },
          { choice_text: 'ปานกลาง', score_value: 2 },
          { choice_text: 'น้อย', score_value: 1 }
        ];
      }
    }
  }

  // ==========================================
  // ส่วนสร้างและอัปเดตฟอร์ม (เรียก API)
  // ==========================================

  onCreateForm() {
    if (!this.formData.courseName || !this.formData.generationId || !this.formData.formType) {
      alert('กรุณาเลือกหลักสูตร รุ่น และประเภทแบบฟอร์มให้ครบถ้วน');
      return;
    }

    if (!this.formData.questions || this.formData.questions.length === 0) {
      alert('กรุณาสร้างคำถามอย่างน้อย 1 ข้อ');
      return;
    }

    const cleanSubjectId = (this.formData.subjectId === 'undefined' || !this.formData.subjectId) 
      ? null 
      : this.formData.subjectId;

    const payload = {
      courseName: this.formData.courseName,
      formType: this.formData.formType,
      formName: this.formData.formName,
      generationId: this.formData.generationId || null,
      subjectId: cleanSubjectId,
      questions: this.formData.questions
    };

    console.log('กำลังสร้างฟอร์มใหม่ด้วยข้อมูลนี้:', payload);
    
    this.generalEvaluationService.createGeneralEvaluation(payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert('สร้างฟอร์มสำเร็จ');
          this.resetForm();
          this.fetchAllForms(); 
        } else {
          alert('เกิดข้อผิดพลาดในการสร้างฟอร์ม: ' + (res.message || ''));
        }
      },
      error: (err) => {
        console.error('Error จาก Backend:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    });
  }

  onEditAction(item: any) {
    this.isEditMode = true;
    this.selectedFormId = item.id;
    
    this.formData = {
      courseName: item.courseName || '',
      formType: item.formType || '',
      formName: item.formName || '',
      generationId: item.generationId || '',
      subjectId: item.subjectId || '',
      // หมายเหตุ: โค้ด Backend ยังไม่รองรับการดึงชุดคำถามตอนแก้ไข 
      // เพื่อไม่ให้ UI พัง เราจะสร้าง question เปล่าไปก่อน (หรือรอ Backend รองรับ)
      questions: []
    };
    
    this.onCourseChange(false); 
    this.onGenerationChange(false); 
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('โหมดแก้ไขในขณะนี้ ยังไม่รองรับการดึงคำถามเดิมจากฐานข้อมูล (ต้องทำ API เพิ่มครับ)');
  }

  onUpdateForm() {
    alert('ระบบแก้ไขคำถามต้องรอ API จาก Backend รบกวนสร้างฟอร์มใหม่ หรือลบฟอร์มเก่าทิ้งแทนไปก่อนครับ');
  }

  onDeleteAction(id: any) {
    if(confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแบบฟอร์มนี้?')) {
      console.log('ลบฟอร์ม ID:', id);
      // TODO: เรียก API DELETE ไปที่ Backend
      alert('ฟังก์ชันลบยังไม่เปิดใช้งาน');
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedFormId = null;
    this.formData = { 
      courseName: '', 
      formType: '', 
      formName: '', 
      generationId: '',
      subjectId: '',
      questions: []
    };
    this.addQuestion(); // สร้างข้อว่างเตรียมไว้ให้
    this.availableBatches = [];
    this.availableSubjects = [];
  }

  // ==========================================
  // ส่วนแสดงตารางและตัวกรอง
  // ==========================================

  filterCourse: string = '';
  filterGeneration: string = '';
  filterType: string = 'instructor'; 

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

    const matchedForms = this.formList.filter(f => 
      f.generationId == this.filterGeneration && 
      f.formType === this.filterType
    );

    if (this.filterType === 'instructor') {
      // เปลี่ยนจากแสดงทุกวิชา เป็นแสดงแค่แถวเดียว สำหรับใช้กับทุกวิชาในรุ่น
      const form = matchedForms.length > 0 ? matchedForms[0] : null;
      this.displayTableData = [{
        isSubjectMode: false,
        subjectId: null,
        subjectName: 'ประเมินอาจารย์ (ใช้ร่วมกันทุกวิชาในรุ่น)',
        hasForm: !!form,
        formDetails: form || null
      }];
    } else {
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
    this.formData.courseName = this.filterCourse;
    this.onCourseChange(false);
    
    this.formData.generationId = this.filterGeneration;
    this.onGenerationChange(false); 

    this.formData.formType = this.filterType;
    if (this.formData.formType !== 'instructor') {
      this.formData.subjectId = '';
    } else {
      this.formData.subjectId = row.subjectId;
    }

    this.formData.formName = '';
    this.isEditMode = false;
    this.selectedFormId = null;
    this.formData.questions = [];
    this.addQuestion(); // สร้างข้อแรกเตรียมไว้
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}