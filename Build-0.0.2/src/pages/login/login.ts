import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { SocketProvider } from '../../providers/socket/socket';
import { CountPage } from '../../pages/count/count';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public credentials: any;	

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthProvider, private socket:SocketProvider) {
  	this.credentials = {name:'', password:''};
  }

  login() {

  	// CHECK.... to server ...
  	this.auth.setUser(this.credentials);
    this.navCtrl.setRoot(CountPage);

  }

}
