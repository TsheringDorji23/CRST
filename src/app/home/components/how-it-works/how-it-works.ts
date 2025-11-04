// import { Component, OnInit, OnDestroy, ElementRef, Renderer2, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';

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

//   constructor(private el: ElementRef, private renderer: Renderer2) {}

//   ngOnInit() {
//     if (window.innerWidth < 992) {
//       this.startAutoSlide();
//       this.setMobileSliderHeight();
//     }
//   }

//   ngOnDestroy() {
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//     }
//   }

//   startAutoSlide() {
//     this.intervalId = setInterval(() => {
//       this.currentStep = (this.currentStep + 1) % this.steps.length;
//     }, 4000);
//   }

//   goToStep(index: number) {
//     this.currentStep = index;
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//     }
//     this.startAutoSlide();
//   }

//   @HostListener('window:resize', ['$event'])
//   onResize(event: Event) {
//     if (window.innerWidth < 992) {
//       this.setMobileSliderHeight();
//     }
//   }

//   setMobileSliderHeight() {
//     const mobileSlider = this.el.nativeElement.querySelector('.mobile-slider');
//     if (mobileSlider) {
//       this.renderer.setStyle(mobileSlider, 'height', `${window.innerHeight}px`);
//     }
//   }
// }






import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';

interface worksItem {
  description: string;
  sectionId: string;
  image?: string | null; // optional because image will be loaded later
}
@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.html',
  styleUrls: ['./how-it-works.scss']
})
export class HowItWorks implements OnInit, AfterViewInit {
  aboutUsTitle:string='';
  aboutUsContent: string='';
  title:string='';
  description:any;
image: any;
  steps = [
    {
      title: 'Sending Money?',
      description: "Pop in their details, all set? Hit ‘Okay’ and your money’s on its way!",
      image: 'assets/how-it-works/step11.png'
    },
    {
      title: 'Receiving Money?',
      description: "Check your account instantly and get notified once the money arrives.",
      image: 'assets/how-it-works/step12.png'
    },
    {
      title: 'Tracking Transactions',
      description: "Monitor your transfer history and manage your transactions easily.",
      image: 'assets/how-it-works/step13.png'
    }
  ];

  currentStep = 0;
  intervalId: any;

  private scrollTimeout: any;

  constructor(private el: ElementRef, 
    private renderer: Renderer2,
    private router: Router, 
    private api:Api

  ) {}
  ngOnInit() {
    this.getContent();
  
    if (window.innerWidth < 992) {
      this.startAutoSlide();
      this.setMobileSliderHeight();
    }
    
  }

  ngAfterViewInit() {
    // Run once initially to animate cards already in view
    setTimeout(() => {
      this.checkStepItemsInView();
    }, 100);
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
    }, 4000);
  }

  goToStep(index: number) {
    this.currentStep = index;
    if (this.intervalId) clearInterval(this.intervalId);
    this.startAutoSlide();
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 992) this.setMobileSliderHeight();
  }

  @HostListener('window:scroll')
  onScroll() {
    // throttle to improve performance
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.checkStepItemsInView();
    }, 50);
  }

  setMobileSliderHeight() {
    const mobileSlider = this.el.nativeElement.querySelector('.mobile-slider');
    if (mobileSlider) this.renderer.setStyle(mobileSlider, 'height', `${window.innerHeight}px`);
  }

  private checkStepItemsInView() {
    const stepItems: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.desktop-view .step-item');
    const windowHeight = window.innerHeight;

    stepItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      // Only check if the parent is visible
      const parentVisible = item.closest('.desktop-view')?.clientHeight ?? 0;
      if (!parentVisible) return;

      const threshold = 0.2 * rect.height;
      if (rect.top + threshold < windowHeight && rect.bottom - threshold > 0) {
        this.renderer.addClass(item, 'animate-in');
      } else {
        this.renderer.removeClass(item, 'animate-in');
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

 


 


// getContent(){
//   this .api.getContent().subscribe((response:any)=> {
//       this.aboutUsContent = response.data[0].aboutPagesHeaderName
//       this.title = response.data[0].title
//       this.description = response.data[0].description
//       this.image = response.data[0].image
//       console.log(response);
//     },(error)=>{
//       console.log(error);
//     })
// }
worksList: any[] = []; 

getContent() {
this.api.getContent().subscribe((response: any) => {
    if (response.data && response.data.length > 0) {

      // Set section header info
      const header = response.data[0];
      this.aboutUsContent = header.aboutPagesHeaderName;
      this.title = header.title;

      // Map all services
      this.worksList = response.data.map((item: any) => {
        const worksItem: any = {
          description: item.description,
          sectionId: item.sectionId,
          image: null
        };

        // Fetch image for this service (replace getbenefitsImage with proper service API)
        this.api.getWorksImage(item.sectionId).subscribe({
          next: (res: Blob) => {
            worksItem.image = URL.createObjectURL(res);
          },
          error: (err) => console.error('Error fetching service image:', err)
        });

        return worksItem;
      });

    }
    console.log(response);
  }, (error) => console.log(error));
}
}
