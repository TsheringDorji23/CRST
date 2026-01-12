import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-certificate',
  imports: [CommonModule],
  templateUrl: './report-certificate.html',
  styleUrl: './report-certificate.scss'
})
export class ReportCertificateComponent implements OnInit {
  reportNumber = '';
  certificateData: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private api: Api
  ) {}

  ngOnInit(): void {
    console.log('=== REPORT CERTIFICATE COMPONENT INITIALIZED ===');
    console.log('Full URL:', window.location.href);
    
    this.route.queryParamMap.subscribe(params => {
      this.reportNumber = params.get('reportNo') ?? '';
      console.log('Extracted reportNo:', this.reportNumber);
      
      if (!this.reportNumber) {
        this.errorMessage = 'No report number provided in URL.';
        console.error(this.errorMessage);
        return;
      }
      
      this.fetchCertificate(this.reportNumber);
    });
  }

  fetchCertificate(reportNumber: string): void {
    this.loading = true;
    this.errorMessage = '';
    console.log('Calling API for report:', reportNumber);
    
    this.api.getPublicSearchCertificate(reportNumber).subscribe({
      next: (response) => {
        this.loading = false;
        this.certificateData = response;
        console.log('Certificate data:', response);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to fetch certificate data.';
        console.error('API Error:', err);
      }
    });
  }

  // Helper methods for display logic

  getSearchTypeDisplay(type: string): string {
    switch(type) {
      case 'ind': return 'Individual';
      case 'ins': return 'Institution';
      default: return type || 'N/A';
    }
  }

  getSecuredPartyInstitutionName(): string {
    if (this.certificateData?.securedParties?.length > 0) {
      return this.certificateData.securedParties[0].nameOfInstitution || 'N/A';
    }
    return 'N/A';
  }

  getSecuredPartyBranchName(): string {
    if (this.certificateData?.securedParties?.length > 0) {
      return this.certificateData.securedParties[0].branchName || 'N/A';
    }
    return 'N/A';
  }

  getDebtorIdentificationNo(): string {
    if (this.certificateData?.debtors?.length > 0) {
      return this.certificateData.debtors[0].identificationNo || 'N/A';
    }
    return 'N/A';
  }

  getDebtorName(): string {
    if (this.certificateData?.debtors?.length > 0) {
      return this.certificateData.debtors[0].appName || 'N/A';
    }
    return 'N/A';
  }

  getDebtorInstitutionNo(): string {
    if (this.certificateData?.debtors?.length > 0) {
      return this.certificateData.debtors[0].institutionNo || 'N/A';
    }
    return 'N/A';
  }

  getDebtorEstablishmentName(): string {
    if (this.certificateData?.debtors?.length > 0) {
      return this.certificateData.debtors[0].estbName || 'N/A';
    }
    return 'N/A';
  }

  // Helper method to format date and time
  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      
      return `${month} ${day}, ${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    } catch (e) {
      return dateString;
    }
  }

  // Helper method to format date only
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch (e) {
      return dateString;
    }
  }

  // Print function
  printCertificate(): void {
    window.print();
  }
}