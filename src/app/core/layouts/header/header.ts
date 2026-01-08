import { Component, AfterViewInit, OnDestroy, OnInit  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements AfterViewInit, OnDestroy, OnInit {
  isHome = false;
  isHidden = false; // Initially false - header is visible
  private hideTimeout: any;
  private lastScroll = 0;
  private scrollHandler = this.onScroll.bind(this);
  private scrollThreshold = 50; // How much to scroll before hiding

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if current route is home page
        this.isHome = event.url === '/' || event.url === '/home';
        // Reset header visibility when navigating to a new page
        this.isHidden = false;
      }
    });
    
    // Initial check
    this.isHome = this.router.url === '/' || this.router.url === '/home';
  }
  
  ngAfterViewInit(): void {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
      });
    }

    // Attach scroll listener
    window.addEventListener('scroll', this.scrollHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    clearTimeout(this.hideTimeout);
  }

  // Show header when mouse enters
  showHeader(): void {
    clearTimeout(this.hideTimeout);
    this.isHidden = false;
  }

  private onScroll(): void {
    if (window.innerWidth <= 900) return; // skip on mobile

    const currentScroll = window.pageYOffset;
    
    // Only hide if we've scrolled past the threshold
    if (currentScroll > this.scrollThreshold) {
      // Hide when scrolling down
      if (currentScroll > this.lastScroll) {
        this.isHidden = true;
      }
      // Show when scrolling up (optional - remove if you don't want this)
      else if (currentScroll < this.lastScroll) {
        this.isHidden = false;
      }
    } else {
      // At top of page, always show
      this.isHidden = false;
    }

    this.lastScroll = currentScroll;
  }

  // Rest of your existing methods...
  headerTitle:string='';
  title:string='';
  description:any;
  header: any[] = [];

  constructor(private router: Router, private api:Api,) {}

  getheaders() {
    this.api.getheaders().subscribe((response: any) => {
      if (response.data && response.data.length > 0) {

        // Set section header info
        const header = response.data[0];
        this.headerTitle = header.aboutPagesHeaderName;

        // Map all services
        this.header = response.data.map((item: any) => {
          const headersItem: any = {
            description: item.description,
            sectionId: item.sectionId,
          };

          // Fetch image for this service (replace getbenefitsImage with proper service API)
          this.api.getServiceImage(item.sectionId).subscribe({
            next: (res: Blob) => {
              headersItem.image = URL.createObjectURL(res);
            },
            error: (err) => console.error('Error fetching service image:', err)
          });

          return headersItem;
        });

      }
      console.log(response);
    }, (error) => console.log(error));
  }
}