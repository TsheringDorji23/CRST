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

  reportNumber: string = '';
  certificateData: any = null;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private api: Api
  ) { }

  ngOnInit(): void {
    // ✅ Get reportNo from query param
    this.route.queryParams.subscribe(params => {
      this.reportNumber = params['reportNo'] || '';
      if (this.reportNumber) {
        this.fetchCertificate(this.reportNumber);
      } else {
        this.errorMessage = 'Report number is missing.';
      }
    });
  }

  fetchCertificate(reportNumber: string) {
    this.loading = true;
    this.api.getPublicSearchCertificate(reportNumber).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.certificateData = response;
        console.log('Certificate Data:', response);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to fetch certificate data.';
        console.error('Error fetching certificate:', err);
      }
    });
  }

}