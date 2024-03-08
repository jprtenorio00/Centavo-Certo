import { Component, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { LoadingService } from 'src/app/service/loading.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {

  loading$ = this.loadingService.loading$;
  private subscription: Subscription = new Subscription();
  private fragment: string = '';
  isLoggedIn: boolean = false;
  userPlan: string = '';
  userData: any;

  constructor(public loadingService: LoadingService, private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit() {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.observableStatusLogin();
    }, 400);
    this.renderer.addClass(document.body, 'app-plans');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'app-plans');
  }

  observableStatusLogin(){
    this.subscription = this.authService.isUserLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      this.authService.formGroup.get('isLoggedIn')?.patchValue(isLoggedIn)
      isLoggedIn ? this.fetchUserLoggedIn() : ''
    });
  }

  async fetchUserLoggedIn(){
    this.userData = await this.authService.getUserLoggedIn();
    if(this.userData)
    {
      this.userPlan = this.userData?.plan
    }
  }  

}
