import { Component } from '@angular/core';
import { PublicSearch } from '../public-search/public-search';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [PublicSearch, NgIf],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {
  footerTitle:string='';
  aboutUsContent: string='';
  title:string='';
  description:any;
  showSearch: boolean = false;
  heroImageUrl: string | null = null;

  constructor(private router: Router, private api:Api) {}

  openSearch() {
    this.showSearch = true;
  }

  closeSearch() {
    this.showSearch = false;
  }
  ngOnInit(){
    this.getFooter();
    // this.loadAboutCrstImage();
    
   }
   getFooter() {
    this.api.getFooter().subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
        const header = response.data[0];
  
        // Text fields
        this.footerTitle = header.aboutPagesHeaderName;
        this.title = header.title;
  
        // Use sectionId to get image from download endpoint
        const sectionId = header.sectionId;
        this.api.getImage(sectionId).subscribe({
          next: (res: Blob) => {
            // Convert blob to URL for <img>
            this.heroImageUrl = URL.createObjectURL(res);
          },
          error: (err) => {
            console.error('Error fetching image:', err);
          }
        });
      }
      console.log(response);
    }, (error) => {
      console.log(error);
    });
  }
scrollToNextSection() {
  // Scroll to next section smoothly
  const nextSection = document.querySelector('section:nth-of-type(2)');
  
  if (nextSection) {
    nextSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  } else {
    // Fallback scroll
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  }
}
  
}
