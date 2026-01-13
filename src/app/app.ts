import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, } from '@angular/router';
import { Header } from './core/layouts/header/header';
import { Footer } from './core/layouts/footer/footer';
import { ReportCertificateComponent } from './home/components/report-certificate/report-certificate';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,RouterOutlet, Header, Footer,],
  templateUrl: './app.html',
  

})
export class App{}
