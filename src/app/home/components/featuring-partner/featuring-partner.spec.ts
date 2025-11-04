import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturingPartner } from './featuring-partner';

describe('FeaturingPartner', () => {
  let component: FeaturingPartner;
  let fixture: ComponentFixture<FeaturingPartner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturingPartner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturingPartner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
