import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SocketProvider } from '../../providers/socket/socket';

/**
 * Generated class for the UsersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {

	public users: any;
	public openUser: any;
	private copy: any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private socket: SocketProvider) {
	    this.openUser = {id:-1};
	    this.users = [];
	    this.socket.emit('get-users', {});
		this.socket.on('get-users', data => {
 			this.users = data;
		    this.openUser = {id:-1};
		});  
	}

	editUser(user) {
		this.copy = Object.assign({}, user);
		this.openUser = user;
	}

	saveUser(user) {
		this.socket.emit('save-user', user);
		this.resetOpenUser();
	}

	addUser() {
		this.openUser = {id : 0, name: ''};
	}

	removeUser(user) {
		if(user.id > 0) {
	  		this.socket.emit('remove-user', user);
		}
	}

	resetOpenUser() {
		if(this.openUser.id > 0) {
			let index = this.getIndexById(this.openUser.id, this.users);
			this.users[index] = this.copy;
		}
		this.openUser = {id : -1};    
	}

	checkValues(user) {
		if(user.name != '' && user.email != '' && user.password != '') {
			return false;
		} else {
	  		return true;
		}
	}

	getIndexById(id, arr) {
		for(var i = 0; i < arr.length; i ++) {
			if(arr[i].id === id) {
				return i;
			}
		}
	}
}
