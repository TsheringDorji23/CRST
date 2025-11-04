// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common'; // Import CommonModule

// @Component({
//   selector: 'app-how-it-works',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './how-it-works.html',
//   styleUrls: ['./how-it-works.scss']
// })
// export class HowItWorks implements OnInit, OnDestroy {

//   steps = [
//     { 
//       title: 'Sending Money?', 
//       description: "Pop in their details, all set? Hit ‘Okay’ and your money’s on its way!", 
//       image: 'assets/how-it-works/step11.png' 
//     },
//     { 
//       title: 'Receiving Money?', 
//       description: "Check your account instantly and get notified once the money arrives.", 
//       image: 'assets/how-it-works/step12.png' 
//     },
//     { 
//       title: 'Tracking Transactions', 
//       description: "Monitor your transfer history and manage your transactions easily.", 
//       image: 'assets/how-it-works/step13.png' 
//     }
//   ];

//   currentStep = 0;
//   intervalId: any;

//   ngOnInit() {
//     this.startAutoSlide();
//   }

//   ngOnDestroy() {
//     clearInterval(this.intervalId);
//   }

//   startAutoSlide() {
//     this.intervalId = setInterval(() => {
//       this.currentStep = (this.currentStep + 1) % this.steps.length;
//     }, 4000); // 4 seconds per slide
//   }

//   goToStep(index: number) {
//     this.currentStep = index;
//     clearInterval(this.intervalId);
//     this.startAutoSlide();
//   }
// }




import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutCrst } from './about-crst';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock IntersectionObserver for tests
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('AboutCrstComponent', () => {
  let component: AboutCrst;
  let fixture: ComponentFixture<AboutCrst>;

  beforeAll(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: IntersectionObserverMock
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutCrst],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutCrst);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call navigateToDetails', () => {
    spyOn(console, 'log');
    component.navigateToDetails();
    expect(console.log).toHaveBeenCalledWith('Navigating to CRST details...');
  });
});


