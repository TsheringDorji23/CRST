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
  isImmovableReport: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private sanitizer: DomSanitizer
  ) { }

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

        // Determine if report is immovable or movable
        // Immovable: Land, Strata, Land with Structure
        const immovableTypes = ['Land', 'Strata', 'Land with Structure'];
        this.isImmovableReport = immovableTypes.includes(response.collateralType);
        console.log('Is immovable report:', this.isImmovableReport);
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
    switch (type) {
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
        alert('Certificate not found!');
        this.generatingPDF = false;
        return;
      }
      const clone = certificateContent.cloneNode(true) as HTMLElement;

      // remove UI buttons
      clone.querySelector('.actions')?.remove();

      // hide disclaimer in HTML
      clone.querySelector('.disclaimer-section')?.remove();

      // force header to top
      const header = clone.querySelector('.certificate-header') as HTMLElement;
      if (header) {
        header.style.marginTop = '0';
        header.style.paddingTop = '0';
        header.style.display = 'flex';
        header.style.alignItems = 'flex-start';
      }

      clone.style.width = '900px';
      clone.style.padding = '10px'; // small padding
      clone.style.background = '#ffffff';
      clone.style.boxSizing = 'border-box';
      clone.style.marginTop = '0';

      // convert images to base64
      const logoImg = clone.querySelector('#rma-logo') as HTMLImageElement;
      if (logoImg?.src) logoImg.src = await this.imageToBase64(logoImg.src);
      const titleImg = clone.querySelector('#rma-title') as HTMLImageElement;
      if (titleImg?.src) titleImg.src = await this.imageToBase64(titleImg.src);

      /* ============================
         RENDER OFFSCREEN
      ============================ */
      const temp = document.createElement('div');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      temp.appendChild(clone);
      document.body.appendChild(temp);

      await new Promise(r => setTimeout(r, 500));

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(temp);

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const footerHeight = 22;
      const disclaimerHeight = 22;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const usableHeight = pageHeight - margin * 2;

      let position = 0;
      let heightLeft = imgHeight;

      const imgData = canvas.toDataURL('image/png');

      let pageNo = 1;
      const totalPages = Math.ceil(imgHeight / usableHeight);

      while (heightLeft > 0) {
        if (pageNo > 1) pdf.addPage();

        const drawHeight = heightLeft > usableHeight ? usableHeight : heightLeft;

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          imgWidth,
          (canvas.height * imgWidth) / canvas.width * (drawHeight / imgHeight),
          undefined,
          'FAST'
        );
        const sealBase64 = await this.imageToBase64('/rma-website/assets/image/seal.jpeg');

        // Draw footer + disclaimer only on last page
        if (pageNo === totalPages) {
          const footerY = pageHeight - 10; // bottom margin
          this.drawDisclaimer(pdf, pageWidth, pageHeight - footerHeight - 4, sealBase64);
          this.drawFooter(pdf, pageWidth, pageHeight);
        }

        heightLeft -= usableHeight;
        pageNo++;
      }

      pdf.save(`RMA_Certificate_${this.reportNumber}.pdf`);
      this.generatingPDF = false;

    } catch (error) {
      console.error('PDF generation error:', error);
      this.generatingPDF = false;
      alert('Failed to generate PDF.');
    }
  }

  private drawFooter(pdf: jsPDF, pageWidth: number, pageHeight: number) {
    const y = pageHeight - 10;

    pdf.setFontSize(9);
    pdf.setTextColor(80);

    pdf.line(10, y - 12, pageWidth - 10, y - 12);

    pdf.text(
      'POST BOX: 154, CHHOPHEL LAM, KAWAJANGSA, THIMPHU BHUTAN',
      pageWidth / 2,
      y - 6,
      { align: 'center' }
    );

    pdf.text(
      'TEL: (+975-2-330795, 323111, 323112, 321699)  FAX: (+975-2-322847)',
      pageWidth / 2,
      y - 2,
      { align: 'center' }
    );

    pdf.text(
      'SWIFT: RMABBTBT',
      pageWidth / 2,
      y + 2,
      { align: 'center' }
    );
  }

  private drawDisclaimer(
    pdf: jsPDF,
    pageWidth: number,
    y: number,
    sealBase64: string
  ) {
    const margin = 10;
    const sealWidth = 35; // slightly bigger
    const sealHeight = 33; // slightly bigger

    // draw seal on RIGHT side
    const sealX = pageWidth - margin - sealWidth;
    pdf.addImage(sealBase64, 'JPEG', sealX, y - sealHeight, sealWidth, sealHeight);

    const textX = margin;

    pdf.setFontSize(10);
    pdf.setTextColor(0);
    pdf.text('Disclaimer:', textX, y - 10);

    pdf.setFontSize(9);
    pdf.text(
      '1. This report shall be used once only for the purpose specified above.',
      textX,
      y - 5
    );
    pdf.text(
      '2. This report is only valid for two weeks from date of issue.',
      textX,
      y
    );
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