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
  
  // Server URLs for images
  // private serverLogoUrl = 'https://www.crst.bt/rma-website/assets/image/rma-logo-white.png';
  // private serverTitleUrl = 'https://www.crst.bt/rma-website/assets/image/Rmalogotext.jpg';

    private serverLogoUrl = '/assets/image/rma-logo-white.png';
  private serverTitleUrl = '/assets/image/Rmalogotext.jpg';
  
  // Store loaded base64 images
  private logoBase64 = '';
  private titleBase64 = '';
  private imagesLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private api: Api
  ) {}

  ngOnInit(): void {
    console.log('=== REPORT CERTIFICATE COMPONENT INITIALIZED ===');
    
    // Load images immediately
    this.loadImagesFromServer();
    
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

  // Load images from server
  private async loadImagesFromServer(): Promise<void> {
    try {
      console.log('Loading images from server...');
      
      // Load both images in parallel
      const [logoBase64, titleBase64] = await Promise.all([
        this.loadImageAsBase64(this.serverLogoUrl),
        this.loadImageAsBase64(this.serverTitleUrl)
      ]);
      
      this.logoBase64 = logoBase64;
      this.titleBase64 = titleBase64;
      this.imagesLoaded = true;
      
      console.log('Images loaded successfully');
      console.log('Logo base64 length:', logoBase64.length);
      console.log('Title base64 length:', titleBase64.length);
      
    } catch (error) {
      console.error('Failed to load server images:', error);
      
      // Use VISIBLE placeholders (NOT transparent)
      this.logoBase64 = this.createColoredPlaceholder('blue', 'RMA', 80, 80);
      this.titleBase64 = this.createColoredPlaceholder('darkblue', 'Royal Monetary Authority', 300, 60);
      this.imagesLoaded = true;
    }
  }

  // Load single image as base64
  private async loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // For CORS
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Start loading
      img.src = url;
    });
  }

  // Create visible colored placeholder
  private createColoredPlaceholder(color: string, text: string, width: number, height: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" 
            text-anchor="middle" dy=".3em">${text}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  fetchCertificate(reportNumber: string): void {
    this.loading = true;
    this.errorMessage = '';
    console.log('Calling API for report:', reportNumber);
    
    this.api.getPublicSearchCertificate(reportNumber).subscribe({
      next: (response) => {
        this.loading = false;
        this.certificateData = response;
        console.log('Certificate data loaded');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to fetch certificate data.';
        console.error('API Error:', err);
      }
    });
  }

  // Check if mortgage info should be shown
  showMortgageInfo(): boolean {
    return this.certificateData?.collaterals?.length > 0 && 
           this.getMortgageStatement() !== '';
  }

  // Generate mortgage statement based on collateral type
  getMortgageStatement(): string {
    if (!this.certificateData?.collaterals?.length) return '';

    const firstCollateral = this.certificateData.collaterals[0];
    const institutionName = this.getSecuredPartyInstitutionName();
    
    if (firstCollateral.identifierType === 'N') {
      const serialNo = firstCollateral.collateralTypeSerialNo;
      
      if (serialNo === '29' && firstCollateral.plotId) {
        return `Plot ID ${firstCollateral.plotId} is mortgaged with ${institutionName}.`;
      } else if (serialNo === '30' && firstCollateral.flatId) {
        return `Flat ID ${firstCollateral.flatId} is mortgaged with ${institutionName}.`;
      } else if (serialNo === '31' && firstCollateral.buildingId) {
        return `Building ID ${firstCollateral.buildingId} is mortgaged with ${institutionName}.`;
      }
    }
    else if (firstCollateral.identifierType === 'S' && firstCollateral.vehicleNo) {
      return `Vehicle No ${firstCollateral.vehicleNo} is mortgaged with ${institutionName}.`;
    }
    else if (firstCollateral.identifierType === 'G' && firstCollateral.collateralIdentifier) {
      return `Collateral Identifier ${firstCollateral.collateralIdentifier} is mortgaged with ${institutionName}.`;
    }
    
    return '';
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

  // Format date and time
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

  // Download Certificate as HTML
  async downloadCertificate(): Promise<void> {
    try {
      console.log('Starting download...');
      
      // Ensure images are loaded
      if (!this.imagesLoaded) {
        console.log('Images not loaded yet, loading now...');
        await this.loadImagesFromServer();
      }
      
      if (!this.logoBase64 || !this.titleBase64) {
        throw new Error('Images failed to load');
      }
      
      // Get certificate content
      const certificateContent = document.getElementById('certificate-content');
      
      if (!certificateContent) {
        alert('Certificate content not found');
        return;
      }
      
      // Get the search result table HTML
      const searchResultSection = certificateContent.querySelector('.search-result-section');
      let searchResultHtml = '';
      
      if (searchResultSection) {
        searchResultHtml = searchResultSection.innerHTML;
        
        // Remove the section title if it exists inside
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = searchResultHtml;
        const innerTitle = tempDiv.querySelector('.section-title');
        if (innerTitle) {
          innerTitle.remove();
        }
        searchResultHtml = tempDiv.innerHTML;
      }
      
      // Generate the complete HTML document
      const htmlContent = this.generateHtmlContent(searchResultHtml);
      
      // Create and download the file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RMA_Certificate_${this.reportNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Certificate downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  }

  // Generate HTML content
  private generateHtmlContent(searchResultHtml: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RMA Certificate - ${this.reportNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #000;
            background: #fff;
            padding: 20px;
        }
        
        .certificate {
            max-width: 1200px;
            margin: 0 auto;
            border: 3px solid #000;
            padding: 30px;
            page-break-inside: avoid;
        }
        
        .certificate-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
            margin-bottom: 25px;
        }
        
        .logo-section {
            flex-shrink: 0;
        }
        
        .logo-img {
            width: 80px;
            height: 80px;
            display: block;
        }
        
        .title-section {
            flex-grow: 1;
            text-align: center;
        }
        
        .title-image {
            max-width: 400px;
            height: auto;
            display: inline-block;
        }
        
        .report-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 25px 0;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
        }
        
        .report-info {
            margin: 20px 0;
        }
        
        .info-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .label {
            width: 250px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .value {
            flex-grow: 1;
        }
        
        .search-result-section {
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 25px 0 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
        }
        
        .table-wrapper {
            overflow-x: auto;
            margin: 20px 0;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            font-size: 12px;
        }
        
        .data-table th {
            background: #f0f0f0;
            padding: 10px;
            border: 1px solid #000;
            text-align: left;
            font-weight: bold;
            white-space: nowrap;
        }
        
        .data-table td {
            padding: 8px 10px;
            border: 1px solid #000;
        }
        
        .data-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .mortgage-content {
            background: #f5f5f5;
            border: 1px solid #000;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .mortgage-content p {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
        }
        
        .print-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .print-footer p {
            margin: 5px 0;
        }
        
        @media print {
            @page {
                margin: 20mm;
                size: A4 portrait;
            }
            
            body {
                padding: 0;
                background: #fff !important;
                color: #000 !important;
            }
            
            .certificate {
                border: none;
                padding: 0;
            }
            
            .data-table {
                page-break-inside: auto;
            }
            
            .data-table tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            
            .data-table td {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Header with Images -->
        <div class="certificate-header">
            <div class="logo-section">
                <img src="${this.logoBase64}" alt="RMA Logo" class="logo-img">
            </div>
            <div class="title-section">
                <img src="${this.titleBase64}" alt="Royal Monetary Authority of Bhutan" class="title-image">
            </div>
        </div>

        <!-- Main Title -->
        <h1 class="report-title">Certified Search Report</h1>

        <!-- Report Information -->
        <div class="report-info">
            <div class="info-row">
                <span class="label">Report Number:</span>
                <span class="value">${this.certificateData?.reportNumber || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Report Type:</span>
                <span class="value">${this.certificateData?.reportType === 'HIT_SEARCH' ? 'Hit Report' : this.certificateData?.reportType || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Type of Search:</span>
                <span class="value">${this.getSearchTypeDisplay(this.certificateData?.typeOfSearch)}</span>
            </div>
            <div class="info-row">
                <span class="label">Purpose:</span>
                <span class="value">${this.certificateData?.purpose || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Search Criteria:</span>
                <span class="value">${this.certificateData?.searchedByCid || this.certificateData?.vehicleOrPlotNo || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Requested By:</span>
                <span class="value">${this.certificateData?.requestedBy || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Date and Time of Search:</span>
                <span class="value">${this.formatDateTime(this.certificateData?.dateTime)}</span>
            </div>
            <div class="info-row">
                <span class="label">Collateral Type:</span>
                <span class="value">${this.certificateData?.collateralType || 'N/A'}</span>
            </div>
        </div>

        <!-- Search Result Section -->
        <div class="search-result-section">
            <h2 class="section-title">Search Result</h2>
            ${searchResultHtml || '<p>No search results available.</p>'}
            
            ${this.showMortgageInfo() ? `
            <div class="mortgage-content">
                <p>${this.getMortgageStatement()}</p>
            </div>
            ` : ''}
        </div>
    </div>
    
    <!-- Footer -->
    <div class="print-footer">
        <p>Generated on: ${new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}</p>
        <p>Report Number: ${this.reportNumber}</p>
        <p>Royal Monetary Authority of Bhutan - Central Registry</p>
        <p>This is a system generated report</p>
    </div>
</body>
</html>`;
  }

  // Print Certificate
  printCertificate(): void {
    const printContent = document.getElementById('certificate-content');
    
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    // Clone content without action buttons
    const clone = printContent.cloneNode(true) as HTMLElement;
    const actionsDiv = clone.querySelector('.actions');
    if (actionsDiv) {
      actionsDiv.remove();
    }

    // Create print document
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Print Certificate - ${this.reportNumber}</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        @media print {
            @page { margin: 20mm; }
            body { margin: 0; }
        }
        .certificate { border: 2px solid #000; padding: 20px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 8px; }
    </style>
</head>
<body>
    ${clone.outerHTML}
    <div style="text-align:center; margin-top:30px; font-size:12px; color:#666;">
        Printed on: ${new Date().toLocaleString()}
    </div>
</body>
</html>`);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  }
}