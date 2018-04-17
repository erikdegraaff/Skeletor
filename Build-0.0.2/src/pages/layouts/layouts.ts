import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AlertController } from 'ionic-angular';

import { SocketProvider } from '../../providers/socket/socket';

@IonicPage()
@Component({
  selector: 'page-layouts',
  templateUrl: 'layouts.html',
})
export class LayoutsPage {

	public layouts: any;
	public openLayout: any;
	private copy: any;

	public productGroups: any;
	public openProductGroup: Number;

	public rows: any;
	public cols: any;

	public cancelText: String;

	constructor(public navCtrl: NavController, public navParams: NavParams, private dragula: DragulaService, private socket: SocketProvider, private alertCtrl: AlertController) {
	    this.openLayout = {id:-1};
	    this.copy = {id:-1}
		this.cancelText = 'Annuleren';

		this.socket.on('get-layout', data => {
 			this.openLayout = data;
 			if(this.copy.id != this.openLayout.id) {
				this.copy = JSON.parse(JSON.stringify(this.openLayout));
				this.cancelText = 'Annuleren';
 			}
 			console.log(this.openLayout.nodes);
 			this.hideProductNodes();
		});
		
		this.productGroups = [];
		this.openProductGroup = 0;

		this.socket.emit('get-products-by-group', {});
    	this.socket.on('get-products-by-group', data => {
		    this.socket.emit('get-layouts', {});
     		this.productGroups = data;
    	});  

		this.socket.on('get-layouts', data => {
 			this.layouts = data;
		}); 
     	this.initGrid();

      	this.dragula.setOptions('bag', {      
      		revertOnSpill: true
		});
	    this.dragula.drag.subscribe((val) => {
	    	console.log('dragg');
	    });

	    this.dragula.drop.subscribe((val) => {
	    	if(val[0] === 'bag') {	 
	    		console.log(val, val[2].children.length);
	    		if(val[2].children.length === 1) {
					let row = parseInt(val[2].id.replace('rc','').split('-')[0]);
					let col = parseInt(val[2].id.replace('rc','').split('-')[1]);
					let id = parseInt(val[1].id.replace('node',''));
					if(id > 0) {
						// change
						let node = this.getNodeById(id);
						node.row = row;
						node.col = col;
						node.node_index = this.calcNodeIndex(row, col);
					} else {
						// new
						let productId = parseInt(val[1].id.replace('product',''));
						let node ={
							id:0,
							row:row,
							col:col,	
							node_index:this.calcNodeIndex(row, col),
							layout_id: this.openLayout.id,					
							value:'',						
							type:'product',
							product_id:productId
						}
						if(val[1].id) {
							document.getElementById(val[1].id).remove();					
						}
						this.openLayout.nodes.push(node);
					}
					this.cancelText = 'Ongedaan maken';
					this.saveLayout(this.openLayout);
				} else {
					this.dragula.find('bag').drake.cancel(true);
				}
			}	
		});    	
	}

	addTextNode(row, col, event) {
		if(event.target.id.indexOf('node') === -1) {
			let alert = this.alertCtrl.create({
			    title: 'Tekst toevoegen',
			    inputs: [
			      {
			        name: 'text',
			        placeholder: 'Text'
			      }
			    ],
			    buttons: [
			      {
			        text: 'Annuleren',
			        role: 'cancel',
			      },
			    {
		        text: 'Toevoegen',
		        handler: data => {
		          if(data.text) {
		          	let node = {
		          		id:0,
		          		layout_id:this.openLayout.id,
		          		row:row,
		          		col:col,
		          		node_index:this.calcNodeIndex(row, col),
		          		value:data.text,
		          		type:'text',
		          		product_id:0
		          	}
		          	this.openLayout.nodes.push(node);
		          	console.log(node);
		          	this.saveLayout(this.openLayout);
		          }
		        }
		      }
		    ]
		  });
    	alert.present();		
		}
	}

	saveLayoutFromButton(layout) {
		this.cancelText = 'Annuleren';
	    this.copy = {id:-1};
	    this.saveLayout(layout);
	}

