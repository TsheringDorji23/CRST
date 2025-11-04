import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './our-services.html',
  styleUrls: ['./our-services.scss']
})
export class OurServices implements OnInit, OnDestroy {
  steps = [
    // Your service data here
    { /* ... */ },
    { /* ... */ },
    { /* ... */ },
  ];

  // Add the missing properties and methods to resolve the errors
  currentStep = 0;
  intervalId: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
    }, 4000); // 4 seconds per slide
  }

  goToStep(index: number) {
    this.currentStep = index;
    clearInterval(this.intervalId);
    this.startAutoSlide();
  }
}