import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutCrstDetails } from './about-crst-details';

describe('AboutCrstDetails', () => {
  let component: AboutCrstDetails;
  let fixture: ComponentFixture<AboutCrstDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutCrstDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutCrstDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
