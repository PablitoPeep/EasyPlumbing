import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProvidePage } from './provide.page';

describe('ProvidePage', () => {
  let component: ProvidePage;
  let fixture: ComponentFixture<ProvidePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
