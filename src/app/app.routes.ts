import { Routes } from '@angular/router';
import { HomePage } from './home/home-page/home-page';
import { AboutCrst } from './home/components/about-crst/about-crst';
import { HowItWorks } from './home/components/how-it-works/how-it-works';
import { OurServices} from './home/components/our-services/our-services';
import { Testimonial } from './home/components/testimonial/testimonial';
import { Faq } from './home/components/faq/faq';
import { Benefits } from './home/components/benefits/benefits';
import { NewsAndAnnouncement} from './home/components/news-and-announcement/news-and-announcement';
import { LawAndRegulations } from './home/components/law-and-regulations/law-and-regulations';
import { PublicSearch } from './home/components/public-search/public-search';
import { HeroSection } from './home/components/hero-section/hero-section';
import { AboutCrstDetails } from './home/components/about-crst-details/about-crst-details';
import { Policies } from './home/components/policies/policies';
import { NewsDetails } from './home/components/news-details/news-details';

export const routes: Routes = [
     {
    path: '',
    component: HomePage
  },

  { path: 'about-crst-details',
    component: AboutCrstDetails },

  {
    path: 'hero',
    component: HeroSection
  },

    {
    path: 'public-search',
    component: PublicSearch
  },

  {
    path: 'about-crst', 
    component: AboutCrst
  },
  {
    path: 'how-it-works',
    component: HowItWorks
  },
  {
    path: 'our-services',
    component: OurServices
  },
  {
    path: 'benefits',
    component: Benefits
  },
  {
    path: 'news-and-announcement',
    component: NewsAndAnnouncement
  }, 
  {
    path: 'law-and-regulations',
    component: LawAndRegulations
  }, 
  {
    path: 'testimonial',
    component: Testimonial
  },
  {
    path: 'faq',
    component: Faq
  },

  {path: 'policies',
    component: Policies
  },

  {path: 'news-details',
    component: NewsDetails
  },
  
];