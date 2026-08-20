import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './certificate.html',
  styleUrls: ['./certificate.scss'],
})
export class Certificate {
  constructor(private location: Location) {}

  onCancel(): void {
    this.location.back();
  }
}
