import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  userEmail: string = '';
  userName: string = '';
  userPlan: string = '';
  userPhone: string = '';
  userData: any;

  constructor(private loginService: LoginService, private authService: AuthService, private router: Router,) { }

  ngOnInit() {
    setTimeout(() => {
      this.fetchUserLoggedIn()
    }, 600);
  }

  async fetchUserLoggedIn(){
    this.userData = await this.authService.getUserLoggedIn();
    if(this.userData)
    {
      this.userEmail = this.userData?.email;
      this.userName = this.userData?.name;
      this.userPhone = this.userData?.phone;
      this.userPlan = this.userData?.plan;
    }
  }

  onChangePassword() {
  }
  
  onLogout() {
    this.loginService.logout();
    this.router.navigate(['/']);
  }

}
