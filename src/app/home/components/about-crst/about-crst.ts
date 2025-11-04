
import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-about-crst',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-crst.html',
  styleUrls: ['./about-crst.scss']
})
export class AboutCrst implements AfterViewInit, OnInit {

   aboutUsTitle:string='';
  aboutUsContent: string='';
  title:string='';
  description: SafeHtml | string = '';
  image: string | null = null;
aboutCrstImageUrl: string | null = null;


  @ViewChildren('animateEl', { read: ElementRef }) animateElements!: QueryList<ElementRef>;

  constructor(private router: Router, private api:Api, private sanitizer: DomSanitizer) {}

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const isVisible = entry.isIntersecting;
          this.animateElements.forEach((el, index) => {
            if (isVisible) {
              setTimeout(() => el.nativeElement.classList.add('animate'), index * 300);
            } else {
              el.nativeElement.classList.remove('animate');
            }
          });
        });
      },
      { threshold: 0.2 }
    );

    const container = document.querySelector('.about-crst-section');
    if (container) observer.observe(container);
  }

  ngOnInit(){
  this.getHeader();
  // this.loadAboutCrstImage();
 }


  navigateToDetails() {
    this.router.navigate(['/about-crst-details']);
  }

 getHeader() {
  this.api.getHeader().subscribe((response: any) => {
    if (response.data && response.data.length > 0) {
      const header = response.data[0];

      // Text fields
      this.aboutUsTitle = header.aboutPagesHeaderName;
      this.title = header.title;
      this.description = header.description
        ? this.sanitizer.bypassSecurityTrustHtml(header.description)
        : '';

      // Use sectionId to get image from download endpoint
      const sectionId = header.sectionId;
      this.api.getImage(sectionId).subscribe({
        next: (res: Blob) => {
          // Convert blob to URL for <img>
          this.image = URL.createObjectURL(res);
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



getContent(){
  this .api.getContent().subscribe((response:any)=> {
      this.aboutUsContent = response.data[0].aboutPagesHeaderName
      this.title = response.data[0].title
      this.description = response.data[0].description
      console.log(response);
    },(error)=>{
      console.log(error);
    })
}

}
