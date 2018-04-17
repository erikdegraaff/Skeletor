import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { SocketProvider } from '../../providers/socket/socket';

@IonicPage()
@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage {

  public productGroups: any;
  public openProduct: any;
  public openProductGroup: Number;

  private copy: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private socket: SocketProvider, private dragula: DragulaService ) {
  		this.openProductGroup = 0;
      this.openProduct = {id:-1};
      this.socket.emit('get-products-by-group', {});
    	this.socket.on('get-products-by-group', data => {
     		this.productGroups = data;
        this.openProduct = {id:-1};
        console.log(this.productGroups);
    	});  

    this.dragula.setOptions('products-list', {});
    this.dragula.drag.subscribe((val) => {
      this.openProductGroup = 0;
    });
    this.dragula.dropModel.subscribe((val) => {
        if(val[0] === 'products-list') {          
          console.log('DROP PRODUCTS', val)
          for(let i = 0; i < this.productGroups.length; i++) {
            this.productGroups[i].menu_order = i;
          }
          let data = {
            list: this.productGroups,
            update: 'getProductsByGroup'
          }
          this.socket.emit('update-product-groups-order', data);
        }
    });   

	}
  
  ionViewWillLeave() {
    this.dragula.destroy('products-list');
  }


  toggleProductGroup(productGroupId) {
    if(this.openProductGroup === productGroupId) {
      this.openProductGroup = 0;
    } else {
      this.openProductGroup = productGroupId;
    }
  }

	editProduct(product) {
    this.copy = Object.assign({}, product);  
    product.price_sales = parseFloat(product.price_sales)/1000;
    product.price_purchase = parseFloat(product.price_purchase)/1000;  
		this.openProduct = product;
	}

  saveProduct(product) {
    this.socket.emit('save-product', product);
  }

  addProduct() {
    this.openProduct = {id : 0, name: '', price_purchase: '', price_sales: '', product_group: 0};
  }

  removeProduct(product) {
    if(product.id > 0) {
      this.socket.emit('remove-product', product);
    }
  }

  resetOpenProduct() {
    let index = this.getIndexById(this.openProduct.id);
    if(index) {
      this.productGroups[index[0]].products[index[1]] = this.copy;        
    }
    this.openProduct = {id : -1};    
  }

  checkValues(product) {
    if(product.name != '' && product.product_group > 0 && product.price_sales > 0 && product.price_sales > 0) {
      return false;
    } else {
      return true;
    }
  }

  getIndexById(id) {
    for(let i = 0; i < this.productGroups.length; i++) {
      for(let j = 0; j < this.productGroups[i].products.length; j++) {
        if(this.productGroups[i].products[j].id === id) {
          return [i, j];
        }
      }
    }
  } 

  // getProductById(id) {
  //   for(let i = 0; i < this.productGroups.length; i++) {
  //     for(let j = 0; j < this.productGroups[i].products.length; j++) {
  //       if(this.productGroups[i].products[j].id === id) {
  //         return this.productGroups[i].products[j];
  //       }
  //     }
  //   }
  // }
}
