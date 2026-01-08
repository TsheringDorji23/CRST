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
 services = [
  {
  title: '1. Search',
  previewText: '"Search" allows the user to verify whether movable or immovable property is already pledged as collateral.',
  fullText: [
    '<strong>"Search"</strong> allows the user to verify whether movable or immovable property is already pledged as collateral. Upon conducting a search, the system provides a certified search report indicating any active registrations. This enables both lenders and buyers to make informed and secure decisions.',
    '• <strong>Public:</strong> Any individual can obtain information on active property registrations.',
    '',
    '• <strong>Financial Service Providers (FSPs):</strong> Mandatory Search is required before registering any security interest by the FSPs. This reduces risk and helps establish the priority of claims.',
    '',
    '<strong>Search Criteria:</strong>',
    '',
    '<strong>Public:</strong>',
    '• For movable property, searches can be carried out using the individual/Institution\'s Asset Identification Number (refer FAQs).',
    '• For immovable property, searches can be conducted using the individual/Institution\'s Plot number or Flat number.',
    '',
    '<strong>FSPs:</strong>',
    '• For movable property, searches can be carried out using the individual/Institution\'s debtor\'s identification number (CID number) or Asset Identification Number.',
    '• For immovable property, searches can be conducted using the individual/Institution\'s debtor\'s identification number (CID number), Plot number or Flat number.'
  ],
  expanded: false
},
    {
      title: '2. Registration',
      previewText: 'Registration is the core service of iCoMS, allowing FSPs to legally perfect a security interest or mortgage...',
      fullText: [
        'Registration is the core service of iCoMS, allowing FSPs to legally perfect a security interest or mortgage by submitting an electronic initial registration statement.',
        'This act of registration provides public notice and establishes legal priority against other claimants.',
        '',
        '• For movable property, this includes details such as:',
        '  - Debtor\'s identification number',
        '  - Description of the collateral (which can be specific or generic)',
        '  - Secured party\'s information',
        '  - Amount secured',
        '',
        '• For immovable property, registration requires:',
        '  - Debtor\'s identification number',
        '  - Precise description of the land using the Thram and Plot numbers',
        '  - Amount secured'
      ],
      expanded: false
    },
    {
      title: '3. Amendment',
      previewText: 'The amendment feature allows FSPs to update or correct information in an existing registration...',
      fullText: [
        'The amendment feature allows FSPs to update or correct information in an existing registration so that records for movable & immovable collaterals remain accurate throughout the cycle of a loan.',
        'Amendments are made when there is a change after the initial registration has already been completed.'
      ],
      expanded: false
    },
    {
      title: '4. Continuity',
      previewText: 'If the loan term specified in iCoMS expires without discharge, the system automatically classifies...',
      fullText: [
        'If the loan term specified in iCoMS expires without discharge, the system automatically classifies the registration under continuity, treating it as a new registration.'
      ],
      expanded: false
    },
    {
      title: '5. Discharge/Release',
      previewText: 'In iCoMS, whether for movable or immovable property, it is mandatory for the FSPs to discharge or release...',
      fullText: [
        'In iCoMS, whether for movable or immovable property, it is mandatory for the FSPs to discharge or release the registered security interest from the system once the loan is fully repaid/recovered.'
      ],
      expanded: false
    }
  ];
getColumnData(textArray: string[], columns: number): string[][] {
  const result: string[][] = Array.from({ length: columns }, () => []);
  const itemsPerColumn = Math.ceil(textArray.length / columns);
  
  textArray.forEach((item, index) => {
    const columnIndex = Math.floor(index / itemsPerColumn);
    if (columnIndex < columns) {
      result[columnIndex].push(item);
    }
  });
  
  return result;
}
getServiceIcon(title: string): string {
  const iconMap: { [key: string]: string } = {
    'Search': 'fas fa-search',
    'Registration': 'fas fa-file-signature',
    'Amendment': 'fas fa-edit',
    'Continuity': 'fas fa-sync-alt',
    'Discharge/Release': 'fas fa-check-circle'
  };
  
  // Extract the main title without number
  const mainTitle = title.replace(/^\d+\.\s*/, '');
  return iconMap[mainTitle] || 'fas fa-info-circle';
}
  toggleReadMore(index: number) {
    this.services[index].expanded = !this.services[index].expanded;
  }
  steps: any[] = [];  
  aboutUsTitle:string='';
   aboutUsContent: string='';
   title:string='';
   description:any;
   servicesHeader: any;
  //  services: any[] = [];
  subtitle: any;
  heroImageUrl: string | null = null;

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

        this.api.getImage(header.sectionId).subscribe({
          next: (res: Blob) => {
            this.heroImageUrl = URL.createObjectURL(res);
          },
          error: (err) => console.error('Error fetching hero image:', err)
        });
  
        // Map all services
        this.services = response.data.map((item: any) => {
          const serviceItem: any = {
            description: item.description,
            sectionId: item.sectionId,
            subtitle: item.subtitle,
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
