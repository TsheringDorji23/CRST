import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSearch } from './public-search';

describe('PublicSearch', () => {
  let component: PublicSearch;
  let fixture: ComponentFixture<PublicSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
