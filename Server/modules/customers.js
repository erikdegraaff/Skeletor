
///////////////////////
// Customers
///////////////////////
//- GET ALL
exports.getAll = function(con, data, callback) {
    con.query("SELECT * FROM customers", function(err, result) {
    	return callback(result);
    });
}
//- GET BY ID
exports.getById = function(con, data, callback) {
    con.query("SELECT * FROM customers WHERE id='"+data.id+"'", function(err, result) {
    	return callback(result);
    });
}
//- ADD OR UPDATE
exports.addOrUpdate = function(con, data, callback) {
	if(data.id === 0) {
    	// con.query("INSERT INTO customers (id, name, layout_id) VALUES ('"+ data.id +"','"+ data.name +",'"+data.layout_id+"')", function(err, result) {
    	// 	return callback(result);
	    // });
	} else {
    	//con.query("UPDATE customers SET id='"+data.id+"', name='"data.name"', layout_id='"+data.layout_id+"')", function(err, result) {
    	//	return callback(result);
	    //});
	}
}
//- REMOVE 
exports.remove = function(con, data, callback) {
	console.log('test');
}

