import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { SocketProvider } from '../../providers/socket/socket';

@IonicPage()
@Component({
  selector: 'page-productgroups',
  templateUrl: 'productgroups.html',
})
export class ProductgroupsPage {

  public openProductGroup: any;
  public productGroups: any;
  public labels: any;

  private copy: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private dragula: DragulaService, private socket: SocketProvider) {
      	this.openProductGroup = {id:-1};
      	this.productGroups = [];

    	this.labels = [
	    	{color:'#F44336', used:0},
			{color:'#E91E63', used:0},
			{color:'#9C27B0', used:0},
			{color:'#673AB7', used:0},
			{color:'#3F51B5', used:0},
			{color:'#2196F3', used:0},
			{color:'#03A9F4', used:0},
			{color:'#00BCD4', used:0},
			{color:'#009688', used:0},
			{color:'#4CAF50', used:0},
			{color:'#8BC34A', used:0},
			{color:'#CDDC39', used:0},
			{color:'#FFEB3B', used:0},
			{color:'#FFC107', used:0},
			{color:'#FF9800', used:0},
			{color:'#FF5722', used:0}
		];

      	this.socket.emit('get-product-groups', {});
		this.socket.on('get-product-groups', (data) => {
			this.productGroups = data;
    	  	this.openProductGroup = {id:-1};      	
    	  	this.disableColors();
		});

      	this.dragula.setOptions('product-groups-list', {})
	    this.dragula.dropModel.subscribe((val) => {
	    	if(val[0] === 'product-groups-list') {
				console.log('DROP GROUPS', val)
				for(let i = 0; i < this.productGroups.length; i++) {
					this.productGroups[i].menu_order = i;
				}
				let data = {
					list: this.productGroups,
					update: 'getProductGroups'
				}
				this.socket.emit('update-product-groups-order', data);
        	}
      });   
	}
	 
	ionViewWillLeave() {
    	this.dragula.destroy('product-groups-list');
	}

	editProductGroup(productGroup) {
		this.copy = Object.assign({}, productGroup);		
		this.openProductGroup = productGroup;
	}
	saveProductGroup(productGroup) {
		this.socket.emit('save-product-group', productGroup);
	}

	addProductGroup() {
		this.openProductGroup = {id : 0, name: '', color: '', menu_order: this.productGroups.length};
	}

	removeProductGroup(productGroup) {
		if(productGroup.id > 0) {
	  		this.socket.emit('remove-product-group', productGroup);
		}
	}

	resetOpenProductGroup() {
		let index = this.getIndexById(this.openProductGroup.id, this.productGroups);
		if(index) {
			this.productGroups[index] = this.copy;		
		}
		this.openProductGroup = {id : -1};    
		this.disableColors();
	}

	setColor(color) {
		this.openProductGroup.color = color;		
		this.disableColors();
	}

	disableColors() {
		for(var i = 0; i < this.labels.length; i++) {
			this.labels[i].used = this.isColorUsed(this.labels[i].color);
		}
	}

	isColorUsed(color) {
		for(var i = 0; i < this.productGroups.length; i++) {
			if(this.productGroups[i].color === color) {
				return 1;
			}
		}
		return 0;
	}


	checkProductCount(productGroup) {
		if(productGroup.product_count === 0) {
			return false;
		}
		return true;
	}

	checkValues(productGroup) {
		if(productGroup.name != '' && productGroup.color != '') {
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
