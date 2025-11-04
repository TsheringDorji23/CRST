import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsDetails } from './news-details';

describe('NewsDetails', () => {
  let component: NewsDetails;
  let fixture: ComponentFixture<NewsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
