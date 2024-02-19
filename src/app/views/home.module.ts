import { PlansComponent } from './home/plans/plans.component';
import { HoldersComponent } from './home/holders/holders.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoginComponent } from './home/login/login.component';
import { AccountComponent } from 'src/app/views/home/account/account.component';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from 'src/app/views/home/about-us/about-us.component';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './home/register/register.component';
import { FinancialAnalysisComponent } from './home/financial-analysis/financial-analysis.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { StartComponent } from './home/start/start.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { MatSelectModule } from '@angular/material/select';
import { PhoneMaskDirective } from '../shared/phone-mask-directive/phone-mask-directive.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { CardsComponent } from './home/cards/cards.component';
import { CategoriesComponent } from './home/categories/categories.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { PlanInformationComponent } from '../shared/plan-information/plan-information.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ManageComponent } from './home/manage/manage.component';
import { FormsModule } from '@angular/forms';
import { CustomDateAdapter } from '../shared/custom-date/custom-date.component';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const routes: Routes = [
  { path: '', component: HomeComponent,
    children: [
      { path: '', component: StartComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'financial-analysis', component: FinancialAnalysisComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'plans', component: PlansComponent },
      { path: 'account', component: AccountComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'cards', component: CardsComponent },
      { path: 'holders', component: HoldersComponent },
      { path: 'manage', component: ManageComponent },
    ]
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    NgxChartsModule,
    MatSelectModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule.forChild(routes),
    NgxMaskDirective,
    NgxMaskPipe,
    FormsModule
  ],
  declarations: [
    HomeComponent,
    AccountComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    FinancialAnalysisComponent,
    AboutUsComponent,
    StartComponent,
    SidebarComponent,
    DashboardComponent,
    CardsComponent,
    CategoriesComponent,
    DashboardComponent,
    HoldersComponent,
    PlansComponent,
    StartComponent,
    PhoneMaskDirective,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    PlanInformationComponent,
    ManageComponent
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
})
export class HomeModule { }
