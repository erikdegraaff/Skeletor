import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SocketProvider } from '../../providers/socket/socket';

/**
 * Generated class for the ViewproductPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-viewproduct',
  templateUrl: 'viewproduct.html',
})
export class ViewProductPage {

	public productGroups: any;
	public openProductGroup: Number;	

	public dateFrom: any;
	public dateTo: any;
	public today: any;

	public products:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private socket: SocketProvider) {
		this.products = [];
		this.openProductGroup = 0;

		let d = new Date();
		this.today = d.toISOString();
		this.dateFrom = d.toISOString();
		this.dateTo = d.toISOString();

		this.socket.emit('get-products-by-group', {});
		this.socket.on('get-products-by-group', data => {
			this.productGroups = data;
			console.log('get-products-by-group');
		});  
		
		this.socket.on('view-products', data => {
			this.products = data;
		});  		

		this.socket.on('print-products', data => {
			console.log(data);
  			window.open('file:///Users/erikdegraaff/Skeletor/Server/pdfs/print.pdf', '_blank');
  			//w.focus();
		});  		

	}

	print() {
		this.socket.emit('print-products', this.products);
	}

	selectProduct(product) {
		if(product.selected === 1) {
			product.selected = 0;
		} else {
			product.selected =1;
		}
		this.getData();
	}

	selectProductGroup(productGroup) {
		let selected = 1;
		if(productGroup.selected === 1) {
			selected = 0;
		}
		productGroup.selected = selected;
		for(var i = 0; i < productGroup.products.length; i++) {
			productGroup.products[i].selected = selected;
		}
		this.getData();		
	}

	getData() {
		let timestampFrom = this.getDate(this.dateFrom);
		let timestampTo = this.getDate(this.dateTo);
		console.log(timestampFrom, timestampTo);
		let ids = [];
		for(var i = 0 ; i < this.productGroups.length; i++) {
			for(var j = 0 ; j < this.productGroups[i].products.length; j++) {
				if(this.productGroups[i].products[j].selected === 1) {
					ids.push(this.productGroups[i].products[j].id);
				}
			}	
		}
		console.log(ids);
		this.socket.emit('view-products', {ids:ids, from:timestampFrom, to:timestampTo});
	}


	toggleProductGroup(productGroupId, event) {
		if(event.target.className.indexOf('select-all') === -1 && event.target.className.indexOf('icon') === -1) {			
			if(this.openProductGroup === productGroupId) {
				this.openProductGroup = 0;
			} else {
				this.openProductGroup = productGroupId;
			}
		}		
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
