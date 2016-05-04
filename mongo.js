"use strict"
var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://127.0.0.1:27017/webTest");
db.connection.on("error",function(error){
	console.log("connection error : " + error);
});
db.connection.on("open",function(){
	console.log("------- 数据库连接成功！-------");
});

var userSchema = new mongoose.Schema({
	account : {type : String, required : true},
	password : {type : String, required : true},
	time : {type:Date, default:Date.now}
})
var userModel = db.model("users", userSchema);

var itemSchema = new mongoose.Schema({
	// _userID : {type:mongoose.Schema.Types.ObjectId, ref:'users'},
	_folderID : {type:mongoose.Schema.Types.ObjectId, ref:'folders'},
	title : {type : String, required : true},
	account : String,
	password : String,
	email : String
})
// var itemModel = mongoose.model('items', itemSchema);


var folderSchema = new mongoose.Schema({
	_userID : {type:mongoose.Schema.Types.ObjectId, ref:'users'},
	folderName :{type : String, required : true},
	// items : [itemSchema]
	items : [mongoose.Schema.Types.Mixed]
})
var folderModel = mongoose.model('folders', folderSchema);


exports.myInsert = function(type, data){
	if(type == 'newItem'){
		return new Promise(function(res,rej){
			var pps = data.____pps;
			pps.splice(0,4);
			var schemaObj = {
				_folderID : {type:mongoose.Schema.Types.ObjectId, ref:'folders'},
				title : {type : String, required : true},
				account : String,
				password : String,
				email : String
			}
			for(var i=0; i < pps.length; i++){
				schemaObj['' + pps[i]] = {type : String};
			}
			var newItemSchema = new mongoose.Schema(schemaObj);
			var newItemModel = mongoose.model('items' + new mongoose.Types.ObjectId,newItemSchema);
			folderModel.findOne({_id : data._folderID}, function(err, doc){
				if(err){
					console.log('find err = ' + err);
					res('-1');
					// return;
				}
				var item = new newItemModel();
				item._folderID = data._folderID;
				item.title = data.标题;
				item.account = data.账号;
				item.password = data.密码;
				item.email = data.email;
				for(var i=0; i< pps.length; i++){
					item['' + pps[i]] = data['' + pps[i]];
					console.info('is pps used = ' + item);
				}
				doc.items.push(item);
				doc.save(function(err2){
					if(err2){
						console.log('save err = ' + err2);
						res('-1');
					}
					else{
						res('1')
					}
				})
			})
			
		});
	}
	else if(type == 'user'){
		return new Promise(function(res,rej){
			userModel.create(data, function(err,doc){
				if(err){
					console.log('create err : ' + err);
				}
				else{
					console.log('create success : ' + doc);
					res(doc);
				}
			});
		});
	}
	else if (type == 'folder'){
		return new Promise(function(res,rej){
			folderModel.findOne({folderName : data.folderName},function(err,doc){
				if(err){
					console.log('find err : ' + err);
					res('-1')
				}
				else if(doc != null){
					console.log('folder 已存在!');
					res('0')
				}
				else{
					var data1 = {
						_userID : data.userID,
						folderName : data.folderName
					}
					folderModel.create(data1, function(err,doc){
						if(err){
							console.log('create err : ' + err);
						}
						else{
							res('1')
						}
					})
				}
			})
		})
	}

}

exports.mySearch = function(type, limit, skip){
	var data = {};
	if(type == 'user'){
		return new Promise(function(res,rej){
			userModel.find(limit, skip, function(err,doc){
				if(err){
					console.log('find err : ' + err);
				}
				else{
					res(doc);
				}
			})
		})
	}
	else if(type == 'folder'){
		return new Promise(function(res,rej){
			folderModel.find(limit,skip, function(err,doc){
				if(err){
					console.log('find err: ' + err);
				}
				else{
					res(doc);
				}
			})
		})
	}
	else if(type == 'showItemDetail'){
		return new Promise(function(res,rej){
			folderModel.findOne({'_id' : limit._folderID},function(err,doc){
				if(err){
					console.log('find err : ' + err);
					res('-1');
				}
				else{
					var match = -1;
					for(var i=0; doc.items[i]; i++){
						if(doc.items[i]._id == limit._itemID){
							match = i;
							break;
						}
					}
					if(match < 0){
						res('-1');
					}
					else{
						res(doc.items[i]);
					}
				}
			})
		})
	}
	// return data;
}

exports.myDelete = function(type, limit){
	if(type == 'deleteItem'){
		return new Promise(function(res,rej){
			folderModel.findOne({
				"_id" : limit._folderID
			},function(err,doc){
				if(err){
					console.log('find err' + err);
					res('-1');
				}
				else{
					// console.log('doc.items.length = ' + doc.items.length);
					var match = -1;
					for(var i=0; doc.items[i] ; i++){
						if(doc.items[i]._id == limit._itemID){
							match = i;
							break;
						}
					}
					if(match >= 0){
						if(doc.items.length <= 1){
							folderModel.remove({'_id':doc._id},function(err){
								if(err){
									console.log('remove err : ' + err);
									res('-1');
								}
								else{
									res('1');
								}
							})
						}
						else{
							doc.items.splice(i,1);
							doc.save(function(err2){
								if(err2){
									console.log('save err : ' + err2);
									res('-1');
								}
								else{
									res('1');
								}
							})
						}

					}
					else{
						res('-1');
					}
				}
			})
		})
	}
}

