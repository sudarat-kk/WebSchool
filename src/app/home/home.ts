import { Component, ViewChild, ElementRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  animations: [
    trigger('slideAnim', [
      transition(':enter', [
        style({ opacity: 0 }), // ✅ แก้ stlye → style
        animate('500ms ease', style({ opacity: 1 })), // ✅ แก้ stlye → style
      ]), // ✅ เพิ่ม comma
      transition(':leave', [
        // ✅ แก้ TransitionEvent(: → transition('
        animate('500ms ease', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class Home {
  @ViewChild('contentRef') contenRef!: ElementRef;

  // ── Slideshow ─────────────────────────────────────
  slides = [
    { image: 'assets/image/image1.png', caption: 'Caption Text' },
    { image: 'assets/image/image2.png', caption: 'Caption Two' },
    { image: 'assets/image/image3.png', caption: 'Caption Three' },
  ];

  currentIndex = 0;
  private autoPlayTimer: any;

  private cdr = inject(ChangeDetectorRef);

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetTimer();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetTimer();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetTimer();
  }

  private startAutoPlay() {
    this.autoPlayTimer = setInterval(() => this.nextSlide(), 4000);
  }

  private resetTimer() {
    clearInterval(this.autoPlayTimer);
    this.startAutoPlay();
  }

  // ── Scrollspy ─────────────────────────────────────
  activeSection = 'home';

  sections = [
    { id: 'sec-home', key: 'home' },
    { id: 'sec-about', key: 'about' },
    { id: 'sec-forms', key: 'forms' },
  ];
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  onScroll() {
    const el = this.contenRef.nativeElement;
    const scrollTop = el.scrollTop;
    const height = el.clientHeight;
    const scrollHeight = el.scrollHeight;

    // หากเลื่อนจนสุดขอบล่างสุดของพื้นที่สกรอล ให้ไฮไลท์เมนูหัวข้อสุดท้าย (แบบฟอร์มคำร้อง) เสมอ
    if (scrollTop + height >= scrollHeight - 10) {
      this.activeSection = this.sections[this.sections.length - 1].key;
      return;
    }

    let current = this.sections[0].key;
    this.sections.forEach((sec) => {
      const target = document.getElementById(sec.id);
      if (target && target.offsetTop - height * 0.4 <= scrollTop) {
        current = sec.key;
      }
    });
    this.activeSection = current;
  }

  // ── Lifecycle ─────────────────────────────────────
  ngOnDestroy() {
    clearInterval(this.autoPlayTimer);
  }

  // ── about ─────────────────────────────────────
  staffList: { image: string; name: string; rank: string }[] = [];

  itemsPerPage = 4;
  staffPage = 0;

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http
      .get<{ image: string; name: string; rank: string }[]>('assets/data/staff-list.json')
      .subscribe((data) => {
        this.staffList = data;
        this.staffPage = 0; // reset หน้าให้เริ่มที่ 0 ทุกครั้งที่โหลดใหม่
        this.cdr.detectChanges();
      });

    this.startAutoPlay();
  }

  // ✅ เหลือแค่ get แบบเดียว ไม่ต้องประกาศ staffGroups แยก
  get staffGroups(): number[] {
    return Array.from(
      { length: Math.ceil(this.staffList.length / this.itemsPerPage) },
      (_, i) => i,
    );
  }

  get currentStaff() {
    const start = this.staffPage * this.itemsPerPage;
    return this.staffList.slice(start, start + this.itemsPerPage); // ✅ เติม return
  }

  // ── Forms List ─────────────────────────────────────
  forms = [
    {
      title: 'ระเบียบการประเมินผลและสถิติ',
      viewUrl: 'https://drive.google.com/file/d/1BurvrsGLMCjFjTkd-1bkF55JwYoRBLJ9/view',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=1BurvrsGLMCjFjTkd-1bkF55JwYoRBLJ9'
    },
    {
      title: 'แบบฟอร์มร้องขอ ขออนุมัติสอบย้อนหลัง/สอบแก้ตัว',
      viewUrl: 'https://drive.google.com/file/d/1BurvrsGLMCjFjTkd-1bkF55JwYoRBLJ9/view',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=1BurvrsGLMCjFjTkd-1bkF55JwYoRBLJ9'
    }
  ];

  viewForm(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
