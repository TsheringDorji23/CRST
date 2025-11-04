import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements AfterViewInit, OnDestroy {
  private lastScroll = 0;
  private timeout: any;
  private scrollHandler = this.onScroll.bind(this);

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
    clearTimeout(this.timeout);
  }

  private onScroll(): void {
    if (window.innerWidth <= 900) return; // skip on small screens

    const header = document.querySelector('.header') as HTMLElement;
    const logo = document.querySelector('.header-logo') as HTMLElement;
    const currentScroll = window.pageYOffset;

    clearTimeout(this.timeout);

    if (currentScroll > this.lastScroll) {
      // scrolling down → hide header
      header?.classList.add('hidden');
    } else {
      // scrolling up → show header
      header?.classList.remove('hidden');
    }

    // Always keep logo visible
    if (logo) {
      logo.style.opacity = '1';
      logo.style.visibility = 'visible';
    }

    this.lastScroll = currentScroll;

    // If scrolling stops → show header after 2s
    this.timeout = setTimeout(() => {
      header?.classList.remove('hidden');
    }, 1000);
  }
}