exports.myUpdate = function(type, limit){
	if(type == 'saveItemChange'){
		return new Promise(function(res,rej){
			folderModel.findOne({_id: limit.folderID},function(err,doc){
				if(err){
					console.log('find err ' + err);
					res('-1');
				}
				else{
					var match = -1;
					for(var i=0; doc.items[i] ; i++){
						if(doc.items[i]._id == limit.itemID){
							match = i;
							break;
						}
					}
					if(match < 0){
						console.log('in saveItemChange, cant match');
						res('-1');
					}
					else{
						var pps = limit.tagsArr;
						var ppv = limit.tagsVal;
						var schemaObj = {
							_folderID : {type:mongoose.Schema.Types.ObjectId, ref:'folders'}
						}
						for(var i=0; i < pps.length; i++){
							schemaObj['' + pps[i]] = {type : String};
						}
						var newItemSchema = new mongoose.Schema(schemaObj);
						var newItemModel = mongoose.model('items' + new mongoose.Types.ObjectId,newItemSchema);
						var item = new newItemModel();
						item._folderID = limit.folderID;
						pps.map(function(value,index){
							if(ppv[index] != "")
								item['' + value] = ppv[index];
						})
						doc.items.splice(match, 1, item);
						//构造一个新的item 删除原来的并插入新的
						doc.save(function(err2){
							if(err2){
								console.log('save err : ' + err2);
								res('-1');
							}
							else{
								res('1');
							}
						})
					}
				}
			})
		})
	}

}

//给schema添加属性
// TestSchema.add({more:{type:Number, default:999}});


//给schema添实例加方法
// TestSchema.method('say',function(){
// 	console.log('trouble is a friend');
// })
// var model = mongoose.model('say', TestSchema);

// var lenka = new model();
// lenka.say();
// lenka.create({name:'2'},function(err,doc){
// 	console.log(doc);
// })

//添加静态方法
// TestSchema.static('findByName',function(name, callback){
// 	this.find({name: name}, callback);
// })
// var TestModel = db.model('test2', TestSchema);

// TestModel.findByName('lxk', function(err, doc){
// 	console.log(doc);
// })


// var TestEntity = new TestModel({
//     name : "helloworld",
//     age  : 28,
//     email: "helloworld@qq.com"
// });








//通过entity新增
// TestEntity.save(function(error,doc){
//   if(error){
//      console.log("error :" + error);
//   }else{
//      console.log(doc);
//   }
// });

//查找
// TestModel.find({"age":28},function(err,docs){
// 	if(err){
// 		console.log("err : " + err)
// 	}
// 	else{
// 		console.log(docs);
// 	}
// })

//通过model新增
// TestModel.create({name:"model_create", age:26}, function(err,doc){
// 	if(err){
// 		console.log(err);
// 	}
// 	else{
// 		console.log(doc);
// 	}
// } )

//更新一条数据
// var conditions = {name : 'helloworld'};
// var update = {$set : {age : 16}};

// TestModel.update(conditions,update,function(err){
// 	if(err){
// 		console.log(err)
// 	}
// 	else{
// 		console.log('update success');
// 	}
// })

//删除全部满足条件的文档
// var conditions = {age : {$gt : 0}};
// var conditions = {};
// TestModel.remove(conditions,function(err){
// 	if(err){
// 		console.log(err);
// 	}
// 	else{
// 		console.log('delete success!');
// 	}
// })

//如果新增的对象不符合model，则无视该条，其他的按照model来创建
// TestModel.create({whatever : 0, age:100},function(err,doc){
// 	if(err){
// 		console.log(err)
// 	}
// 	else{
// 		console.log(doc)
// 	}
// })

//给测试建立初始数据
// TestModel.create([
//                   { name:"test1", age:20 },
//                   { name:"test2", age:30 },
//                   { name:"test3", age:24 },
//                   { name:"test4", age:18 },
//                   { name:"test5", age:60 },
//                   { name:"test6", age:50, email:"t6@qq.com" },
//                   { name:"test7", age:40, email:"t7@163.com" },
//                   { name:"test8", age:27 },
//                   { name:"test9", age:27, email:"t9@yeah.net" },
//                   { name:"test10",age:65 }
//                  ], function(error,docs) {
//     if(error) {
//         console.log(error);
//     } else {
//         console.log('save ok');
//     }
// });

//find带过滤条件 1为显示  0不显示
// TestModel.find( {},{name:1, age:1,email:1, _id:0},function(err,docs){
// 	console.log(docs);
// });


//根据id来查找
// TestModel.findOne({},{name:1, age:1,email:1, _id:1},function(err,docs){
// 	// console.log(docs._id);
// 	TestModel.findById(docs._id, function(err,doc){
// 		console.log(doc)
// 	})
// });

// TestModel.find({},function(err,docs){
// 	if(err){
// 		console.log("err : " + err)
// 	}
// 	else{
// 		console.log(docs);
// 	}
// })

// var conditions = {
	
// };



// TestModel.find({},function(err,doc){
// 	console.log(doc)
// })
// TestModel.find( conditions,{name:1, age:1,email:1, _id:0},{skip:3},function(err,docs){
// 	console.log(docs);
// });

// TestModel.find( conditions,{name:1, age:1,email:1, _id:0},{limit:3},function(err,docs){
// 	console.log(docs);
// });