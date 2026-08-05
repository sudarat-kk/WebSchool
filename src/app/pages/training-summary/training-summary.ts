import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-training-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-summary.html',
  styleUrls: ['./training-summary.scss']
})
export class TrainingSummaryComponent implements OnInit {
  courseName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseName = params['course'] || '';
    });
  }
}
