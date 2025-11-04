

import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefits.html',
  styleUrls: ['./benefits.scss']
})
export class Benefits implements OnInit, OnDestroy {
  title:string='';
  description:any;
image:any;
benefitsTitle: any;
benefits: any[] = [];


  private observer!: IntersectionObserver;
  constructor(private router: Router, private api:Api,private el: ElementRef, private renderer: Renderer2,) {}

  ngOnInit() {
    this.observeCards();
    this.getBenefits();
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  private observeCards() {
    const cards: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.benefit-card');

    const options = {
      root: null, // relative to the viewport
      rootMargin: '0px',
      threshold: 0.2 // trigger when 20% of the element is visible
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add the animation class when the element is intersecting
          this.renderer.addClass(entry.target, 'animate-in');
          // Once the animation has been triggered, stop observing the element
          observer.unobserve(entry.target);
        }
      });
    }, options);

    cards.forEach(card => this.observer.observe(card));
  }
  
  getBenefits() {
    this.api.getBenefits().subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
  
        // Set header info (title/subtitle)
        const header = response.data[0];
        this.benefitsTitle = header.aboutPagesHeaderName;
        this.title = header.title;
  
        // Map all benefits
        this.benefits = response.data.map((item: any) => {
          const benefitItem: any = {
            description: item.description,
            sectionId: item.sectionId,
            image: null
          };
  
          // Fetch image for this benefit item
          this.api.getbenefitsImage(item.sectionId).subscribe({
            next: (res: Blob) => {
              benefitItem.image = URL.createObjectURL(res);
            },
            error: (err) => console.error('Error fetching benefit image:', err)
          });
  
          return benefitItem;
        });
  
      }
      console.log(response);
    }, (error) => console.log(error));
  }
}