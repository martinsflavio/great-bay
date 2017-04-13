function Mysql() {
  this.mysql = require('mysql');
  this.inquirer = require('inquirer');
  this.inventory = [];
  this.db = this.connect();
}

Mysql.prototype.asktoContinue = function () {
	this.inquirer.prompt([
		{
			type: 'confirm',
			name: 'tryAgain',
			message: 'Do you want to continue in this app?',
			default: true
		}
	]).then(function (anw) {

		if (anw.tryAgain) {
			this.uiMain();
		} else {
			this.clearScreen();
			this.db.end();
		}
	}.bind(this));
};
Mysql.prototype.clearScreen = function () {
	console.log('\033c');
};
Mysql.prototype.status = function () {
	this.db.connect(function(err){
		if(err) throw err;
		console.log('connected as id ' + connection.threadId);
	});
};
Mysql.prototype.connect = function () {
	return connection = this.mysql.createConnection({
		host:'localhost',
		port: 3306,
		user: 'root',
		password: '',
		database: 'bay_db'
	});
};
Mysql.prototype.get = function () {
  this.db.query("SELECT * FROM inventory", function(err, res){
	  if(err) throw err;
    this.inventory = res;
  }.bind(this));
};
Mysql.prototype.post = function (item, price) {
  var query = {
    name:item,
    price: price
  };
  this.db.query('INSERT INTO inventory SET ?', query, function (err) {
    if(err) throw err;
  });

};
Mysql.prototype.update = function (item, newValue) {
  this.db.query('UPDATE inventory SET ? WHERE ?',[{price:newValue}, {name:item}], function (err, res) {
    if (err) throw err;
  });
};
Mysql.prototype.delete = function (item) {
  this.db.query('DELETE FROM inventory WHERE ?', {name: item}, function (err, res) {
    if (err) throw err;
  });
};
Mysql.prototype.validadeBid = function (userItem, userPrice) {
	this.clearScreen();
	this.inventory.forEach(function (inventoryItem) {

		if(inventoryItem.name === userItem){
			if(inventoryItem.price < userPrice){
				console.log('success');
				this.update(userItem, userPrice);
				this.asktoContinue();
			} else {
				console.log('Sorry');
				this.asktoContinue();
			}
		}
	}.bind(this));
};
Mysql.prototype.uiPost = function () {
	this.clearScreen();
	this.inquirer.prompt([
		{
			type: 'input',
			name: 'name',
			message: 'Item:'
		},
		{
			type: 'input',
			name: 'price',
			message: 'Price: $'
		}
	]).then(function (ans) {
		this.post(ans.name,ans.price);
		this.uiMain();
	}.bind(this));
};
Mysql.prototype.uiBid = function () {
	this.clearScreen();

	// Creates a list of itens
	var itemsList = [];
	this.inventory.forEach(function (item) {
		var finalItem = item.name;
		itemsList.push(finalItem);
	});

	// Ask witch item the user wants to bid
	this.inquirer.prompt([
		{
			type: 'list',
			name: 'chosenItem',
			message: 'Pick an Item to Bid:',
			choices: itemsList
		}
	]).then(function (ans) {
		var userItem = ans.chosenItem;

		// Ask for a bid value
		this.inquirer.prompt([
			{
				type: 'input',
				name: 'bid',
				message: 'Bid Value: $'
			}
		]).then(function (ans) {
			var bidValue = parseInt(ans.bid);
			this.validadeBid(userItem,bidValue);
		}.bind(this));
	}.bind(this));

};
Mysql.prototype.uiMain = function () {
	this.clearScreen();
  // Gets a list of itens from Inventory
  this.get();

  this.inquirer.prompt([
	  {
		  type: 'list',
		  name: 'type',
		  message: 'Witch sevice do you like to use?',
		  choices: ['Post an Item', 'Bid on an Item', 'Exit']
	  }
  ]).then(function (ans) {
	  switch (ans.type) {
		  case 'Post an Item':
        this.uiPost();
			  break;
		  case 'Bid on an Item':
        this.uiBid();
			  break;
      case 'Exit':
	      console.log(ans.type);
	      this.db.end();
        break;
	  }
  }.bind(this));
};



var mysqlApp = new Mysql();

mysqlApp.uiMain();
//mysqlApp.uiGetBidValue();
