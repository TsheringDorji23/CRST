import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NewsArticle {
  title: string;
  date: string;
  text: string;
  benefits?: string[];
}

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-details.html',
  styleUrls: ['./news-details.scss'],
})
export class NewsDetails {
  newsArticles: NewsArticle[] = [
    {
      title: 'Promoting Digital Payments',
      date: 'September 24, 2025',
      text: 'To reduce the risks of counterfeit bank notes, protect currency from fuel-related damage, and support Bhutan’s transition toward a cash-lite digital economy...',
      benefits: [
        'Reduce risks associated with handling cash',
        'Faster and easier payments',
        'Better monitoring & security',
      ],
    },
    {
      title: 'Launch of e-Tendering System',
      date: 'September 15, 2025',
      text: 'The new e-tendering platform has been introduced to ensure transparency and efficiency.',
    },
    {
      title: 'Digital Awareness Program',
      date: 'September 10, 2025',
      text: 'CRST held an awareness program to promote digital payments among citizens.',
      benefits: ['Education', 'Convenience', 'Security'],
    },
  ];

  sidebarNews: NewsArticle[] = [
    { title: 'Digital Banking Awareness', date: 'Sep 20, 2025', text: 'Details about digital banking awareness.' },
    { title: 'RMA Launches QR Payment', date: 'Sep 18, 2025', text: 'RMA launches new QR payment system in Bhutan.' },
    { title: 'Upcoming FinTech Seminar', date: 'Sep 05, 2025', text: 'A seminar on fintech and digital payments.' },
  ];

  visibleArticleCount = 2;
  visibleSidebarCount = 2;
  articlesPerPage = 2;
  sidebarPerPage = 2;
  loading = false;
  searchQuery = '';
  selectedArticle: NewsArticle | null = null;

  // --- Load More Main News ---
  loadNews() {
    this.loading = true;
    setTimeout(() => {
      const moreNews: NewsArticle[] = [
        { title: 'Financial Literacy Campaign', date: 'September 05, 2025', text: 'RMA, in collaboration with MoF, launched a financial literacy campaign.' },
        { title: 'Bhutan Moves Towards Cashless Economy', date: 'September 01, 2025', text: 'Initiatives to encourage mobile payments and digital transactions.', benefits: ['Faster transactions', 'Safer payments', 'Tracking of money flow'] },
      ];
      this.newsArticles = [...this.newsArticles, ...moreNews];
      this.visibleArticleCount += this.articlesPerPage;
      this.loading = false;
    }, 500);
  }

  // --- Load More Sidebar ---
  loadMoreSidebar() {
    const moreSidebar: NewsArticle[] = [
      { title: 'Mobile Banking Usage Statistics', date: 'Aug 28, 2025', text: 'Statistics of mobile banking usage in Bhutan.' },
      { title: 'Central Bank Annual Report', date: 'Aug 15, 2025', text: 'Central Bank releases annual report.' },
    ];
    this.sidebarNews = [...this.sidebarNews, ...moreSidebar];
    this.visibleSidebarCount += this.sidebarPerPage;
  }

  // --- Select Sidebar Article ---
  selectSidebarArticle(article: NewsArticle) {
    this.selectedArticle = article;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Search ---
  onSearch() {
    if (!this.searchQuery.trim()) return;
    this.selectedArticle = null;
    this.visibleArticleCount = this.articlesPerPage;
    this.newsArticles = this.newsArticles.filter(a =>
      a.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // --- Check Benefits ---
  hasBenefits(article: NewsArticle): boolean {
    return Array.isArray(article.benefits) && article.benefits.length > 0;
  }
}
