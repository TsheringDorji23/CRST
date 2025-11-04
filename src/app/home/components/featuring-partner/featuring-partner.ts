import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';
interface PartnerItem {
  // title: string;
  // description: string;
  sectionId: string;
  image?: string | null; // optional because image will be loaded later
}

@Component({
  selector: 'app-featuring-partner',
  imports: [CommonModule],
  templateUrl: './featuring-partner.html',
  styleUrl: './featuring-partner.scss'
})
export class FeaturingPartner {
partnerTitle:string='';
image:any;
aboutCrstImageUrl: string | null = null;

 constructor(private router: Router, private api:Api) {}

 ngOnInit(){
  this.getPartner();
  // this.loadAboutCrstImage();
 }
partnerList: any[] = []; 
partner: any[] = [];


getPartner() {
this.api.getPartner().subscribe((response: any) => {
    if (response.data && response.data.length > 0) {

      // Set section header info
      const header = response.data[0];
      this.partnerTitle = header.aboutPagesHeaderName;

      // Map all services
      this.partnerList = response.data.map((item: any) => {
        const PartnerItem: any = {
          sectionId: item.sectionId,
          image: null
        };

        // Fetch image for this service (replace getbenefitsImage with proper service API)
        this.api.getPartnerImage(item.sectionId).subscribe({
          next: (res: Blob) => {
            PartnerItem.image = URL.createObjectURL(res);
          },
          error: (err) => console.error('Error fetching service image:', err)
        });

        return PartnerItem;
      });

    }
    console.log(response);
  }, (error) => console.log(error));
}
}

