import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

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
  
  // Base64 encoded image placeholders (fallback)
  private logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgSURBVHgB7cEBDQAAAMKg909tDwcEAAAAAAAAAAAAAAAAAAAABJjwCAABsLrJ7wAAAABJRU5ErkJggg=='; // Simple white placeholder
  private titleBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAC4CAYAAAD5i2JAAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgSURBVHgB7cEBDQAAAMKg909tDwcEAAAAAAAAAAAAAAAAAAAABJjwCAABsLrJ7wAAAABJRU5ErkJggg=='; // Simple text placeholder

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    console.log('=== REPORT CERTIFICATE COMPONENT INITIALIZED ===');
    
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
    
    // Check for Immovable Property (identifierType = 'N')
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
    // Check for Movable Property - Individual/Institution (identifierType = 'S')
    else if (firstCollateral.identifierType === 'S' && firstCollateral.vehicleNo) {
      return `Vehicle No ${firstCollateral.vehicleNo} is mortgaged with ${institutionName}.`;
    }
    // Check for Movable Property - Government (identifierType = 'G')
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

  // Convert image to base64 for download
  async imageToBase64(imageUrl: string): Promise<string> {
    try {
      // For external URLs or relative paths
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      // Return fallback base64 images based on image type
      if (imageUrl.includes('rma-logo-white')) {
        return this.logoBase64;
      } else if (imageUrl.includes('Rmalogotext')) {
        return this.titleBase64;
      }
      return '';
    }
  }

  // Download Certificate as HTML with embedded images
  async downloadCertificate(): Promise<void> {
    try {
      const certificateContent = document.getElementById('certificate-content');
      
      if (!certificateContent) {
        alert('Certificate content not found');
        return;
      }

      // Convert images to base64
      const logoElement = certificateContent.querySelector('#rma-logo') as HTMLImageElement;
      const titleElement = certificateContent.querySelector('#rma-title') as HTMLImageElement;
      
      let logoBase64 = this.logoBase64;
      let titleBase64 = this.titleBase64;
      
      // Try to get actual images if possible
      if (logoElement && logoElement.src) {
        try {
          logoBase64 = await this.imageToBase64(logoElement.src);
        } catch (e) {
          console.log('Using fallback logo');
        }
      }
      
      if (titleElement && titleElement.src) {
        try {
          titleBase64 = await this.imageToBase64(titleElement.src);
        } catch (e) {
          console.log('Using fallback title image');
        }
      }

      // Clone the certificate content to modify for download
      const clone = certificateContent.cloneNode(true) as HTMLElement;
      
      // Remove action buttons from the clone
      const actionsDiv = clone.querySelector('.actions');
      if (actionsDiv) {
        actionsDiv.remove();
      }

      // Create a complete HTML document with embedded images
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RMA Certificate - ${this.reportNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #000;
        }
        
        .certificate {
            max-width: 1200px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 25px;
        }
        
        .certificate-header {
            display: flex;
            gap: 20px;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .logo-section .logo-img {
            width: 80px;
            height: 80px;
        }
        
        .title-section {
            text-align: center;
            flex: 1;
        }
        
        .title-image {
            max-width: 100%;
            height: auto;
            max-height: 80px;
        }
        
        .report-title {
            text-align: center;
            margin: 20px 0;
            font-size: 22px;
            font-weight: bold;
            padding-bottom: 10px;
            border-bottom: 1px solid #000;
        }
        
        .report-info .info-row {
            display: flex;
            padding: 6px 0;
            border-bottom: 1px solid #eee;
        }
        
        .report-info .info-row:last-child {
            border-bottom: none;
        }
        
        .report-info .label {
            width: 220px;
            font-weight: 600;
        }
        
        .report-info .value {
            flex: 1;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin: 25px 0 15px;
            padding: 8px 0;
            border-bottom: 1px solid #000;
        }
        
        .mortgage-content {
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #000;
            border-radius: 4px;
            background: #f5f5f5;
        }
        
        .mortgage-content p {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .table-wrapper {
            overflow-x: auto;
            margin-bottom: 20px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        
        .data-table th {
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            background: #f0f0f0;
            border: 1px solid #000;
        }
        
        .data-table td {
            padding: 10px 8px;
            border: 1px solid #000;
        }
        
        .data-table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        @media print {
            @page {
                margin: 1cm;
            }
            
            body {
                padding: 0;
            }
            
            .certificate {
                border: none;
                padding: 0;
            }
        }
        
        .print-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-header">
            <div class="logo-section">
                <div class="logo-placeholder">
                    <img src="${logoBase64}" alt="RMA Logo" class="logo-img">
                </div>
            </div>
            <div class="title-section">
                <img src="${titleBase64}" alt="Royal Monetary Authority of Bhutan" class="title-image">
            </div>
        </div>

        <h3 class="report-title">Certified Search Report</h3>

        <!-- Report Information -->
        <div class="report-info">
            <div class="info-row">
                <span class="label">Report Number:</span>
                <span class="value">${this.certificateData.reportNumber}</span>
            </div>
            <div class="info-row">
                <span class="label">Report Type:</span>
                <span class="value">${this.certificateData.reportType === 'HIT_SEARCH' ? 'Hit Report' : this.certificateData.reportType}</span>
            </div>
            <div class="info-row">
                <span class="label">Type of Search:</span>
                <span class="value">${this.getSearchTypeDisplay(this.certificateData.typeOfSearch)}</span>
            </div>
            <div class="info-row">
                <span class="label">Purpose:</span>
                <span class="value">${this.certificateData.purpose}</span>
            </div>
            <div class="info-row">
                <span class="label">Search Criteria:</span>
                <span class="value">${this.certificateData.searchedByCid || this.certificateData.vehicleOrPlotNo || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Requested By:</span>
                <span class="value">${this.certificateData.requestedBy}</span>
            </div>
            <div class="info-row">
                <span class="label">Date and Time of Search:</span>
                <span class="value">${this.formatDateTime(this.certificateData.dateTime)}</span>
            </div>
            <div class="info-row">
                <span class="label">Collateral Type:</span>
                <span class="value">${this.certificateData.collateralType || 'N/A'}</span>
            </div>
        </div>

        <!-- Search Result Section -->
        <div class="search-result-section">
            ${clone.querySelector('.search-result-section')?.innerHTML || ''}
        </div>
    </div>
    
    <div class="print-footer">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Report Number: ${this.reportNumber}</p>
        <p>Royal Monetary Authority of Bhutan - Central Registry</p>
    </div>
</body>
</html>`;

      // Create and trigger download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RMA_Certificate_${this.reportNumber}_${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try the print option instead.');
    }
  }

  // Print function - Only prints the certificate content
  printCertificate(): void {
    // Create a print-friendly version
    const printContent = document.getElementById('certificate-content');
    
    if (!printContent) {
      window.print(); // Fallback to normal print
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // If popup is blocked, use the print styles that hide other elements
      window.print();
      return;
    }

    // Clone the certificate content
    const clone = printContent.cloneNode(true) as HTMLElement;
    
    // Remove action buttons
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
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background: white;
            color: #000;
        }
        
        .certificate {
            border: 2px solid #000;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .certificate-header {
            display: flex;
            gap: 20px;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .logo-img {
            width: 80px;
            height: 80px;
        }
        
        .title-image {
            max-width: 100%;
            height: auto;
            max-height: 80px;
        }
        
        .report-title {
            text-align: center;
            margin: 20px 0;
            font-size: 22px;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
        }
        
        .mortgage-content {
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #000;
            border-radius: 4px;
            background: #f5f5f5;
        }
        
        .mortgage-content p {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        
        .data-table th {
            padding: 8px;
            text-align: left;
            font-weight: 600;
            background: #f0f0f0;
            border: 1px solid #000;
        }
        
        .data-table td {
            padding: 8px;
            border: 1px solid #000;
        }
        
        .data-table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .print-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            @page {
                margin: 1cm;
            }
            
            body {
                margin: 0;
            }
            
            .certificate {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    ${clone.outerHTML}
    <div class="print-footer">
        Printed on: ${new Date().toLocaleString()} | Report Number: ${this.reportNumber}
    </div>
</body>
</html>`);

    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after printing
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }
}