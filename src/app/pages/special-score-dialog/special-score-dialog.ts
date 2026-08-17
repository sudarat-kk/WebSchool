import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ScoreService } from '../../services/score.service';
import Swal from 'sweetalert2';

export interface SpecialScoreStudent {
  id: number | string;
  code: string;
  name: string;
  rank: string;
  trainingTimeScore: number | null;
  examTimeScore: number | null;
  behaviorScore: number | null;
}

export interface SpecialScoreDialogData {
  batchId: number | string;
  students: SpecialScoreStudent[];
}

@Component({
  selector: 'app-special-score-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './special-score-dialog.html',
  styleUrl: './special-score-dialog.scss'
})
export class SpecialScoreDialog implements OnInit {
  
  students: SpecialScoreStudent[] = [];
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<SpecialScoreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: SpecialScoreDialogData,
    private scoreService: ScoreService
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.students) {
      // Deep clone to avoid mutating original data before saving
      this.students = JSON.parse(JSON.stringify(this.data.students));
      
      // กำหนดค่าเริ่มต้นให้เป็นคะแนนเต็ม หากยังไม่มีการกรอกคะแนน (เป็น 0 หรือ null)
      this.students.forEach(st => {
        if (!st.trainingTimeScore) {
          st.trainingTimeScore = 100;
        }
        if (!st.examTimeScore) {
          st.examTimeScore = 100;
        }
        if (!st.behaviorScore) {
          st.behaviorScore = 200;
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  validateScore(student: SpecialScoreStudent, field: 'trainingTimeScore' | 'examTimeScore' | 'behaviorScore', max: number, event: any): void {
    const input = event.target as HTMLInputElement;
    let stringVal = input.value;

    // จำกัดจุดทศนิยมไม่เกิน 2 ตำแหน่ง
    if (stringVal.includes('.')) {
      const parts = stringVal.split('.');
      if (parts[1].length > 2) {
        stringVal = parts[0] + '.' + parts[1].substring(0, 2);
        input.value = stringVal;
      }
    }

    let val = Number(stringVal);

    if (val > max) {
      val = max;
      input.value = max.toString();
    } else if (val < 0) {
      val = 0;
      input.value = '0';
    }

    student[field] = val;
  }

  saveScores(): void {
    this.isSaving = true;
    
    const payload = {
      batch_id: this.data.batchId,
      scores: this.students.map(st => ({
        student_id: st.id,
        training_time_score: (st.trainingTimeScore !== null && st.trainingTimeScore !== undefined && st.trainingTimeScore.toString() !== "") ? Number(st.trainingTimeScore) : null,
        exam_time_score: (st.examTimeScore !== null && st.examTimeScore !== undefined && st.examTimeScore.toString() !== "") ? Number(st.examTimeScore) : null,
        behavior_score: (st.behaviorScore !== null && st.behaviorScore !== undefined && st.behaviorScore.toString() !== "") ? Number(st.behaviorScore) : null
      }))
    };

    this.scoreService.saveSpecialScoresBulk(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'บันทึกข้อมูลคะแนนพิเศษสำเร็จ!',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#8e44ad',
          background: '#ffffff',
          backdrop: `rgba(0,0,0,0.4)`
        });
        this.isSaving = false;
        this.dialogRef.close(true); // pass true to indicate successful save
      },
      error: (err: any) => {
        console.error('Failed to save special scores', err);
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#d33'
        });
        this.isSaving = false;
      }
    });
  }
}
