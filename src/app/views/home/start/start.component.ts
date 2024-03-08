import { Subscription } from 'rxjs';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, AfterViewInit{

  private subscription: Subscription = new Subscription();
  private fragment: string = '';
  isLoggedIn: boolean = false;
  userPlan: string = '';
  userData: any;

  constructor(private loginService: LoginService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private viewportScroller: ViewportScroller) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.fragment = fragment;
        setTimeout(() => {
          const element = document.getElementById(this.fragment);
          if (element) {
            // O elemento agora deve estar disponível
            this.viewportScroller.scrollToAnchor(this.fragment);
            // Outras ações com o elemento
          }
        }, 100); // Ajuste o tempo conforme necessário
      }
    });    
    setTimeout(() => {
      this.observableStatusLogin();
    }, 300);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const element = document.getElementById(this.fragment);
      if (element) {
        this.viewportScroller.scrollToAnchor(this.fragment);
      }
    }, 0);
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

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    console.log("Chamous")
    // Verifique se a rolagem até a âncora foi concluída
    const element = document.getElementById(this.fragment);
    
    if (typeof window !== 'undefined') {
      const yOffset = window.pageYOffset;
      if (element || yOffset >= element!.offsetTop) {
        // Atualize a URL sem o fragmento da âncora
        this.router.navigate(['/'], { replaceUrl: true });
      }
    }
  }

}
