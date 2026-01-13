import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

// Import PDF libraries
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  generatingPDF = false;

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

  // Convert image to base64
  async imageToBase64(imageUrl: string): Promise<string> {
    try {
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
      if (imageUrl.includes('rma-logo-white')) {
        return this.logoBase64;
      } else if (imageUrl.includes('Rmalogotext')) {
        return this.titleBase64;
      }
      return '';
    }
  }

  // Download Certificate as PDF
  async downloadCertificate(): Promise<void> {
    try {
      this.generatingPDF = true;
      const certificateContent = document.getElementById('certificate-content');
      
      if (!certificateContent) {
        alert('Certificate content not found');
        this.generatingPDF = false;
        return;
      }

      // Create a clone of the content for PDF generation
      const clone = certificateContent.cloneNode(true) as HTMLElement;
      
      // Remove action buttons from the clone
      const actionsDiv = clone.querySelector('.actions');
      if (actionsDiv) {
        actionsDiv.remove();
      }

      // Apply PDF-specific styles to clone
      clone.style.width = '1000px';
      clone.style.padding = '40px';
      clone.style.background = 'white';
      clone.style.boxSizing = 'border-box';
      
      // Ensure images are properly loaded
      const logoImg = clone.querySelector('#rma-logo') as HTMLImageElement;
      const titleImg = clone.querySelector('#rma-title') as HTMLImageElement;
      
      // Convert images to base64 to ensure they load in canvas
      if (logoImg && logoImg.src) {
        try {
          const logoBase64 = await this.imageToBase64(logoImg.src);
          logoImg.src = logoBase64;
        } catch (e) {
          console.log('Using fallback logo');
          logoImg.src = this.logoBase64;
        }
      }
      
      if (titleImg && titleImg.src) {
        try {
          const titleBase64 = await this.imageToBase64(titleImg.src);
          titleImg.src = titleBase64;
        } catch (e) {
          console.log('Using fallback title image');
          titleImg.src = this.titleBase64;
        }
      }

      // Create temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '1000px';
      tempContainer.style.background = 'white';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Configure PDF options based on device (mobile or desktop)
      const isMobile = window.innerWidth <= 768;
      const scale = isMobile ? 1.5 : 2; // Higher scale for mobile for better readability

      // Generate canvas from HTML content
      const canvas = await html2canvas(clone, {
        scale: scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Ensure all images in cloned document are loaded
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (img.complete) return;
            img.onload = () => console.log('Image loaded in clone');
            img.onerror = () => {
              console.log('Image failed to load, using fallback');
              if (img.id === 'rma-logo') {
                img.src = this.logoBase64;
              } else if (img.id === 'rma-title') {
                img.src = this.titleBase64;
              }
            };
          });
        }
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Calculate PDF dimensions
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth - 20; // Leave margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add certificate content
      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');

      let heightLeft = imgHeight;
      let position = 0;

      // Handle multi-page content
      if (heightLeft > pdfHeight - 20) {
        position = heightLeft - (pdfHeight - 20);
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 10, -position + 10, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      // Add page numbers and footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        
        // Add RMA footer at the bottom of each page
        const footerY = pdfHeight - 15;
        
        // First line
        pdf.text(
          'POST BOX :154, CHHOPHEL LAM, KAWAJANOSA, THIMPHU BHUTAN',
          pdfWidth / 2,
          footerY - 6,
          { align: 'center' }
        );
        
        // Second line
        pdf.text(
          'TEL# :( +975-2-323110, 323111, 323112, 321699) FAX :( +975-2-322847)',
          pdfWidth / 2,
          footerY,
          { align: 'center' }
        );
        
        // Third line
        pdf.text(
          'SWIFT: RMABBTBT',
          pdfWidth / 2,
          footerY + 6,
          { align: 'center' }
        );
        
        // Page number at bottom
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: 'center' }
        );
        
        // Report info on first page
        if (i === 1) {
          pdf.text(
            `Report No: ${this.reportNumber} | Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            pdfWidth / 2,
            5,
            { align: 'center' }
          );
        }
      }

      // Set PDF metadata
      pdf.setProperties({
        title: `RMA Certificate - ${this.reportNumber}`,
        subject: 'Certified Search Report',
        author: 'Royal Monetary Authority of Bhutan',
        keywords: 'certificate, search, report, RMA'
      });

      // Download PDF
      pdf.save(`RMA_Certificate_${this.reportNumber}.pdf`);
      
      console.log('PDF downloaded successfully');
      this.generatingPDF = false;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try the print option instead.');
      this.generatingPDF = false;
    }
  }
  // Print Certificate
  printCertificate(): void {
    const printContent = document.getElementById('certificate-content');
    
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
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