import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../service/api';
import { Router } from '@angular/router';

interface FaqsItem {
  question: string;
  answer: string;
  type: 'general' | 'movable' | 'immovable'; // category
  image?: string | null;
}
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class Faq {
  title = '';
  description = '';
  questionTitle = '';
  button = '';
  imageCaption = '';
  subtitle = '';
  
  selectedFaqType: 'general' | 'movable' | 'immovable' = 'general'; // default
  faqs: FaqsItem[] = [];   // all FAQs
  filteredFaqs: FaqsItem[] = []; // shown FAQs

  constructor(private router: Router, private api: Api) {}

  toggleAccordion(faqItemId: string) {
    const faqItem = document.getElementById(faqItemId);
    if (faqItem) {
      faqItem.classList.toggle('active');
    }
  }

  private resetAccordions(): void {
    const activeFaqItems = document.querySelectorAll('.faq-item.active');
    activeFaqItems.forEach(item => item.classList.remove('active'));
  }
  ngOnInit() {
    this.getFaq();
  }

  selectFaqType(type: 'general' | 'movable' | 'immovable'): void {
    this.resetAccordions();
    this.selectedFaqType = type;
    this.applyFilter();
  }

  // toggleAccordion(faqItemId: string) {
  //   const faqItem = document.getElementById(faqItemId);
  //   if (faqItem) {
  //     faqItem.classList.toggle('active');
  //   }
  // }

  // private resetAccordions(): void {
  //   const activeFaqItems = document.querySelectorAll('.faq-item.active');
  //   activeFaqItems.forEach(item => {
  //     item.classList.remove('active');
  //   });
  // }

  getFaq() {
    this.api.getFaq().subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
        // header info (from first record)
        const header = response.data[0];
        this.questionTitle = header.aboutPagesHeaderName || '';
        this.title = header.title || '';
        this.description = header.description?.trim() || '';
        this.button = header.button?.trim() || '';
        this.imageCaption = header.imageCaption?.trim() || '';
        this.subtitle = header.subtitle || '';

        // Map all FAQs with type logic
        this.faqs = response.data.map((item: any) => {
          let type: 'general' | 'movable' | 'immovable' = 'general';

          if (item.imageCaption && item.imageCaption.trim() !== '') {
            type = 'immovable';
          } else if (item.button && item.button.trim() !== '') {
            type = 'movable';
          } else if (item.description && item.description.trim() !== '') {
            type = 'general';
          }

          const faqItem: FaqsItem = {
            question: item.question,
            answer: item.answer,
            type
          };

          // attach image if exists
          this.api.getFaqImage(item.sectionId).subscribe({
            next: (res: Blob) => {
              faqItem.image = URL.createObjectURL(res);
            },
            error: (err) => console.error('Error fetching faq image:', err)
          });

          return faqItem;
        });

        // apply initial filter
        this.applyFilter();
      }
    }, (error) => console.log(error));
  }

  // 👉 filter FAQs based on selectedFaqType
  applyFilter() {
    this.filteredFaqs = this.faqs.filter(faq => faq.type === this.selectedFaqType);
  }
}
