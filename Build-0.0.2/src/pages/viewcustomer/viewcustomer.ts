import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SocketProvider } from '../../providers/socket/socket';

@IonicPage()
@Component({
  selector: 'page-viewcustomer',
  templateUrl: 'viewcustomer.html',
})
export class ViewCustomerPage {

	public customers: any;
	public openCustomer: any;
	public openCustomerGroup: String;
	public dateFrom: any;
	public dateTo: any;
	public today: any;

	public totals:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private socket: SocketProvider) {
		this.openCustomerGroup = '';
		this.openCustomer = {id:-1};
		let d = new Date();
		this.today = d.toISOString();
		this.dateFrom = d.toISOString();
		this.dateTo = d.toISOString();

    	this.socket.emit('get-customers', {});
		this.socket.on('get-customers', data => {
			this.customers = data['orderedCustomers'];
			this.openCustomer = {id:-1};
		});  
		this.socket.on('view-customer', data => {
			console.log('viewcustomer');
			this.totals = data;
		});  
	}

	viewCustomer(customer) {
		this.openCustomer = customer;
		this.getData();
	}

	formatPrice(price) {
		let p = price/1000;
		let pStr = p.toLocaleString('nl-NL', {
  			style: 'currency',
  			currency: 'EUR'
		});		
		return pStr;
	}

	getData() {
		let timestampFrom = this.getDate(this.dateFrom);
		let timestampTo = this.getDate(this.dateTo);
		console.log(timestampFrom, timestampTo);
		if(this.openCustomer.id > -1) {
			this.socket.emit('view-customer', {customer_id:this.openCustomer.id, from:timestampFrom, to:timestampTo});
		}
	}

	toggleCustomerGroup(letter) {
		if(this.openCustomerGroup === letter) {
			this.openCustomerGroup = '';
		} else {
			this.openCustomerGroup = letter;
		}
		this.openCustomer = {id:-1}
	}

	getClasses(customer) {
		let classes = '';
		if(customer.letter === this.openCustomerGroup) {
			classes += 'accordion-open';
		} else {
			classes += 'accordion-closed';
		}
		if(customer.id === this.openCustomer.id) {
			// classes += ' selected';
		}
		return classes;
	}

	ionViewWillLeave() {
		//this.socket.removeListener('get-customers');
		//this.socket.removeListener('view-customer');
	}  

	getDate(date){
		let timeStamp = Date.parse(date);
		timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
		timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
		return timeStamp;
	}  

	getDateString(timestamp) {
		let date = new Date(timestamp);
		return date.getDate() +"/"+ (date.getMonth()+1) +"/"+ date.getFullYear();
	}
}