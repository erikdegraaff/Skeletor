var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');


var con = mysql.createConnection({
  	user: 'root',
  	password: 'root',
	   socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
	database: 'skeletor'
});

// for(var i =1; i < 20; i++) {
// 	var price = randRange(1,300)
//    	con.query("INSERT INTO products (name, price) VALUES ('Product "+i+"','"+price+"')", (err, result) => {
//    		console.log(result);
// 	});
// }

function connect() {
	con.connect(function(err) {
  		console.log('Connected to db');
	});	
}
 
io.on('connection', (socket) => {
  connect();

  // NODES
  socket.on('get-nodes', (data) => {
      getNodes(data.layout_id);
  });

  socket.on('add-node', (data) => {
      console.log('add', data);   
      con.query("INSERT INTO nodes (layout_id, num, value, type, product_id) VALUES ('"+data.layout_id+"', '"+data.num+"','"+data.value+"','"+data.type+"', '"+data.product_id+"')", (err, result) => {
         getNodes(data.layout_id);
      });
  }); 
  socket.on('move-node', (data) => {
    console.log('move', data);
    con.query("UPDATE nodes SET num='"+data.num+"' WHERE id='"+data.id+"'", (err, result) => {
         //getNodesExclude(data.layoutId, data.id);
    });
  }); 
  socket.on('remove-node', (data) => {
    console.log('remove', data);
    con.query("DELETE FROM nodes WHERE id='"+data.id+"'", (err, result) => {
         getNodes(data.layoutId);
    });
  }); 

  // PRODUCTS
  socket.on('get-products', (data) => {
  	getProducts();
  });

  socket.on('add-product', (data) => {
    console.log(data);
   	con.query("INSERT INTO products (name, price) VALUES ('"+data.name+"','"+data.price+"')", (err, result) => {
   	  getProducts();
    });
  }); 

  // CUSTOMERS
  socket.on('get-customers', (data) => {
    getCustomers();
  });

  socket.on('add-customer', (data) => {
    console.log(data);
    con.query("INSERT INTO customers (name, layout_id) VALUES ('"+data.name+"','"+data.layout_id+"')", (err, result) => {
      getCustomers();
    });
  }); 
  socket.on('get-customer-data', (data) => {
    let timestamp = roundDate();
    getCustomerData(data.customer_id);
  });

  // Layouts
  socket.on('get-layouts', (data) => {
    getLayouts();
  });

  socket.on('add-layout', (data) => {
    console.log(data);
    con.query("INSERT INTO layouts (name) VALUES ('"+data.name+"')", (err, result) => {
      getLayouts();
    });
  }); 

  socket.on('save-totals', (data) => {
    let timestamp = roundDate();
    for(let i = 0; i < data.length; i++) {
      con.query("SELECT id FROM totals WHERE customer_id='"+data[i].customer_id+"' AND product_id='"+data[i].product_id+"' AND timestamp='"+timestamp+"' LIMIT 1", (err, result, fields) => {
        if(result.length > 0) {
         con.query("UPDATE totals SET count='"+data[i].count+"' WHERE id='"+result[0].id+"'", (err, result) => {});
        } else {
          con.query("INSERT INTO totals (customer_id, product_id, count, timestamp) VALUES ('"+data[i].customer_id+"','"+data[i].product_id+"','"+data[i].count+"', '"+timestamp+"')", (err, result) => {});
        } 
      });
    }
  });
});

// function test() {
//   let timestamp = roundDate();
//   console.log(timestamp);
//   con.query("SELECT id FROM totals WHERE customer_id='6' AND product_id='4' AND timestamp='"+timestamp+"' LIMIT 1", (err, result, fields) => {
//     console.log(result);
//   });
// }
// test();



function getNodes(layoutId) {
  	con.query("SELECT * FROM nodes WHERE layout_id='"+layoutId+"'", (err, result, fields) => {
   		io.emit('get-nodes', result);   
	});
}

function getNodesExclude(layoutId, excludeId) {
    con.query("SELECT * FROM nodes WHERE layout_id='"+layoutId+"' AND id!='"+excludeId+"'", (err, result, fields) => {
      io.emit('get-nodes', result);   
  });
}

function getProducts() {
  	con.query("SELECT * FROM products", (err, result, fields) => {
   		io.emit('get-products', result);   
	});
}

function getCustomers() {
    con.query("SELECT * FROM customers ORDER BY name", (err, result, fields) => {
      io.emit('get-customers', result);   
  });
}
getCustomerData(3);
function getCustomerData(customerId) {
    let timestamp = roundDate();
    con.query("SELECT * FROM totals WHERE customer_id='"+customerId+"' AND timestamp='"+timestamp+"'", (err, result, fields) => {
      if(!result) {
        result = [];
      }
      io.emit('get-customer-data', result);
  });
}

function roundDate(){
    let timeStamp = Date.now();
    timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
    timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
    return timeStamp;
}

function getLayouts() {
    con.query("SELECT * FROM layouts ORDER BY name", (err, result, fields) => {
      io.emit('get-layouts', result);   
  });
}


function randRange(lowVal,highVal) {
     return Math.floor(Math.random()*(highVal-lowVal+1))+lowVal;
}
 
http.listen(3000, () => {
  console.log('listening on *:3000');
});

