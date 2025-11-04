// File: src/app/home/components/our-services/our-services.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './our-services.html',
  styleUrls: ['./our-services.scss']
})
export class OurServices implements OnInit, OnDestroy {
  // ✅ This array must be populated with objects that have 'title', 'description', and 'image'.
  // steps = [
  //   { 
  //     title: 'Search Registered Interests', 
  //     description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s', 
  //     image: 'assets/images/search.svg' 
  //   },
  //   { 
  //     title: 'Register a new Security Interest', 
  //     description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s', 
  //     image: 'assets/images/register.svg' 
  //   },
  //   // Add more steps as needed
  // ];
  steps: any[] = [];  
  aboutUsTitle:string='';
   aboutUsContent: string='';
   title:string='';
   description:any;
   servicesHeader: any;
   services: any[] = [];
   subtitle: any;

  // ✅ These properties and methods must exist in your class
  currentStep = 0;
  intervalId: any;
  constructor(
    private router: Router, 
    private api:Api

  ) {}
  ngOnInit() {
    this.startAutoSlide();
    this.getServices();

  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
    }, 4000);
  }

  goToStep(index: number) {
    this.currentStep = index;
    clearInterval(this.intervalId);
    this.startAutoSlide();
  }
  getServices() {
    this.api.getServices().subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
  
        // Set section header info
        const header = response.data[0];
        this.servicesHeader = header.aboutPagesHeaderName;
        this.title = header.title;
        this.subtitle = header.subtitle;
  
        // Map all services
        this.services = response.data.map((item: any) => {
          const serviceItem: any = {
            description: item.description,
            sectionId: item.sectionId,
            image: null
          };
  
          // Fetch image for this service (replace getbenefitsImage with proper service API)
          this.api.getServiceImage(item.sectionId).subscribe({
            next: (res: Blob) => {
              serviceItem.image = URL.createObjectURL(res);
            },
            error: (err) => console.error('Error fetching service image:', err)
          });
  
          return serviceItem;
        });
  
      }
      console.log(response);
    }, (error) => console.log(error));
  }
}