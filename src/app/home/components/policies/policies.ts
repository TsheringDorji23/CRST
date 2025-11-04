import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies.html',
  styleUrls: ['./policies.scss']
})
export class Policies {
  openSection: string = 'terms'; // default open section

  toggleSection(section: string) {
    this.openSection = section; // always set to clicked section
  }
}
