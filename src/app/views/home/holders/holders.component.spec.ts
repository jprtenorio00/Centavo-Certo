/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HoldersComponent } from './holders.component';

describe('HoldersComponent', () => {
  let component: HoldersComponent;
  let fixture: ComponentFixture<HoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
