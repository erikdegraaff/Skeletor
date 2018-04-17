var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var async = require('async');
var pdf = require('pdfkit');
var fs = require('fs');
//var blobStream = require('blob-stream');


var db = mysql.createConnection({
  user: 'root',
  password: 'mysql',
 // socketPath : '/Applications/AMPPS/var/mysql.sock.',
  database: 'skeletor',
  multipleStatements: true
});



io.on('connection', (socket) => {

  db.connect((err) => {
    console.log('Connected to db');
  });
 
	//productsmodule
  socket.on('get-products-by-group', (data) => {
    getProductsByGroup(socket);
  });
  socket.on('save-product', (data) => {
    data.price_sales = parseFloat(data.price_sales)*1000;
    data.price_purchase = parseFloat(data.price_purchase)*1000;
    if(data.id > 0) {
      db.query('UPDATE products SET name="'+data.name+'", price_sales="'+data.price_sales+'", price_purchase="'+data.price_purchase+'", product_group="'+data.product_group+'" WHERE id="'+data.id+'"', (err, result, fields) => {
        getProductsByGroup(socket);
      });
    } else {
      db.query('INSERT INTO products (name, price_sales, price_purchase, product_group) VALUES ("'+data.name+'","'+data.price_sales+'","'+data.price_purchase+'","'+data.product_group+'")', (err, result, fields) => {
        getProductsByGroup(socket);
      });      
    }
  });
  socket.on('remove-product', (data) => {
      db.query('DELETE FROM products WHERE id="'+data.id+'"', (err, result, fields) => {
        getProductsByGroup(socket);
      });
  });  

  //productgroupsmodule
  socket.on('get-product-groups', (data) => {
    getProductGroups(socket);
  });
  socket.on('save-product-group', (data) => {
    if(data.id > 0) {
      db.query('UPDATE product_groups SET name="'+data.name+'", color="'+data.color+'", menu_order="'+data.menu_order+'" WHERE id="'+data.id+'"', (err, result, fields) => {
        getProductGroups(socket);
      });
    } else {
      db.query('INSERT INTO product_groups (name, color, menu_order) VALUES ("'+data.name+'","'+data.color+'", "'+data.menu_order+'")', (err, result, fields) => {
        getProductGroups(socket);
      });      
    }
  });
  socket.on('remove-product-group', (data) => {
      db.query('DELETE FROM product_groups WHERE id="'+data.id+'"', (err, result, fields) => {
        getProductGroups(socket);
      });
  }); 
  socket.on('update-product-groups-order', (data) => {
      async.forEachOf(data.list, (listData, i, callback) => {
        db.query('UPDATE product_groups SET menu_order="'+listData.menu_order+'" WHERE id="'+listData.id+'"', (err, result, fields) => {
          callback();
        });
      }, (err) => {
      if(err) {
        console.log(err);
      } else {
        if(data.update === 'getProductGroups') {
          getProductGroups(socket);
        } else if(data.update === 'getProductsByGroup') {          
          getProductsByGroup(socket);
        }
      }
    });        
  });

  // customer module 
  socket.on('get-customers', (data) => {
    getCustomers(socket);
  });
  socket.on('save-customer', (data) => {
    if(data.id > 0) {
      db.query('UPDATE customers SET name="'+data.name+'", layout_id="'+data.layout_id+'", active="'+data.active+'" WHERE id="'+data.id+'"', (err, result, fields) => {
        getCustomers(socket);
      });
    } else {
      db.query('INSERT INTO customers (name, layout_id) VALUES ("'+data.name+'","'+data.layout_id+'", active="'+data.active+'")', (err, result, fields) => {
        getCustomers(socket);
      });      
    }
  });
  socket.on('remove-customer', (data) => {
      db.query('DELETE FROM customers WHERE id="'+data.id+'"', (err, result, fields) => {
        getCustomers(socket);
      });
  });

  // User module 
  socket.on('get-users', (data) => {
    getUsers(socket);
  });
  socket.on('save-user', (data) => {
    if(data.id > 0) {
      db.query('UPDATE users SET name="'+data.name+'", admin="'+data.admin+'", password="'+data.password+'", email="'+data.email+'" WHERE id="'+data.id+'"', (err, result, fields) => {
        getUsers(socket);
      });
    } else {
      db.query('INSERT INTO users (name, admin, password, email) VALUES ("'+data.name+'","'+data.admin+'","'+data.password+'","'+data.email+'")', (err, result, fields) => {
        getUsers(socket);
      });      
    }
  });
  socket.on('remove-user', (data) => {
      db.query('DELETE FROM users WHERE id="'+data.id+'"', (err, result, fields) => {
        getUsers(socket);
      });
  });

  // LayoutsModule  
  socket.on('get-layouts', (data) => {
    getLayouts(socket);
  });
  
  socket.on('get-layout', (data) => {
    getLayout(socket, data.layout_id);
  });
  
  socket.on('save-layout', (data) => {
    if(data.id > 0) {
      db.query('UPDATE layouts SET name="'+data.name+'" WHERE id="'+data.id+'"', (err, result, fields) => {
        saveNodes(data.nodes, data.id, socket);
      });
    } else {
      db.query('INSERT INTO layouts (name) VALUES ("'+data.name+'")', (err, result, fields) => {
        saveNodes(data.nodes, result.insertId, socket);
      });      
    }
  });

  socket.on('remove-layout', (data) => {
      db.query('DELETE FROM layouts WHERE id="'+data.id+'"; DELETE FROM nodes WHERE layout_id="'+data.id+'"; UPDATE customers SET layout_id="0" WHERE layout_id="'+data.id+'"', (err, result, fields) => {
        getLayouts(socket);
      });
  });

  // FRANKEER MODULE 
  socket.on('get-count-layout', (data) => {
    getCountLayout(socket, data.layout_id);
  });
  
  socket.on('get-totals', (data) => {
    db.query('SELECT * FROM totals WHERE customer_id="'+data.customer_id+'" AND timestamp="'+data.timestamp+'"', (err, result, fields) => {
      socket.emit('get-totals', result);
    });
  });
  
  socket.on('save-count', (data) => {
    //data.total = data.total*1000;
    let query = '';
    if(data.id == 0) {
      query = 'INSERT INTO totals (customer_id, product_id, count, total, timestamp) VALUES ("'+data.customer_id+'","'+data.product_id+'","'+data.count+'","'+data.total+'","'+data.timestamp+'")';
    } else {
      if(data.count === 0) {
        query = 'DELETE FROM totals WHERE id="'+data.id+'"';
      } else {
        query = 'UPDATE totals SET count="'+data.count+'", total="'+data.total+'" WHERE id="'+data.id+'"';        
      }
    }
    db.query(query, (err, result, fields) => {
      // naar degene die gestuurd heeft geen count
      let id = data.id;
      if(id === 0) {
        id = result.insertId;
      }
      socket.broadcast.emit('save-count',{
        id: id, 
        index: data.index,
        count:data.count,
        customer_id: data.customer_id
      }); 
      sendDayTotals(socket);       
    });
  });
  // VIEW MODULE 
  socket.on('view-customer', (data) => {
    db.query('SELECT t.*, p.name, p.price_sales, p.product_group, pg.color, pg.name as pg_name FROM totals t, products p, product_groups pg WHERE t.customer_id="'+data.customer_id+'" AND t.timestamp >= "'+data.from+'" AND t.timestamp <= "'+data.to+'" AND p.id=t.product_id AND pg.id=p.product_group', (err, totals, fields) => {
      socket.emit('view-customer', totals);
    });
  });

  socket.on('view-products', (data) => {
    let products = [];
    if(data.ids.length > 0) {
      db.query('SELECT p.*, pg.color, pg.id as pg_id, pg.name as pg_name FROM products p, product_groups pg WHERE p.id IN('+data.ids.join()+') AND pg.id=p.product_group ORDER BY pg.menu_order', (err, products, fields) => {
        let productsByGroup = [];
        let pg = 0;
        let c = -1;
        let sortedProducts = [];
        for(let i = 0; i < products.length; i++) {
          if(pg != products[i].pg_id) {
            pg = products[i].pg_id;
            c++;
            productsByGroup[c] = [products[i]];
          } else {
            productsByGroup[c].push(products[i]);          
          }
        }
        for(var i = 0; i < productsByGroup.length; i++) {
          sortedProducts.push(...sortByNumericStringFirst(productsByGroup[i],'name','-'));
        }

        async.forEachOf(sortedProducts, (product, i, callback) => {
          db.query('SELECT t.count, t.product_id, t.timestamp FROM totals t WHERE t.product_id="'+product.id+'" AND t.timestamp >= "'+data.from+'" AND t.timestamp <= "'+data.to+'" ORDER BY t.timestamp DESC', (err, totals, fields) => {
            let count = 0;
            for(var i = 0; i < totals.length; i++) {
              count += totals[i].count;
            }  
            product.count = count;
            product.from = data.from;
            product.to = data.to;
            callback();        
          });        
        }, (err) => {
          if(err) {
            console.log(err);
          } else {
            socket.emit('view-products', sortedProducts);
          }
       });
      });
    } else {
      socket.emit('view-products', []);      
    }
  });

  socket.on('print-products', (products)  => {
    printProducts(socket, products);
  })
});

