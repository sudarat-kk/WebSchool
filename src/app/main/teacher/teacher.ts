import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
  templateUrl: './teacher.html',
  styleUrl: './teacher.scss',
})
export class Teacher {
  status: string = 'red';



  openForm() {
    const formUrl =
      'https://docs.google.com/forms/d/e/1FAIpQLSdfxD03dBfoAeDBbs8_r-F2kbjO24AHJNEdMeRbyos50lpu2Q/viewform?usp=header';
    window.open(formUrl, '_blank');

    setTimeout(() => {
      const isConfirmed = window.confirm(
        'คุณได้ทำแบบประเมินเสร็จสิ้นแล้วใช่หรือไม่?\n(กด OK เพื่อยืนยันว่าทำเสร็จแล้ว)',
      );
      if (isConfirmed) {
        this.status = 'green';
      }
    }, 500);
  }
}
