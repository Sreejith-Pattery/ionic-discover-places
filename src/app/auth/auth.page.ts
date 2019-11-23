import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl:LoadingController
  ) { }

  ngOnInit() {

  }

  onLogin() {
    this.authService.login();
    this.isLoading = true;
    this.loadingCtrl.create({ keyboardClose:true, message:'Loggin in ..' })
    .then(loadingEl=>{
      loadingEl.present();
      setTimeout(() => {
        this.router.navigateByUrl('/places/tabs/discover');
        loadingEl.dismiss();
      }, 1500);
    });
  }

  OnSubmit(form:NgForm) {
    console.log(form);
    this.onLogin();
  }

  OnSwitchAuthMode(){
    this.isLogin = !this.isLogin;
  }
}