function sendDayTotals(socket) {
    let today = getDate();
    db.query('SELECT c.id, (SELECT COUNT(*) FROM totals WHERE customer_id=c.id AND timestamp="'+today+'") AS todays_count FROM customers c ORDER BY c.name ASC', (err, customers, fields) => {
      io.sockets.emit('day-totals', customers);
    });
}

function saveNodes(nodes, layout_id, socket) {
    db.query('SELECT * FROM nodes WHERE layout_id="'+layout_id+'"', (err, existingNodes, fields) => {
      // REMOVE NODES THAT PREVIOUSLY EXIST
      for(let i = 0; i < existingNodes.length; i++) {
        if(!idInArr(nodes, existingNodes[i].id)) {
            nodes.push({
              id:existingNodes[i].id, 
              action:'REMOVE',
              query: 'DELETE FROM nodes WHERE nodes.id="'+existingNodes[i].id+'"'
            });
        } 
      }
      for(let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if(!idInArr(existingNodes, node.id)) {
            node.action ='ADD';
            node.query = 'INSERT INTO nodes (row, col, node_index, type, value, product_id, layout_id) VALUES ("'+node.row+'","'+node.col+'","'+node.node_index+'","'+node.type+'","'+node.value+'","'+node.product_id+'","'+layout_id+'")';
        } else {
          if(node.action !== 'REMOVE') {
            node.action ='UPDATE';          
            node.query = 'UPDATE nodes SET row="'+node.row+'",col="'+node.col+'", node_index="'+node.node_index+'",type="'+node.type+'",value="'+node.value+'", product_id="'+node.product_id+'",layout_id="'+layout_id+'" WHERE id="'+node.id+'"';
          }
        }
      }
      async.forEachOf(nodes, (node, i, callback) => {
        db.query(node.query, (err, result, fields) => {
          callback();        
        });        
      }, (err) => {
        if(err) {
          console.log(err);
        } else {
          getLayout(socket, layout_id);      
        }
     });
  });
}

