"use strict"
// var _ = require('koa-route');
var koa = require('koa');
var Router = require('koa-router');
var session = require('koa-session');
var parse = require('co-body');
var fs = require('fs');
var path = require('path');
var mime = require("./mime").types;
var db = require("./mongo");

var app  = koa();
app.keys = ['scret','keys'];
const opts = {'maxAge' : 24*60*60*1000};
app.use(session(app,opts));
app.listen(2333);
var router = new Router({
    // prefix : '/view/:id'
});

var myReadFile = function(_this, _path){
	var ext = path.extname(_this.url);
       ext = ext ? ext.slice(1) : 'unknow';
       var contentType = mime[ext] || "text/plain";
       _this.status = 200;
       _this.type = contentType;
       _this.body = fs.readFileSync(_path);
}


router
    .get('/:name',function*(next){
	    	if(this.params.name === 'favicon.ico') return;
	    	// this.session.isSigned = null;
	    	// this.session.account = null;
	    	var ext = path.extname(this.url);
	    	ext = ext ? ext.slice(1) : 'unknow';
	    	if(ext == 'html' && this.session.isSigned != '1' &&this.params.name != 'log.html'){
	    		// console.log('happen redirect')
	    		this.redirect('log.html');
	    		return ;
	    	}
	    	else if(this.params.name == 'log.html' && this.session.isSigned == '1' && ext == 'html'){
	    		this.redirect('index.html');
	    		return ;
	    	}

	       var _path = './1public/' + this.params.name;
	       // console.log(_path);
	       myReadFile(this, _path);
    })
    .get('/:fold/:name',function*(next){
    		if(this.params.fold == 'build'){
		       var _path = './1public/build/' + this.params.name;
		       myReadFile(this, _path);
    		}
    		yield next;
    })

    .get('/getMethod/:name',function*(next){
    		if(this.params.name == 'getAccount' ){
    			var limit = {
    				account : this.session.account
    			}
    			var data = yield db.mySearch('user',limit,null);
    			this.body = {
    				account : this.session.account,
    				userID : data[0]._id
    			}
    		}
    		else if(this.params.name == 'signout'){
    			if(this.session.isSigned == '1'){
    				this.session.isSigned = null;
    				this.session.account = null;
    				this.body = {
    					ok : 1
    				}
    			}
    			else{
    				this.body = {
    					ok : 0
    				}
    			}
    		}
    })
    .post('/postMethod/:name',function*(next){
    		//获取post内容
    		var body = yield parse(this);

    		//如果post是注册
    		if(this.params.name == 'signup'){
    			var limit = {
    				account : body.account
    			}
    			var skip = {
    				account : 1,
    				password : 1,
    				_id : 0
    			}
    			var data = yield db.mySearch('user',limit,skip);
    			if(data[0]){
    				this.body = {
    					ok : 0
    				}
    			}
    			else{
    				var insertData = {
    					account : body.account,
    					password : body.password
    				}
    				var data = yield db.myInsert('user', insertData);
    				// console.log('return data : ' + data);
    				if(data){
    					this.session.isSigned = '1';
    					this.session.account = body.account;
    					this.body = {
    						ok : 1
    					}
    				}
    				else{
    					this.body = {
    						ok : 0
    					}
    				}

    			}
    		}

    		//如果post是登陆
    		else if(this.params.name == 'signin'){
    			var limit = {
    				account : body.account
    			}
    			var skip = {
    				account : 1,
    				password : 1,
    				_id : 0
    			}
    			var data = yield db.mySearch('user',limit,skip);
    			// data = yield parse(data);
    			if(data[0] && data[0].password == body.password){
    				this.session.isSigned = '1';
    				this.session.account = body.account;
    				this.body = {
    					ok : 1
    				}
    			}
    			else{
    				this.body = {
    					ok : 0
    				}
    			}

    		}
    		//如果post请求folder
    		else if (this.params.name == 'getFolder'){
    			// var body = yield parse(this);
    			var limit = {
    				_userID : body._userID
    			}
    			var data = yield db.mySearch('folder',limit,null);
    			this.body = {
    				data : data
    			}
    		}

    		else if(this.params.name == 'newFolder'){
    			// console.log('body : ' + body.userID)
    			var insertData = {
    				folderName : body.folderName,
    				userID : body.userID
    			}
    			var response = yield db.myInsert('folder',insertData);
    			this.body = {
    				ok : response
    			}
    		}

    		else if(this.params.name == 'getNewItem'){
    			var insertData = {};
    			insertData['_folderID'] = body.folderID;
    			var pps = body.ppsArray;
    			var vals = body.valsArray;
    			for(var i = 0;i < pps.length; i++){
    				insertData['' + pps[i]] = vals[i];
    			}
    			insertData['____pps'] = pps;
    			var response = yield db.myInsert('newItem', insertData);
    			this.body = {
    				ok : response
    			}
    		}

    		else if(this.params.name == 'deleteItem'){
    			var limit = {
    				_itemID : body.itemID,
    				_folderID : body.folderID
    			}
    			var response = yield db.myDelete('deleteItem', limit);
    			this.body = {
    				ok : response
    			}
    		}
    		else if(this.params.name == 'showItemDetail'){
    			var limit = {
    				_itemID : body.itemID,
    				_folderID : body.folderID
    			}
    			var response = yield db.mySearch('showItemDetail', limit, null);
    			if(response == '-1'){
    				this.body = {ok : '-1'};
    			}
    			else{
    				var tagsArr = [];
    				var tagsVal = [];
    				for(var n in response){
    					tagsArr.push(n);
    					tagsVal.push(response[n]);
    				}
    				tagsArr.splice(-2,2);
    				tagsArr.reverse();
    				tagsVal.splice(-2,2);
    				tagsVal.reverse();
    				this.body = {
    					ok : '1',
    					tagsArr : tagsArr,
    					tagsVal	: tagsVal
    				}
    			}
    		}

    		else if(this.params.name == 'saveItemChange'){
    			var response = yield db.myUpdate('saveItemChange', body);
			this.body = {
    				ok : response
    			}
    		}
    })







app
  .use(router.routes())
  .use(router.allowedMethods());
