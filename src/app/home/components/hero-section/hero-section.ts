import { Component } from '@angular/core';
import { PublicSearch } from '../public-search/public-search';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [PublicSearch, NgIf],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {
 
  showSearch: boolean = false;

  openSearch() {
    this.showSearch = true;
  }

  closeSearch() {
    this.showSearch = false;
  }
}