function getNodeById(nodes, id) {
  for(var i = 0; i < nodes.length; i++) {
    if(nodes[i].id === id) {
      return nodes[i];
    }
  }
}

function getCustomers(socket) {
    let today = getDate();

    db.query('SELECT c.*, (SELECT COUNT(*) FROM totals WHERE customer_id=c.id AND timestamp="'+today+'") AS todays_count FROM customers c ORDER BY c.name ASC', (err, customers, fields) => {
     let c = -1;
     let letter = '';
     let orderedCustomers = [];
     for(let i = 0; i < customers.length; i++) {
        if(customers[i].name[0].toUpperCase() !== letter) {
            letter = customers[i].name[0].toUpperCase();
            orderedCustomers.push({
              letter:letter,
              customers: []
            });
            c++;
          }
        customers[i].letter = letter;
        orderedCustomers[c].customers.push(customers[i]);     
      }
      let customersData = {
        customers: customers,
        orderedCustomers: orderedCustomers,
        layouts: []
      };
      db.query('SELECT * FROM layouts ORDER by name', (err, layouts, fields) => {
        customersData.layouts = layouts;
        socket.emit('get-customers', customersData);   
      });
    });  
}

function getUsers(socket) {
    db.query('SELECT * FROM users ORDER BY name ASC', (err, users, fields) => {
          socket.emit('get-users', users);   
    });  
}

function getProductGroups(socket) {
    db.query('SELECT DISTINCT product_groups.*, (SELECT COUNT(*) FROM products WHERE product_group=product_groups.id) AS product_count FROM product_groups ORDER BY product_groups.menu_order ASC', (err, result, fields) => {
      let productGroups = result;
      socket.emit('get-product-groups', productGroups);   
    });  
}

