import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudesColabPage } from './solicitudes-colab.page';

describe('SolicitudesColabPage', () => {
  let component: SolicitudesColabPage;
  let fixture: ComponentFixture<SolicitudesColabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesColabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
