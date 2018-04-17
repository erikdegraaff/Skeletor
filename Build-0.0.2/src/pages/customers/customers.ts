import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SocketProvider } from '../../providers/socket/socket';

@IonicPage()
@Component({
  selector: 'page-customers',
  templateUrl: 'customers.html',
})
export class CustomersPage {

	public customers: any;
	public layouts: any;
	public openCustomer: any;
	public openCustomerGroup: String;
	private copy: any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private socket: SocketProvider) {
	    this.openCustomer = {id:-1};
	    this.openCustomerGroup = '';
	    this.socket.emit('get-customers', {});
		this.socket.on('get-customers', data => {
 			this.customers = data['orderedCustomers'];
	 		this.layouts = data['layouts'];
		    this.openCustomer = {id:-1, layout_id:0};
		});  
	}
	
	
	ionViewWillLeave() {
    	//this.socket.removeListener('get-customers');
	}

	editCustomer(customer) {
		this.copy = Object.assign({}, customer);
		this.openCustomer = customer;
	}

	saveCustomer(customer) {
		this.socket.emit('save-customer', customer);
		this.resetOpenCustomer();
	}

	addCustomer() {
		this.openCustomer = {id : 0, name: '', layout_id: 0, menu_order: this.customers.length};
	}

	removeCustomer(customer) {
		if(customer.id > 0) {
	  		this.socket.emit('remove-customer', customer);
		}
	}

	toggleCustomerGroup(letter) {
		if(this.openCustomerGroup === letter) {
			this.openCustomerGroup = '';
		} else {
		this.openCustomerGroup = letter;
		}
	}

	resetOpenCustomer() {
		if(this.openCustomer.id > 0) {
			let index = this.getIndexById(this.openCustomer.id, this.customers);
			this.customers[index[0]].customers[index[1]] = this.copy;
		}
		this.openCustomer = {id : -1};    
	}

	checkValues(customer) {
		if(customer.name != '' && customer.layout_id > 0) {
			return false;
		} else {
	  		return true;
		}
	}

	getIndexById(id, arr) {
		for(var i = 0; i < arr.length; i ++) {
			for(var j = 0; j < arr[i].customers.length; j ++) {
				if(arr[i].customers[j].id === id) {
					return [i, j];
				}
			}
		}
	}
}
