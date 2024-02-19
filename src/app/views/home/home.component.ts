import { Component, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isLoggedIn: boolean = false;
  
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.observableStatusLogin();
  }

  observableStatusLogin(){
    this.authService.formGroup.get('isLoggedIn')?.valueChanges.subscribe( value => {
      this.isLoggedIn = value
      if(value)
      {
        this.hideFooter();
        // this.router.navigate(['/dashboard']);
      }
      else
      {
        this.showFooter();
      }
    })
  }

  hideFooter() {
    const element = document.querySelector('.footer') as HTMLElement;
    if (element) {
      element.style.display = 'none';
    }
  }
  
  showFooter() {
    const element = document.querySelector('.footer') as HTMLElement;
    if (element) {
      element.style.display = 'block';
    }
  }

}
