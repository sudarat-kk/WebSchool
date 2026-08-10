import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { GeneralEvaluationService } from '../../services/general-evaluation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-committee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './committee.html',
  styleUrl: './committee.scss',
})
export class Committee implements OnInit, OnDestroy {
  pageTitle: string = 'แบบประเมินสำหรับคณะกำกับหลักสูตร';
  currentBatchId: number | null = null;
  formUrl: string = '';
  isLoading: boolean = true;
  private evaluationSub: Subscription | null = null;

  constructor(
    private generalEvaluationService: GeneralEvaluationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    if (this.evaluationSub) {
      this.evaluationSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const batchId = params['batchId'];

      if (batchId) {
        this.currentBatchId = Number(batchId);
        this.fetchEvaluationForm(this.currentBatchId);
      } else {
        this.isLoading = false;
      }
    });
  }

  fetchEvaluationForm(batchId: number): void {
    this.isLoading = true;
    
    // ดึงข้อมูลฟอร์มประเมินสำหรับคณะกำกับหลักสูตร โดยใช้ type = 'committee' (หรือเปลี่ยนตาม backend)
    this.evaluationSub = this.generalEvaluationService.getGeneralEvaluations(batchId, 'committee').subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.formUrl = res.data[0].form_url;
        } else {
          this.formUrl = '';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแบบประเมิน:', err);
        this.formUrl = '';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
