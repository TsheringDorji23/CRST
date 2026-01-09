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
}