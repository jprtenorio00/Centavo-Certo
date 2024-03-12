import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { MatRadioModule } from '@angular/material/radio';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [				
    AppComponent,
   ],
  imports: [
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'my-icon-email',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icon-email.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'my-icon-lock',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icon-lock.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'my-icon-phone',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icon-phone.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'my-icon-user-box',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icon-user-box.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'my-icon-people',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icon-people.svg')
    );
  }
 }
