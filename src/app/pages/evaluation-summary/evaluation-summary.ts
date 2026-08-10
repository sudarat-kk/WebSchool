import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evaluation-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-summary.html',
  styleUrls: ['./evaluation-summary.scss']
})
export class EvaluationSummaryComponent implements OnInit {
  courseName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseName = params['course'] || '';
    });
  }
}
