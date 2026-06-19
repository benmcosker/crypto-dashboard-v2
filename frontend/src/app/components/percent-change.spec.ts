import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PercentChange } from './percent-change';

describe('PercentChange', () => {
  let fixture: ComponentFixture<PercentChange>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PercentChange] });
    fixture = TestBed.createComponent(PercentChange);
  });

  it('renders a formatted gain', () => {
    fixture.componentRef.setInput('value', 4.2);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('+4.20%');
  });

  it('renders a formatted loss', () => {
    fixture.componentRef.setInput('value', -1.5);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('-1.50%');
  });

  it('renders an em dash when the value is missing', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('—');
  });
});
