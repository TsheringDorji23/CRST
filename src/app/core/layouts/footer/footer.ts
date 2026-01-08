import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  footerTitle:string='';
  aboutUsContent: string='';
  title:string='';
  description:any;
footer: any[] = [];
currentYear = new Date().getFullYear();
showSection(arg0: string) {
throw new Error('Method not implemented.');
}
constructor(private router: Router, private api:Api) {}

ngOnInit(){
  this.getFooter();
  // this.loadAboutCrstImage();
 }

getFooter() {
  this.api.getFooter().subscribe((response: any) => {
    if (response.data && response.data.length > 0) {

      // Set section header info
      const header = response.data[0];
      this.footerTitle = header.aboutPagesHeaderName;
      this.title = header.title;

      // Map all services
      this.footer = response.data.map((item: any) => {
        const footerItem: any = {
          description: item.description,
          sectionId: item.sectionId,
     
        };

        // Fetch image for this service (replace getbenefitsImage with proper service API)
        this.api.getServiceImage(item.sectionId).subscribe({
          next: (res: Blob) => {
            footerItem.image = URL.createObjectURL(res);
          },
          error: (err) => console.error('Error fetching service image:', err)
        });

        return footerItem;
      });

    }
    console.log(response);
  }, (error) => console.log(error));
}
}