	saveLayout(layout) {
		this.socket.emit('save-layout', layout);
	    this.socket.emit('get-layouts', {});
	}	

	removeNode(node) {
		this.cancelText = 'Ongedaan maken';
		var index = this.getNodesArrIndex(node);
		this.openLayout.nodes.splice(index, 1);
		this.saveLayout(this.openLayout);
		this.hideProductNodes();

	}

	getNodeById(id) {
		for(let i = 0; i < this.openLayout.nodes.length; i++) {
			if(this.openLayout.nodes[i].id === id) {
				return this.openLayout.nodes[i];
			}
		}		
	}
	getNodesArrIndex(node) {
		for(let i = 0; i < this.openLayout.nodes.length; i++) {
			if(this.openLayout.nodes[i].id === node.id) {
				return i;
			}
		}				
	}
	initGrid() {		
		this.cols = [];
		this.rows = [];
		for(let i = 0; i < 25; i++) {			
			this.rows.push({num:i});
		}
		for(let i = 0; i < 6; i++) {
			this.cols.push({num:i});
		}
	}

	getNodeByIndex(index) {
		for(let i = 0; i < this.openLayout.nodes.length; i++) {
			if(this.openLayout.nodes[i].node_index === index) {
				return this.openLayout.nodes[i];
			}
		}
	}

	calcNodeIndex(row, col) {
		return (row * this.cols.length) + col;
	}

	resetHiddenProducts() {
		for(let i = 0; i < this.productGroups.length; i++) {
			for(let j = 0; j < this.productGroups[i].products.length; j++) {
				this.productGroups[i].products[j].in_use = 0;				
			}
		}		
	}
	
	hideProductNodes() {
		this.resetHiddenProducts();
		for(let i = 0; i < this.openLayout.nodes.length; i++) {
			if(this.openLayout.nodes[i].type === 'product') {
				//console.log(this.openLayout.nodes[i]);
				let product = this.getProductById(this.openLayout.nodes[i].product_id);
				//console.log(product);
				product.in_use = 1;
			} 
		}		
	}
	
	getProductById(id) {
		for(let i = 0; i < this.productGroups.length; i++) {
			for(let j = 0; j < this.productGroups[i].products.length; j++) {
				if(this.productGroups[i].products[j].id === id) {
					return this.productGroups[i].products[j];
				}
			}
		}		
	}
	
	ionViewWillLeave() {
	    this.dragula.destroy('bag');   
	}

	toggleProductGroup(productGroupId) {
    	if(this.openProductGroup === productGroupId) {
	      	this.openProductGroup = 0;
    	} else {
    	  	this.openProductGroup = productGroupId;
    	}
  	}

	editLayout(layout) {
		this.cancelText = 'Annuleren';
		this.openProductGroup = 0;
	    this.socket.emit('get-layout', {layout_id:layout.id});
	}

	addLayout() {
		if(this.openLayout.id != -1) {
			this.openLayout.id = 0;	
			this.openLayout.name += ' (kopie)';	
			for(let i = 0; i < this.openLayout.nodes.length; i++) {
		 		this.openLayout.nodes[i].id = 0;
		 		this.openLayout.nodes[i].layout_id = 0;
		 	}
		 } else {
		 	this.openLayout = {id : 0, name: '(nieuw)', nodes:[]};			
		}
		this.saveLayout(this.openLayout);
		this.socket.emit('get-products-by-group', {});
	}

	removeLayout(layout) {
		if(layout.id > 0) {
	  		this.socket.emit('remove-layout', layout);
			this.openLayout = {id : -1};   
		}
	}

	resetOpenLayout() {
		if(this.cancelText === 'Ongedaan maken') {
			this.openLayout = this.copy;
			this.saveLayout(this.copy);	
			this.cancelText = 'Annuleren';				
		} else {
			this.openLayout = {id:-1};
			this.cancelText = 'Annuleren';				
		}
	    this.copy = {id:-1};
	}

	checkValues(layout) {
		if(layout.name) {
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
