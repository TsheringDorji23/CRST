import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCertificate } from './report-certificate';

describe('ReportCertificate', () => {
  let component: ReportCertificate;
  let fixture: ComponentFixture<ReportCertificate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCertificate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCertificate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
