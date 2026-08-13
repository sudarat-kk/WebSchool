import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GeneralEvaluationService } from '../../../services/general-evaluation.service';

@Component({
  selector: 'app-evaluation-fill',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './evaluation-fill.component.html',
  styleUrl: './evaluation-fill.component.scss',
})
export class EvaluationFillComponent implements OnInit {
  isLoading = true;
  formDetails: any = null;
  questions: any[] = [];

  batchId: number = 0;
  batchName: string = ''; // 👈 เพิ่มตัวแปรสำหรับเก็บชื่อรุ่น
  subjectId: string = '';
  type: string = '';
  courseTitle: string = '';

  // สำหรับฟอร์ม
  instructorName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private generalEvaluationService: GeneralEvaluationService,
    private location: Location,
    private cdr: ChangeDetectorRef, // 👈 Inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.batchId = params['batchId'];
      this.batchName = params['batchName'] || `รุ่นที่ ${this.batchId}`; // ดึงชื่อรุ่นมา
      this.subjectId = params['subjectId'];
      this.type = params['type'] || 'instructor';
      this.courseTitle = params['courseTitle'] || 'ทำแบบประเมิน';

      if (this.batchId && this.type) {
        this.fetchQuestions();
      } else {
        this.isLoading = false;
        alert('ข้อมูลไม่ครบถ้วน');
      }
    });
  }

  fetchQuestions() {
    console.log('1. เริ่มเรียก API...', {
      batchId: this.batchId,
      type: this.type,
      subjectId: this.subjectId,
    });
    this.isLoading = true;

    this.generalEvaluationService
      .getEvaluationQuestions(this.batchId, this.type, this.subjectId)
      .subscribe({
        next: (res: any) => {
          console.log('2. API ตอบกลับสำเร็จ (Success):', res);
          try {
            if (res.success && res.data) {
              this.formDetails = res.data;
              // ป้องกันกรณี Backend ไม่ได้ส่ง questions กลับมา ให้เป็น Array ว่างแทน
              const loadedQuestions = res.data.questions || [];
              this.questions = loadedQuestions.map((q: any) => ({
                ...q,
                answer_score: null,
                answer_comment: '',
              }));
            }
          } catch (e) {
            console.error('เกิดข้อผิดพลาดในการจัดการข้อมูล:', e);
          } finally {
            this.isLoading = false;
            this.cdr.detectChanges(); // 👈 บังคับรีเฟรชหน้าจอทันที
          }
        },
        error: (err: any) => {
          console.error('3. API ตอบกลับแบบ Error:', err);
          alert('ไม่พบข้อมูลแบบประเมินในระบบ (อาจยังไม่ได้สร้างลิงก์สำหรับรุ่นนี้)');
          this.isLoading = false;
          this.cdr.detectChanges(); // 👈 บังคับรีเฟรชหน้าจอทันที
        },
      });
  }

  onSubmit() {
    // Validate ว่าตอบครบทุกข้อที่เป็น choice หรือไม่
    const unanswered = this.questions.find((q) => q.question_type === 'choice' && !q.answer_score);
    if (unanswered) {
      alert('กรุณาตอบคำถามแบบตัวเลือกให้ครบทุกข้อครับ');
      return;
    }

    if (!this.instructorName && this.type === 'instructor') {
      alert('กรุณาระบุชื่ออาจารย์ผู้สอนครับ');
      return;
    }

    const answers = this.questions.map((q) => ({
      question_id: q.id,
      score_value: q.question_type === 'choice' ? q.answer_score : null,
      comment: q.question_type === 'text' ? q.answer_comment : null,
    }));

    const payload = {
      formId: this.formDetails.form_id,
      subjectId: this.subjectId,
      instructorName: this.instructorName,
      answers: answers,
    };

    this.generalEvaluationService.submitEvaluationAnswer(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('ส่งแบบประเมินเรียบร้อยแล้ว ขอบคุณครับ!');
          this.location.back(); // กลับไปหน้าเดิม
        }
      },
      error: (err: any) => {
        console.error('Submit error', err);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
      },
    });
  }

  goBack() {
    this.location.back();
  }
}