function getProductsByGroup(socket) {
  db.query('SELECT * FROM product_groups ORDER BY menu_order ASC', (err, productGroups, fields) => {
    let productsByGroup = [];
    async.forEachOf(productGroups, (productGroup, i, callback) => {
      productsByGroup.push({
        id: productGroup.id,
        name: productGroup.name,
        color: productGroup.color,
        menu_order: productGroup.menu_order,
        products: []
      });
      db.query('SELECT p.*, pg.color AS pg_color FROM products p, product_groups pg WHERE p.product_group="'+productGroup.id+'" AND pg.id="'+productGroup.id+'" ORDER BY p.name ASC', (err, products, fields) => {
        productsByGroup[i].products = products;
        callback();
      });
    }, (err) => {
      if(err) {
        console.log(err);
      } else {
        for(let i = 0; i < productsByGroup.length; i++) {
          productsByGroup[i].products = sortByNumericStringFirst(productsByGroup[i].products, 'name', '-');
        }
        socket.emit('get-products-by-group', productsByGroup);   
      }
    });
  });
}

function getLayouts(socket) {
  db.query('SELECT * FROM layouts ORDER BY name ASC', (err, layouts, fields) => {
      socket.emit('get-layouts', layouts);   
  });
}

function getLayout(socket, layout_id) {
  db.query('SELECT * FROM layouts WHERE id="'+layout_id+'"', (err, layout, fields) => {
      let layoutsAndNodes = {};
      db.query('SELECT * FROM nodes WHERE layout_id="'+layout[0].id+'"', (err, nodes, fields) => {
        layoutsAndNodes = {
          id: layout[0].id,
          name: layout[0].name,
          nodes: nodes
        };
        socket.emit('get-layout', layoutsAndNodes);  
    });
  });
}

// FRANKEER MODULE
function getCountLayout(socket, layout_id) {
  let countLayout = [];
  db.query('SELECT * FROM nodes WHERE layout_id="'+layout_id+'" ORDER BY node_index', (err, nodes, fields) => {
    async.forEachOf(nodes, (node, i, callback) => {
      if(node.product_id > 0) {
        db.query('SELECT p.*, pg.color FROM products p, product_groups pg WHERE p.id="'+node.product_id+'" AND pg.id=p.product_group LIMIT 1', (err, product, fields) => {
          node.product = product[0];
          countLayout.push(node);
          callback();
        });
      } else {
          countLayout.push(node);
          callback();        
      }
    }, (err) => {
      if(err) {
        console.log(err);
      } else {
        socket.emit('get-count-layout', countLayout);  
      }
    });
  });
}

// Print module
function printProducts(socket, products) {
  var doc = new pdf;
  doc.pipe(fs.createWriteStream('pdfs/print.pdf'));
  doc.font('Helvetica');
  doc.fontSize(12); 
  let y = 100;
  for(var i = 0; i < products.length; i++) {
    let product = products[i];
    if(product.from === product.to) {
       doc.text(getDateString(product.from), 50, y);
    } else {
       doc.text(getDateString(product.from)+' - '+getDateString(product.to), 50, y);  
    }
    doc.text(product.pg_name+' '+product.name, 200, y);  
    doc.text(product.count, 500, y);  
    y += 15;
  }
  doc.end();
  socket.emit('print-products',{pdf:'pdf/print.pdf'});
}

// Utilsmodule
function idInArr(arr, id) {
  for(let i = 0; i < arr.length; i++) {
    if(arr[i].id === id) {
       return true;
    }
  }
  return false;
}

function sortByNumericStringFirst(arr, key, delimeter) {
  // check if first part of string is int
  for(let i = 0; i < arr.length; i++) {
    let str = arr[i][key].split(delimeter);
    if(!isNaN(parseInt(str[0]))) {
      arr[i].order = parseInt(str[0]);
    } 
  }
  // sort
  arr.sort(function(a, b){
    return a.order-b.order
  });    
  // remove order key
  arr.map(function(a) { 
    delete a.order; 
    return a; 
  });  
  return arr;
}

function getDate(){
  let timeStamp = Date.now();
  timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
  timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
  return timeStamp;
}  

function getDateString(timestamp) {
    let date = new Date(timestamp);
    return date.getDate() +"/"+ (date.getMonth()+1) +"/"+ date.getFullYear();
} 

http.listen(3000, () => {
  console.log('listening on *:3000');
});


