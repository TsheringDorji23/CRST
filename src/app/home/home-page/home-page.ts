import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeroSection } from '../components/hero-section/hero-section';
import { HowItWorks } from '../components/how-it-works/how-it-works';
import { CommonModule } from '@angular/common';
import { Testimonial } from '../components/testimonial/testimonial';
import { FeaturingPartner } from '../components/featuring-partner/featuring-partner';
import { AboutCrst } from '../components/about-crst/about-crst';
import { Benefits } from '../components/benefits/benefits';
import { NewsAndAnnouncement } from '../components/news-and-announcement/news-and-announcement';
import { Faq } from '../components/faq/faq';
import { OurServices } from '../components/our-services/our-services';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ HeroSection,
    // AboutCrst, 
    // OurServices, 
    HowItWorks, 
    // Benefits,
    // Testimonial, 
    Faq,
    // NewsAndAnnouncement ,
    FeaturingPartner,
    CommonModule, ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {

}
