import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../../service/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type NewsCategory = 'rma' | 'notification' | 'announcement';

interface NewsArticle {
  id: number;
  title: string;
  date: string;
  text: string;
  category: NewsCategory;
  image?: string;
  postUrl?: string;
  expanded?: boolean;
  benefits?: string[];
}

interface NewsItem {
  title: string;
  description: string;
  sectionId: string;
  image?: string | null;
}

@Component({
  selector: 'app-news-and-announcement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-and-announcement.html',
  styleUrls: ['./news-and-announcement.scss']
})
export class NewsAndAnnouncement implements OnInit {
  newsTitle = '';
  title = '';
  description: any;
  image: any;
  aboutCrstImageUrl: string | null = null;
  newsItems: any[] = [];
  displayedNewsCount: number = 6;
  
  // Add this new property
  expandedArticle: NewsArticle | null = null;
  
  constructor(
    private router: Router, 
    private api: Api,
    private sanitizer: DomSanitizer
  ) {}
  
  news: any[] = [];
  newsList: any[] = [];
  
  readonly textPreviewLimit = 220;
  activeCategory: NewsCategory = 'rma';
  visibleArticleCount: number = 6;
  loading: boolean = false;
  selectedArticle: any = null;
  readonly WORD_LIMIT = 40;
  
  // Add these methods for full page functionality
  openFullPage(article: NewsArticle): void {
    this.expandedArticle = article;
    // Prevent body scrolling when full page is open
    document.body.style.overflow = 'hidden';
  }
  
  closeFullPage(): void {
    this.expandedArticle = null;
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  }
  
