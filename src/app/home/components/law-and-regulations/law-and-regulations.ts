import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../service/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-law-and-regulations',
  imports: [],
  templateUrl: './law-and-regulations.html',
  styleUrl: './law-and-regulations.scss'
})
export class LawAndRegulations {
  title:string='';
  description:any;
image:any;
LawsTitle: string='';;


   constructor(
    private router: Router, 
    private api:Api) {}

     ngOnInit(){
  this.getLaws();
 }

//  getLaws(){
//     this.api.getLaws().subscribe((response:any) => {
//       this.LawsTitle = response.data[0].aboutPagesHeaderName
//       this.title = response.data[0].title
//       this.description = response.data[0].description
//       this.image = response.data[0].image
//       console.log(response);
//     },(error)=>{
//       console.log(error);
//     })
//   }

   getLaws() {
  this.api.getLaws().subscribe((response: any) => {
    if (response.data && response.data.length > 0) {
      const header = response.data[0];

      // Text fields
      this.LawsTitle = header.aboutPagesHeaderName;
      this.title = header.title;
      this.description = header.description;

      // Use sectionId to get image from download endpoint
      const sectionId = header.sectionId;
      this.api.getLawsImage(sectionId).subscribe({
        next: (res: Blob) => {
          // Convert blob to URL for <img>
          this.image = URL.createObjectURL(res);
        },
        error: (err) => {
          console.error('Error fetching image:', err);
        }
      });
    }
    console.log(response);
  }, (error) => {
    console.log(error);
  });
}
}
