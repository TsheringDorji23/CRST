import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawAndRegulations } from './law-and-regulations';

describe('LawAndRegulations', () => {
  let component: LawAndRegulations;
  let fixture: ComponentFixture<LawAndRegulations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawAndRegulations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawAndRegulations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
