import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  email: string = ''
  password: string = ''
  inputType: string = 'password'

  constructor(private router: Router, private service: LoginService ) { }

  ngOnInit() {
    this.observableEmail();
    this.observablePassword();
  }

  observableEmail(){
    this.formGroup.get('email')?.valueChanges.subscribe(email => {
      if (this.validateEmail(email)) {
        this.email = email;
      }
    });
  }

  observablePassword(){
    this.formGroup.get('password')?.valueChanges.subscribe(password => {
      if (password && password.length >= 6) {
        this.password = password;
      }
    });
  }

  validateEmail(email: string): boolean {
    const re = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(String(email).toLowerCase());
  }

  login() {
    if(this.email && this.password) {
      this.service.login(this.email, this.password)
      .then(res => {
        this.router.navigate(['/dashboard']);
      })
      .catch(error => {
        console.error('Erro ao fazer login:', error);
        alert("Erro ao fazer login: " + error.message);
      });
    } else {
      alert("preencher campos");
    }
  }

  public get formGroup(){
    return this.service.formGroup;
  }

  typePassword(event: Event): void{
    event.preventDefault();
    this.inputType = this.inputType == 'password' ? 'text' : 'password'
  }

}
