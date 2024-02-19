import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { RegisterService } from 'src/app/service/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  email: string = ''
  password: string = ''
  inputType: string = 'password'

  constructor(private router: Router, private service: RegisterService, private loginService: LoginService) { }

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

  async register(){
    if(this.email && this.password) {
      try {
        const formValue = this.formGroup.value;
        const userData = {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone,
          plan: formValue.plan 
        };

        await this.service.registerUser(formValue.email, formValue.password, userData);
        this.loginService.logout()
        this.router.navigate(['/login']);
      } catch (error: any) {
        console.error("Erro no registro:", error.message);
      }
    }
    else {
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