  // Download document for notifications
  downloadDocument(article: NewsArticle): void {
    if (article.image) {
      const link = document.createElement('a');
      link.href = article.image;
      link.download = this.getDocumentName(article);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  getDocumentName(article: NewsArticle): string {
    const category = article.category === 'notification' ? 'Notification' : 'Document';
    const date = article.date.replace(/ /g, '-');
    return `${category}-${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${date}.png`;
  }
  
  // Rest of your existing methods remain the same
  toggleNewsReadMore(index: number) {
    this.newsItems[index].expanded = !this.newsItems[index].expanded;
  }

  loadMoreNews() {
    this.displayedNewsCount = this.newsItems.length;
    console.log('Loading more news...');
  }

  readMore() {
    this.router.navigate(['/news-details']);
  }

  private registerLegacyReadMoreToggle() {
    if (typeof window === 'undefined') return;

    (window as any).toggleReadMore = (buttonEl: HTMLElement) => {
      if (!buttonEl) return;

      const benefitItem = buttonEl.closest('.benefit-item');
      if (!benefitItem) return;

      const isExpanded = benefitItem.classList.toggle('expanded');
      const label = buttonEl.querySelector('.btn-text');
      if (label) label.textContent = isExpanded ? 'Read Less' : 'Read More';
    };
  }

  ngOnInit() {
    this.getNews();
    this.registerLegacyReadMoreToggle();
  }

  getNews() {
    this.api.getNews().subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
        const header = response.data[0];
        this.newsTitle = header.aboutPagesHeaderName;

        this.newsList = response.data.map((item: any) => {
          const newsList: any = {
            title: item.title,
            description: item.description,
            sectionId: item.sectionId,
            image: null
          };

          this.api.getNewsImage(item.sectionId).subscribe({
            next: (res: Blob) => {
              newsList.image = URL.createObjectURL(res);
            },
            error: (err) => console.error('Error fetching service image:', err)
          });

          return newsList;
        });
      }
      console.log(response);
    }, (error) => console.log(error));
  }

  newsArticles: NewsArticle[] = [
    // RMA News
    {
      id: 1,
      title: 'Appointment of the New Governor',
      date: 'December 5, 2025',
      text: `Welcoming Governor Yangchen Tshogyel to the Royal Monetary Authority

25 November 2025: His Majesty The King granted Dhar to appoint Ms. Yangchen Tshogyel as the new Governor of the Royal Monetary Authority of Bhutan. Governor Yangchen, the 3rd Governor of the RMA and the first woman to assume this role, brings over two decades of distinguished service to Bhutan's central bank, having risen from Research Officer to Deputy Governor and led key national initiatives including the Druk Gyalpo's Relief Kidu (DGRK) income support programme.

The RMA offers its heartfelt felicitations to Governor Yangchen Tshogyel and looks forward with confidence to her leadership as she guides the institution into a new era of innovation, resilience and transformation.`,
      category: 'rma',
      image: 'assets/image/govnner.jpg',
      postUrl: 'https://www.facebook.com/rmabhutan',
      expanded: false,
    },
    {
      id: 2,
      title: 'Launch of the New Generation Banknotes',
      date: 'November 13, 2025',
      text: `A National Tribute in Currency: Bhutan Unveils New Generation Ngultrum Banknotes to Celebrate the 70th Birth Anniversary of the Fourth Druk Gyalpo

Thimphu, Bhutan - In this momentous celebration of legacy, leadership, and profound national reverence, the Royal Monetary Authority of Bhutan will introduce a new series of currency banknotes on November 12th 2025 to commemorate the 70th auspicious Birth Anniversary of His Majesty the Fourth Druk Gyalpo, Jigme Singye Wangchuck, the visionary monarch who steered Bhutan into a modern constitutional democracy.

The New Generation of Ngultrum Banknotes are with latest security features and are recyclable, sustainable and more durable compared to paper substrate which does not last long. For this reasons many nations now opt for polymer instead of paper substrate. Meanwhile, all series of ngultrum issued earlier shall remain as legal tender.`,
      category: 'rma',
      image: 'assets/image/money.jpg',
      postUrl: 'https://www.facebook.com/rmabhutan',
      expanded: false,
    },
    // Public Notifications
    {
      id: 3,
      title: 'Public Notification on Refraining from Fraudulent Messages',
      date: 'December 10, 2025',
      text: `PUBLIC NOTIFICATION: Refrain from Engaging with Fraudulent Messages

The Royal Monetary Authority of Bhutan (RMA) hereby alerts the general public to exercise extreme caution and refrain from engaging with fraudulent messages received via email, SMS, or social media platforms.`,
      category: 'notification',
      image: 'assets/image/595677106_1168256658819434_4764625422224126066_n.jpg',
      postUrl: 'https://www.facebook.com/rmabhutan',
      expanded: false,
    },
    {
      id: 4,
      title: 'Public Notification on OTP Scams',
      date: 'November 10, 2025',
      text: `PUBLIC NOTIFICATION: Awareness on One-Time Password (OTP) Scams

The Royal Monetary Authority of Bhutan (RMA) issues this urgent notification to raise public awareness about the increasing incidents of One-Time Password (OTP) scams targeting bank customers and digital payment users across Bhutan.`,
      category: 'notification',
      image: '/assets/image/OTP.jpg',
      postUrl: 'https://www.facebook.com/rmabhutan/',
      expanded: false,
    },
     
    // Announcements
    {
      id: 5,
      title: 'Press Release: "Best New Banknote Series" Award',
      date: 'December 9, 2025',
      text: `PRESS RELEASE: Royal Monetary Authority Wins Prestigious "Best New Banknote Series" Award at High Security Printing Asia 2025

Thimphu, Bhutan - The Royal Monetary Authority (RMA) of Bhutan has won the prestigious "Best New Banknote Series" award at the High Security Printing Asia 2025 conference, held last week in Kuala Lumpur, Malaysia.

RMA shared this accolade with the Bank of Japan for its newly launched Nu 100, Nu 500, and Nu 1,000 banknote recently unveiled on 12th November 2025 commemorating the 70th Birth Anniversary of His Majesty the Fourth Druk Gyalpo. The award evaluation focused on the number of security features incorporated, overall design quality, and durability. Designed and printed by De La Rue on SAFEGUARD® polymer substrate, the series marks a major upgrade in durability, sustainability, and public authentication, competing successfully against entries from 51 Asia Pacific countries.

The new banknote series, set to enter circulation from January 2026, feature advanced optical elements including ARGENTUM™, ROTATE™, enhanced GEMINI™, tactile emboss, and a sophisticated holographic stripe with DEPTH™ and SPOTLIGHT® effects on the Nu 500 and Nu 1,000 denominations, depicting a dynamic dragon grasping jewels. Both RMA and De La Rue emphasize that these notes embody Bhutan's commitment to innovation, inclusivity, and the enduring values of its monarchy. Set for circulation from January 2026, the recyclable polymer enhances environmental sustainability over traditional paper currency. The new banknotes will be introduced into circulation alongside the existing currency notes, ensuring a smooth transition and continued accessibility for the public. This co-circulation approach allows users to gradually become familiar with the innovative features and enhanced durability of the new series.

This international recognition validates RMA's commitment to innovation, security, and sustainability in our currency. The new series not only enhances public trust through superior anti-counterfeiting measures but also aligns with Bhutan's environmental stewardship principles by reducing the lifecycle environmental impact of banknotes.

The award marks a significant milestone for the Royal Monetary Authority, underscoring Bhutan's growing prominence in the global currency and security printing arena. This recognition inspires the RMA to continue its pursuit of excellence, innovation, and sustainability in currency design and issuance. Building on this success, the RMA remains committed to advancing its mission of safeguarding the nation's monetary integrity while setting new benchmarks for future achievements.`,
      category: 'announcement',
      image: 'assets/image/money2.jpg',
      postUrl: 'https://www.facebook.com/rmabhutan',
      expanded: false,
    },
    {
      id: 6,
      title: 'The Governor of the (RMA) addressed the second batch of the Pelsung Cohort',
      date: 'December 24, 2025',
      text: `The Governor of the Royal Monetary Authority (RMA) addressed the second batch of the Pelsung Cohort in Gelephu today, emphasizing the values of resilience, passion, and unwavering dedication in fulfilling His Majesty's noble vision for the nation through the Gelephu Mindfulness City (GMC).

The program will continue over the next two days and will be led by officials from the RMA. It will cover topics such as Personal Financial Literacy, Financial Forecasting for Business Development, and the Project Management Framework.`,
      category: 'rma',
      image: '/assets/image/metting pelsung.jpg',
      postUrl: 'https://www.facebook.com/rmabhutan',
      expanded: false,
    }
  ];

  setActiveCategory(category: string) {
    this.activeCategory = category as NewsCategory;
    this.visibleArticleCount = 6;
    // Close full page when changing category
    this.closeFullPage();
  }

  getFilteredArticles(): NewsArticle[] {
    return this.newsArticles.filter(article => article.category === this.activeCategory);
  }

  getCategoryLabel(category: NewsCategory): string {
    switch(category) {
      case 'rma': return 'RMA News';
      case 'notification': return 'Public Notification';
      case 'announcement': return 'Announcement';
      default: return 'News';
    }
  }

  getCategoryTitle(): string {
    switch(this.activeCategory) {
      case 'rma': return 'RMA News';
      case 'notification': return 'Public Notifications';
      case 'announcement': return 'Announcements';
      default: return 'All News & Announcements';
    }
  }

  getCategoryDescription(): string {
    switch(this.activeCategory) {
      case 'rma': return 'Explore the official communications from the Royal Monetary Authority of Bhutan.';
      case 'notification': return 'Important alerts and advisories to keep the public informed and protected.';
      case 'announcement': return 'Discover latest announcements on key updates and important notices.';
      default: return 'Browse all the latest updates from CRST and RMA';
    }
  }

  loadMoreArticles() {
    this.visibleArticleCount += 3;
  }

  isTextTruncatable(text: string): boolean {
    return (text ?? '').length > this.textPreviewLimit;
  }

  getTruncatedText(text: string): string {
    const safeText = text ?? '';
    if (!this.isTextTruncatable(safeText)) {
      return safeText;
    }
    return `${safeText.slice(0, this.textPreviewLimit).trimEnd()}...`;
  }

  getArticleImage(article: NewsArticle): string {
    if (article.image) {
      return article.image;
    }
    switch (article.category) {
      case 'rma':
        return 'assets/news/rma-building.jpg';
      case 'notification':
        return 'assets/icons/document-icon.png';
      case 'announcement':
        return 'assets/news/n1.png';
      default:
        return 'assets/news/n1.png';
    }
  }

  isUploadedImage(article: NewsArticle): boolean {
    return typeof article.image === 'string' && article.image.startsWith('data:');
  }

  onImageSelected(article: NewsArticle, event: Event) {
    if (article.category === 'notification') {
      return;
    }

    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        article.image = result;
      }
    };
    reader.readAsDataURL(file);

    if (input) {
      input.value = '';
    }
  }

  removeImage(article: NewsArticle) {
    if (article.category === 'notification') {
      return;
    }
    article.image = undefined;
  }
}