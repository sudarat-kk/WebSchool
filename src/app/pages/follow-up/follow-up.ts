import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-follow-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './follow-up.html',
  styleUrls: ['./follow-up.scss']
})
export class FollowUpComponent implements OnInit {
  courseName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseName = params['title'] || '';
    });
  }
}
