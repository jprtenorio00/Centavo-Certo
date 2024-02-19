import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-plan-information',
  templateUrl: './plan-information.component.html',
  styleUrls: ['./plan-information.component.scss']
})
export class PlanInformationComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  isLoggedIn: boolean = false;
  userPlan: string = '';
  userData: any;

  constructor(private loginService: LoginService, private authService: AuthService,) { }

  ngOnInit() {
    setTimeout(() => {
      this.observableStatusLogin();
    }, 300);
  }

  observableStatusLogin(){
    this.subscription = this.authService.isUserLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      this.authService.formGroup.get('isLoggedIn')?.patchValue(isLoggedIn)
      isLoggedIn ? this.fetchUserLoggedIn() : ''
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async fetchUserLoggedIn(){
    this.userData = await this.authService.getUserLoggedIn();
    if(this.userData)
    {
      this.userPlan = this.userData?.plan
    }
  }

  scrollToTop(){
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}
