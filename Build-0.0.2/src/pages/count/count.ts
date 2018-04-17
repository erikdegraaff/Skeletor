import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SocketProvider } from '../../providers/socket/socket';

@IonicPage()
@Component({
  selector: 'page-count',
  templateUrl: 'count.html',
})
export class CountPage {

	public customers: any;
	public openCustomer: any;
	public openCustomerGroup: String;
  public date: any;
  public today: any;
  public rows: any;
  public cols: any;

  public nodes: any;

  private tapping: Boolean;
  private saved: Boolean;

	constructor(public navCtrl: NavController, public navParams: NavParams, private socket: SocketProvider) {
		this.openCustomerGroup = '';
		this.openCustomer = {id:-1};
    this.nodes = [];

    this.tapping = false;
    this.saved = false;

    let d = new Date();
    this.date = d.toISOString();
    this.today = d.toISOString();

    this.socket.emit('get-customers', {});
		this.socket.on('get-customers', data => {
	 		this.customers = data['orderedCustomers'];
		  this.openCustomer = {id:-1};
		});  

    this.socket.on('get-count-layout', data => {
      this.nodes = data;
      for(let i = 0; i < this.nodes.length; i++) {
        this.nodes[i].index = i;
      }
      this.socket.emit('get-totals', {customer_id:this.openCustomer.id, timestamp:this.getDate(this.date)});    
      this.initGrid();
    });  

    this.socket.on('get-totals', data => {
      for(var i = 0; i < data.length; i++) {
        let node = this.getNodeByProductId(data[i].product_id);
        node.count_id = data[i].id;
        node.count = data[i].count;
      }
    });

    this.socket.on('save-count', data => {
      console.log(data);

      if(data.customer_id === this.openCustomer.id) {
        this.nodes[data.index].count_id = data.id;
        if(data.count >= 0) {
          this.nodes[data.index].count = data.count;
        }
      }
    });

    this.socket.on('day-totals', data => {
      for(var i = 0; i < data.length; i++) {
        if(data[i].todays_count > 0) {
          let customer = this.getCustomerById(data[i].id);
          customer.todays_count = data[i].todays_count;
        }
      }
    });
	}

  changeDate() {
    if(this.openCustomer.id > -1) {
      for(var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].count = '';
        this.nodes[i].count_id = '';
      }
      this.socket.emit('get-totals', {customer_id:this.openCustomer.id, timestamp:this.getDate(this.date)});    
    }
  }

  add(node) {
    node.add = 1;
    if(!node.count) {
      node.count = 0;
    }
    node.count++;
    this.isChanged(node);
  }

  subs(node) {
    node.subs = 1;
    if(node.count > 0) {
      node.count--;
      this.isChanged(node);
    }
  }

  saveOnBlur(node) {
      this.isChanged(node);
  }

  isChanged(node) {
    this.saveCount(node);    
    for(let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].lastChanged = 0;
    }
    node.lastChanged = 1;
    if(node.changed) {
      node.changed = clearTimeout(node.changed);
    }
    node.changed = setTimeout(() => {
        node.subs = 0;
        node.add = 0;
      }, 250);
  }

  saveCount(node) {
    if(!node.count_id) {
      node.count_id = 0;
    }
    let total = {
         id:node.count_id, 
         product_id: node.product.id,
         customer_id: this.openCustomer.id,
         count: node.count,
         index: node.index,
         total: (node.count*node.product.price_sales),
         timestamp: this.getDate(this.date)
    }
  //  console.log(total);
    this.socket.emit('save-count', total);
  }

  getNodeByProductId(id) {
    if(id > 0) {
      for(let i = 0; i < this.nodes.length; i++) {
        if(this.nodes[i].product_id === id) {
          return this.nodes[i];
        }
      }    
    }
  }

  getNodeByIndex(index) {
    for(let i = 0; i < this.nodes.length; i++) {
      if(this.nodes[i].node_index === index) {
        return this.nodes[i];
      }
    }
  }

  getCustomerById(id) {
    for(let i = 0; i < this.customers.length; i++) {
      for(let j = 0; j < this.customers[i].customers.length; j++) {
        if(this.customers[i].customers[j].id === id) {
          return this.customers[i].customers[j];
        }
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

	countCustomer(customer) {
    for(var i = 0; i < this.nodes.length; i++) {
      if(this.nodes[i].changed) {
        this.nodes[i].changed = clearTimeout(this.nodes[i].changed);
        this.nodes[i].count = 0;
      }
    }
		this.openCustomer = customer;
    this.socket.emit('get-count-layout', {layout_id:customer.layout_id});
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
  		classes += ' selected';
  	}
  	return classes;
  }

  getDate(date){
    let timeStamp = Date.parse(date);
    timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
    timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
    return timeStamp;
  }  
}
