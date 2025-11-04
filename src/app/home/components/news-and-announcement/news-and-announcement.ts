import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../../service/api';

interface NewsItem {
  title: string;
  description: string;
  sectionId: string;
  image?: string | null; // optional because image will be loaded later
}

@Component({
  selector: 'app-news-and-announcement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-and-announcement.html',
  styleUrls: ['./news-and-announcement.scss']
})
export class NewsAndAnnouncement {

  newsTitle='';
  title:string='';
    description:any;
  image:any;
  aboutCrstImageUrl: string | null = null;

  constructor(private router: Router, private api:Api) {}
  news: any[] = [];
  // newsList = [
  //   {
  //     image: 'assets/news/rma-building.jpg',
  //     title: 'Lorem Ipsum is simply dummy text',
  //     date: 'April 14, 2025',
  //     description: `Lorem ipsum is simply dummy text of the printing and typesetting industry. 
  //     Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer 
  //     took a galley of type and scrambled it to make a type specimen book.`,
  //     expanded: false
  //   },
  //   {
  //     image: 'assets/news/RRMMAA.jpeg',
  //     title: 'Another Example Headline',
  //     date: 'April 14, 2025',
  //     description: `This is another example of a news article that contains more text than what is shown by default. 
  //     The learn more button allows readers to expand the card and view the complete information about the news item.`,
  //     expanded: false
  //   },
  //   {
  //     image: 'assets/news/n1.png',
  //     title: 'Bhutan’s Financial Update 2025',
  //     date: 'April 18, 2025',
  //     description: `The Royal Monetary Authority recently announced new digital initiatives aimed at improving 
  //     transparency and efficiency within the banking ecosystem.`,
  //     expanded: false
  //   },
  //   {
  //     image: 'assets/news/n2.png',
  //     title: 'Policy Implementation Update',
  //     date: 'May 02, 2025',
  //     description: `Government agencies have started implementing new financial policies designed to promote 
  //     sustainability and transparency in the private sector.`,
  //     expanded: false
  //   },
  //   {
  //     image: 'assets/news/n3.png',
  //     title: 'Annual Economic Report Released',
  //     date: 'May 10, 2025',
  //     description: `The Annual Economic Report highlights Bhutan’s strong fiscal performance and growing 
  //     investments in the digital sector.`,
  //     expanded: false
  //   },
  //   {
  //     image: 'assets/news/n4.png',
  //     title: 'Central Bank Launches Awareness Program',
  //     date: 'June 01, 2025',
  //     description: `A national financial awareness campaign was launched to promote responsible financial 
  //     behavior and empower individuals with better decision-making skills.`,
  //     expanded: false
  //   }
  // ];

  getShortDescription(text: string): string {
    const words = text.split(' ');
    return words.length > 15 ? words.slice(0, 15).join(' ') : text;
  }

  toggleReadMore(index: number) {
    this.newsList[index].expanded = !this.newsList[index].expanded;
  }

  readMore() {
    this.router.navigate(['/news-details']);
  }

  ngOnInit(){
    this.getNews();
 
  }
 newsList: any[] = []; 
 getNews() {
 this.api.getNews().subscribe((response: any) => {
     if (response.data && response.data.length > 0) {
 
       // Set section header info
       const header = response.data[0];
       this.newsTitle = header.aboutPagesHeaderName;
 
       // Map all services
       this.newsList = response.data.map((item: any) => {
         const newsList: any = {
           title: item.title,
           description: item.description,
           sectionId: item.sectionId,
           image: null
         };
 
         // Fetch image for this service (replace getbenefitsImage with proper service API)
         this.api.getNewsImage(item.sectionId).subscribe({
           next: (res: Blob) => {
             newsList.image = URL.createObjectURL(res);
           },
           error: (err) => console.error('Error fetching service image:', err)
         });
 
         return newsList;
       });
 
     }
     console.log(response);
   }, (error) => console.log(error));
 }
}
