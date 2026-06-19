import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PeriodFilter } from './period-filter';
import { Period } from '../models';

describe('PeriodFilter', () => {
  it('renders all four periods', () => {
    TestBed.configureTestingModule({ imports: [PeriodFilter], providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(PeriodFilter);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    for (const label of ['Today', 'Last week', 'Last month', 'Last quarter']) {
      expect(text).toContain(label);
    }
  });

  it('emits the selected period on click', () => {
    TestBed.configureTestingModule({ imports: [PeriodFilter], providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(PeriodFilter);
    const emitted: Period[] = [];
    fixture.componentInstance.periodChange.subscribe((p) => emitted.push(p));
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const quarter = buttons.find((b) => b.textContent?.trim() === 'Last quarter');
    quarter!.click();
    fixture.detectChanges();

    expect(emitted).toContain('quarter');
  });
});
