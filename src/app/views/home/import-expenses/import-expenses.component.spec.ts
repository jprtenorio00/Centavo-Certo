import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExpensesComponent } from './import-expenses.component';

describe('ImportExpensesComponent', () => {
  let component: ImportExpensesComponent;
  let fixture: ComponentFixture<ImportExpensesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportExpensesComponent]
    });
    fixture = TestBed.createComponent(ImportExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});