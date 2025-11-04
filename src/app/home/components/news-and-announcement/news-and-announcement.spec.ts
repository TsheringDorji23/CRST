import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsAndAnnouncement } from './news-and-announcement';

describe('NewsAndAnnouncement', () => {
  let component: NewsAndAnnouncement;
  let fixture: ComponentFixture<NewsAndAnnouncement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAndAnnouncement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsAndAnnouncement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
