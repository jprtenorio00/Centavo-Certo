import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';

interface UserData {
  name: string;
  plan: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  private loginStatusSub: Subscription;
  private userSub: Subscription;
  userName = '';
  userPlan = '';
  userData: UserData = { name: '', plan: '' };

  constructor(private loginService: LoginService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.loginStatusSub = this.authService.isUserLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.userSub = this.authService.getUserLoggedIn().subscribe(
          data => {
            this.userData = data;
            this.userName = data.name;
            this.userPlan = data.plan;
          }
        );
      }
    });
  }

  ngOnDestroy() {
    this.loginStatusSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  scrollToTop() {
    window?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLogout() {
    this.loginService.logout();
    this.router.navigate(['/']);
  }

}
