import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignedPage } from './signed.page';

describe('SignedPage', () => {
  let component: SignedPage;
  let fixture: ComponentFixture<SignedPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SignedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
