import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../app.constants';
import { API_URL2 } from '../app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  constructor(private http:HttpClient){}

  private readonly baseUrl = (window as any)['API_BASE_URL'] || 'http://localhost:8080';

  getHeader(){
   return this.http.get(`${this.baseUrl}/section/about`);
  }
//   getMission(){
//    return this.http.get('http://localhost:8080/section/about');
//   }
    getContent(){
   return this.http.get(`${this.baseUrl}/section/works`);
  }
  submitPayment(paymentRequest: any) {
    return this.http.post(`${API_URL}/payment`, paymentRequest, { responseType: 'text' });
  }

   getServices(){
   return this.http.get(`${this.baseUrl}/section/services`);
  }

  getBenefits(){
   return this.http.get(`${this.baseUrl}/section/benifits`);
  }
getLaws(){
   return this.http.get(`${this.baseUrl}/section/laws`);
  }
getFooter(){
   return this.http.get('http://localhost:8080/section/footer');
  }

  getheaders(){
   return this.http.get('http://localhost:8080/section/headerfooter');
  }
getImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}

getNews(){
   return this.http.get(`${this.baseUrl}/section/news`);
  }

  getFaq(){
   return this.http.get(`${this.baseUrl}/section/fqas`);
  }

  getPartner(){
   return this.http.get(`${this.baseUrl}/section/parttner`);
  }
  getPartnerImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}

  getWorksImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}
getFaqImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}
  getNewsImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}
  
  getMasterData(payload: any){
    return this.http.post(`${API_URL}/master/getMasterData`, payload);
  }
  
  getDzongkhag(){
    return this.http.get(`${API_URL}/api/dzongkhags`);
  }

  getGewog(dzongkhagSerialNo: string){
    return this.http.get(`${API_URL}/api/gewogs/by-dzongkhag/${dzongkhagSerialNo}`);
  }

  getpurpose(){
    return this.http.get(`${API_URL}/master/getActiveSearchPurpose`);
  }

  // getPublicSearch(payload:any){
  //   return this.http.post(`${API_URL2}/api/search/public`, payload);
  // }

  getPublicSearch(payload: any) {
    return this.http.post(`${API_URL2}/api/search/public`, payload);
  }

getbenefitsImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}
getServiceImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}

getLawsImage(sectionId: string) {
  return this.http.get(`${this.baseUrl}/section/${sectionId}/download`, {
    responseType: 'blob' // important to get the image as a Blob
  });
}

  getPublicSearchCertificate(reportNumber: string): Observable<any> {
    return this.http.get(`${API_URL2}/api/search/publicSearchCertificate/${reportNumber}`);
  }

}