"use strict"
var rce = React.createElement.bind();
React.initializeTouchEvents(true);  //如果需要在手机或平板等触摸设备上使用 React，需要调用 React.initializeTouchEvents(true); 启用触摸事件处理。



var leftPanel = React.createClass({displayName : "leftPanel",
	getInitialState : function(){
		return {
			// account : ''
		}
	},
	//在初始化渲染执行之后立刻调用一次
	componentDidMount: function(){
	},
	//在组件接收到新的 props 的时候调用。在初始化渲染的时候，该方法不会调用。
	componentWillReceiveProps : function(nextProps){
		// this.setState({account: nextProps.account});
	},
	handleSignout : function(){
		$.get('getMethod/signout',function(data,status){
			if(data.ok == 1){
				window.location = "log.html";
			}
			else{
				alert('sb!error');
			}
		}.bind(this));
	},
	render : function(){
		return(
			rce("div",{"data-role": "panel", "id":"myLeftPanel", 'data-display':'push'},
				rce("h2",null, "user : " + this.props.account),
				// rce("p",null,"面板内容"),
				rce("ul", {"data-role":"listview", "ref":"listView"},
					rce('li',{'data-icon':'false'},
						// rce('a',{'href':'#'},'退出登陆')
						rce('a',{'className':'ui-btn ui-mini', 'onClick':this.handleSignout},'退出当前账号' )
						// rce('button',null,'退出登陆')
						// rce('p',null,'退出当前账号')
					)
				)
			)
		);
	}
});




var contentMain = React.createClass({displayName:"contentMain",
	getInitialState : function(){
		return {
			folders : []
		}
	},
	//发送post请求  删除item
	handleClickOne : function(e){
		var itemid = $(e.target).attr('data-itemid');
		var folderid = $(e.target).attr('data-folderid');
		$.post('postMethod/deleteItem',{'itemID' : itemid, 'folderID': folderid}, function(data,status){
			// console.info(data);
			if(data.ok == '-1'){
				alert('sb!err~');
			}
			else if(data.ok == '1'){
				window.location = 'index.html';
			}
			else{
				alert('somethingWrong~QAQ');
			}
		})

	},
	handleClickTwo : function(e){
		var itemid = $(e.target).attr('data-itemid');
		var folderid = $(e.target).attr('data-folderid');
		this.props.onPageThreeShow(folderid, itemid);
		$.mobile.changePage('#pageThree','slide');
	},
	shouldComponentUpdate : function(nextProps, nextState){
		if(nextState.hasUiBlockB !=  this.state.hasUiBlockB){
			// console.log(   $(this.refs.uiBlockB.getDOMNode())  );
		}
		return true;
	},
	componentWillReceiveProps : function(nextProps){
		$.post("postMethod/getFolder", {'_userID':nextProps.userID}, function(data,status){
			var _folders = data.data.map(function(value,index){
				return {
					folderName :  value.folderName,
					folderID : value._id,
					items : value.items
				}
			})
			var _folderIDs = data.data.map(function(value,index){
				return value._id;
			})
			// this.setState({folders: _folders, folderIDs : _folderIDs});
			this.setState({folders: _folders});
		}.bind(this));


	},
	componentDidUpdate : function(prevProps, prevState){
		//如果state.folders发生改变    jqm需要刷新
		if(this.state.folders != prevState.folders){
			$( this.refs.myCollapsibleset.getDOMNode() ).collapsibleset();

			var t = $(this.refs.myCollapsibleset.getDOMNode()).find('ul');
			t.listview()
			var u = $(this.refs.myCollapsibleset.getDOMNode()).find('.ui-block-b');
			u.on('swipeleft',function(e){
				var tg = $(e.target)
				if($(e.target).is('p')){
					tg = $(e.target).parent()
				}
				tg.animate({width:'45%'},'fast');
				tg.next().animate({width:'20%'},'fast');
				tg.next().next().animate({width:'20%'},'fast');
				
			});
			u.on('swiperight',function(e){
				var tg = $(e.target)
				if($(e.target).is('p')){
					tg = $(e.target).parent()
				}
				tg.animate({width:'45%'},'fast');
				tg.next().animate({width : '0%'},'fast');
				tg.next().next().animate({width : '0%'},'fast');
			});

		}
	},
	render : function(){
		var folders = this.state.folders;
		// var handleCollapse = this.handleCollapse;

		var lists = folders.map(function(value,index){
			return    rce('div',{'style':{'color':'red'}, 'key': 'contentMain' + value.folderName,'data-role':'collapsible', 'data-inset':'false', 'data-mini':'false', 'data-collapsed':'true'},
							rce('h4',null ,value.folderName),
							rce(itemListView, {
								'data-role' : 'listview', 'ref':'listView',
								'items':value.items, 'folderID':value.folderID, 
								'handleClickOne' : this.handleClickOne, 'handleClickTwo':this.handleClickTwo,
								'onPageTwoShow' : this.props.onPageTwoShow
							})

					  )
		}.bind(this));
		return(
			rce('div',{'data-role':'collapsibleset', 'ref':'myCollapsibleset'},
				lists
			)
		);
	}
});


var itemListView = React.createClass({displayName:'itemListView',
	handleTouch : function(e){
		this.props.onPageTwoShow(this.props.folderID);
	}, 
	render : function(){
		if(this.props.items[0] == null) {
			return  rce("ul", {"data-role":"listview", "ref":"listView"}, 
						rce('li',{'data-icon':'false','style':{'padding':'0', 'backgroundColor':'white'}},
							rce('a',{'href':'#pageTwo','data-transition':'slideup','folderID':this.props.folderID,'style':{'height':'40px','backgroundColor':'#FCFFF5','padding':'0'}, onTouchStart : this.handleTouch}, this.props.folderID)
						)
					)
		}
		else{
			var ii = this.props.items.map(function(value,index){
				return (
					rce('li',{'key':'items' + value._id,'style':{'padding':'0','backgroundColor':'white'}},
						rce('div',{'className':'ui-grid-b', 'style':{'height':'73.75px'}},
							rce('div',{'className':'ui-block-a', 'style':{'width':'15%'}}),
							rce('div',{'ref':'uiBlockB','className':'ui-block-b', 'style':{'width':'45%', 'height':'73.75px','backgroundColor':'white'}},
								rce('p',null,
									rce('strong',null,value.title )
								),
								rce('p',null,'账号：' + value.account),
								rce('p',null,'密码：' + value.password)

							),
							rce('div',{'data-itemid':value._id,  'data-folderid':value._folderID , 'className':'ui-block-c world', 'style':{'float':'right','width':'0%', 'height':'73.75px','backgroundColor':'#91AA9D'}, onClick:this.props.handleClickOne}),
							rce('div',{'data-itemid':value._id,  'data-folderid':value._folderID , 'className':'ui-block-c', 'style':{'float':'right','width':'0%','height':'73.75px','backgroundColor':'#D1DBBD'}, onClick : this.props.handleClickTwo})
						)
					)
				);
			}.bind(this));
			return rce("ul", {"data-role":"listview", "ref":"listView"}, 
						ii,
						rce('li',{'data-icon':'false','style':{'padding':'0', 'backgroundColor':'white'}},
							rce('a',{'href':'#pageTwo','data-transition':'slideup','folderID':this.props.folderID,'style':{'height':'40px','backgroundColor':'#FCFFF5','padding':'0'}, onTouchStart : this.handleTouch}, this.props.folderID)
						)
					)
		}

	}

})


var ppUp = React.createClass({displayName:"ppUp",
	getInitialState : function(){
		return {
			folderName : ''
		}
	},
	folderNameChange : function(e){
		this.setState({folderName : e.target.value});
	},
	handleAddNewFolder : function(){
		if(this.state.folderName == ''){
			this.setState({'folderName' : '名称不能为空！'});
		}
		else{
			// window.location = 'index.html'
			$.post("postMethod/newFolder", {'folderName':this.state.folderName, 'userID' : this.props.userID}, function(data,status){
				if(data.ok == '1'){
					window.location = "index.html";
				}
				else if(data.ok == '0'){
					this.setState({'folderName' : '名称重复QAQ'});
				}
				else{
					this.setState({'folderName' : 'something wrong~~QAQ'});
				}
			}.bind(this))
		}
	},
	render : function(){
		return (
			rce('div',{'className':'ui-content','data-role':'popup', 'id':'myPopup','data-overlay-theme':'a','style':{'textAlign':'center'}},
				rce('h1',null,'新分类'),
				rce('input',{'type':'text', 'name':'inputFolderName', 'id':'inputFolderName',  'placeholder':'名称', 'value': this.state.folderName, 'onChange':this.folderNameChange}),
				rce('input',{'type':'button', 'value':'添加', 'data-mini':'false', 'onClick':this.handleAddNewFolder})
			)
		);
	}

})


var pageOne = React.createClass({displayName:"pageOne",
	getInitialState : function(){
		return {
			
		}
	},
	//在初始化渲染执行之后立刻调用一次
	componentDidMount : function(){
		
	},
	render : function(){
		return(
			rce("div", {"data-role":"page", id:"pageOne"},
				rce(leftPanel,{'account':this.props.account}),
				rce("div", {"data-role" : "header"},
						rce("h1",null,""+this.props.account),
						rce("a",{href:"#myLeftPanel", "data-role":"button","data-icon":"grid", "data-iconpos":"notext"}, "菜单"),
						rce("a",{'data-transition':'pop','data-position-to':'window',href:"#myPopup",'data-rel':'popup', "data-icon":"plus", "data-iconpos":"notext"}, "新增")
						// rce(daoHang,{"ref":"daoHang", "updateState":this.handleContentChange})
				),

				rce("div", {"data-role" : "content"},
						// rce('p',null,'account = ' + this.props.account),
						rce(contentMain,{"ref":"chooseContent",'account' : this.props.account, 'userID':this.props.userID, 'onPageTwoShow': this.props.onPageTwoShow, 'onPageThreeShow' : this.props.onPageThreeShow}),
						rce(ppUp,{'className':'ui-content','account':this.props.account, 'userID':this.props.userID})
						// rce(ppUpDetail,{'folderID':this.state.ppUpFolderID, 'itemID':this.state.ppUpItemID})
						
				)
			)
		);
	}
});



var ppUp1 = React.createClass({displayName:"ppUp1",
	getInitialState : function(){
		return {
			propertyName : ''
		}
	},
	propertyNameChange : function(e){
		this.setState({propertyName : e.target.value});
	},
	handleAddNewProperty : function(){
		if(this.state.propertyName == ''){
			this.setState({'propertyName' : '名称不能为空！'});
		}
		else{
			this.props.handleXinZeng(this.state.propertyName);
			window.location = '#pageTwo'
		}
	},
	render : function(){
		return (
			rce('div',{'className':'ui-content','data-role':'popup', 'id':'myPopup1','data-overlay-theme':'a','style':{'textAlign':'center'}},
				rce('h1',null,'new Tag'),
				rce('input',{'type':'text', 'name':'inputFolderName', 'id':'inputFolderName',  'placeholder':'名称', 'value': this.state.propertyName, 'onChange':this.propertyNameChange}),
				rce('input',{'type':'button', 'value':'添加', 'data-mini':'false', 'onClick':this.handleAddNewProperty})
			)
		);
	}
});


var pageTwo = React.createClass({displayName:'pageTwo',
	getInitialState : function(){
		if(!this.props.folderID){
			window.location = '#pageOne'
		}
		return {
			properties : ['标题','账号','密码','email'],
			哈哈 : '123'
		}
	},
	componentWillReceiveProps : function(nextProps){
		// $.post("postMethod/getNewItem")
		// $.post("postMethod/getFolder", {'_userID':nextProps.userID}, function(data,status){
		// 	var _folders = data.data.map(function(value,index){
		// 		return {
		// 			folderName :  value.folderName,
		// 			folderID : value._id,
		// 			items : value.items
		// 		}
		// 	})
		// 	var _folderIDs = data.data.map(function(value,index){
		// 		return value._id;
		// 	})
		// 	// this.setState({folders: _folders, folderIDs : _folderIDs});
		// 	this.setState({folders: _folders});
		// }.bind(this));
	},
	componentDidUpdate : function(){
		var t = $(this.refs.pageTwo.getDOMNode()).find('input');
		t.textinput();
	},
	handleXinZeng : function(name){
		// if(this.)
		var pps = this.state.properties;
		for(var i=0; i<pps.length; i++){
			if(name == pps[i]){
				alert('sb!repeat');
				return;
			}
		}
		pps.push(name);
		this.setState({properties : pps})

	},
	handleTiJiao : function(){
		// console.info( $('.for_handleTijiao' + 1).val() );
		var pps = this.state.properties;
		var vals = [];
		for(var i=0 ; i<pps.length; i++){
			if($('.for_handleTijiao' + i).val() == ''   && i < 3){
				alert('前三项不能为空！');
				return;
			}
			vals.push( $('.for_handleTijiao' + i).val() );
		}
		$.post('postMethod/getNewItem', {'ppsArray' : pps, 'valsArray' : vals, 'folderID' : this.props.folderID}, function(data, status){
			if(data.ok == '-1'){
				alert('insert fail QAQ');
			}
			else if(data.ok == '1'){
				window.location = 'index.html';
			}
			else{
				alert('somethingWrong QAQ!!!');
			}
		})
	},
	handleBack : function(){
		history.back();
	},
	render : function(){
		var properties = this.state.properties;
		var pp = properties.map(function(value,index){
			return (
				rce('div',{'key':'property' + index,'className':'ui-grid-a'},
						rce('div',{'className':'ui-block-a','style':{'width':'30%'}},
							rce('p',null,value)
						),
						rce('div',{'className':'ui-block-b','style':{'width':'70%'}},
				// rce('input',{'type':'text', 'name':'inputFolderName', 'id':'inputFolderName',  'placeholder':'名称', 'value': this.state.propertyName, 'onChange':this.propertyNameChange}),
							rce('input',{'type':'text','className': 'for_handleTijiao' + index})
						)
				)
			);
		})
		return (
			rce('div',{'data-role':'page', 'id':'pageTwo', 'ref':'pageTwo'},
				rce('div',{'data-role':'content'},
					// rce('p', null, 'account in pageTwo = ' + this.props.account),
					// rce('p', null, 'folderID in pageTwo = ' + this.props.folderID),
					pp,
					// rce('a',{'href':'#pageOne','className':'ui-btn ui-btn-inline','style': {'width':'20%', 'marginRight':'0', 'marginLeft':'6%'}},'返回'),
					rce('a',{'onClick':this.handleBack,'className':'ui-btn ui-btn-inline','style': {'width':'20%', 'marginRight':'0', 'marginLeft':'6%'}},'返回'),
					rce('a',{'data-transition':'pop','data-position-to':'window',href:"#myPopup1",'data-rel':'popup', 'className':'ui-btn ui-btn-inline', 'style' : {'width' : '20%' ,'marginRight':'0', 'marginLeft':'0'}},'新增'),
					rce('a',{'className':'ui-btn ui-btn-inline','onClick':this.handleTiJiao, 'style' : {'width' : '20%', 'marginLeft':'0'}},'提交'),
					rce(ppUp1,{'className':'ui-content', 'handleXinZeng' : this.handleXinZeng})

					// rce('div',{'className':'ui-grid-b', 'style':{'height':'73.75px'}},
					// 	rce('div',{'className':'ui-block-a', 'style':{'width':'15%'}}),
					// 	rce('div',{'ref':'uiBlockB','className':'ui-block-b', 'style':{'width':'45%', 'height':'73.75px','backgroundColor':'white'}},
					// 		rce('p',null,
					// 			rce('strong',null,value.title )
					// 		),
					// 		rce('p',null,'账号：' + value.account),
					// 		rce('p',null,'密码：' + value.password)

					// 	),
					// 	rce('div',{'folderID' : value._folderID,'itemID' : value._id,'className':'ui-block-c', 'style':{'float':'right','width':'0%', 'height':'73.75px','backgroundColor':'#91AA9D'}, onClick:this.props.handleClickOne}),
					// 	rce('div',{'folderID' : value._folderID,'itemID' : value._id,'className':'ui-block-c', 'style':{'float':'right','width':'0%','height':'73.75px','backgroundColor':'#D1DBBD'}, onClick : this.props.handleClickTwo})
					// )
				)
			)
		);
	}
})


var ppUp2 = React.createClass({displayName:"ppUp2",
	getInitialState : function(){
		return {
			propertyName : ''
		}
	},
	propertyNameChange : function(e){
		this.setState({propertyName : e.target.value});
	},
	handleAddNewProperty : function(){
		if(this.state.propertyName == ''){
			this.setState({'propertyName' : '名称不能为空！'});
		}
		else{
			this.props.handleXinZeng(this.state.propertyName);
			window.location = '#pageThree'
		}
	},
	render : function(){
		return (
			rce('div',{'className':'ui-content','data-role':'popup', 'id':'myPopup2','data-overlay-theme':'a','style':{'textAlign':'center'}},
				rce('h1',null,'new Tag'),
				rce('input',{'type':'text', 'name':'inputFolderName', 'id':'inputFolderName',  'placeholder':'名称', 'value': this.state.propertyName, 'onChange':this.propertyNameChange}),
				rce('input',{'type':'button', 'value':'添加', 'data-mini':'false', 'onClick':this.handleAddNewProperty})
			)
		);
	}
});

var pageThree = React.createClass({displayName : 'pageThree',
	getInitialState : function(){
		if(!this.props.folderID || !this.props.itemID){
			window.location = '#pageOne'
		}
		return {
			tagsArr : [],
			tagsVal : []
		}
	},
	componentDidUpdate : function(){
		var t = $(this.refs.pageThree.getDOMNode()).find('input');
		t.textinput();
	},
	componentWillReceiveProps : function(nextProps){
		// console.log('this' + this.props.folderID);
		 // nextProps.folderID
		 if(nextProps.itemID != this.props.itemID){
			$.post('postMethod/showItemDetail',{'folderID': nextProps.folderID, 'itemID' : nextProps.itemID},function(data,status){
				// console.log(data);
				if(data.ok == '-1'){
					alert('somethingWrong QAQ!!!');
				}
				else{
					this.setState({
						tagsArr : data.tagsArr,
						tagsVal : data.tagsVal
					})
				}
			}.bind(this))
		 }
	},
	inputOnChange : function(e){
		var index = $(e.target).attr('data-index');
		var tagsValTemp = this.state.tagsVal;
		tagsValTemp[index] = e.target.value;
		this.setState({tagsVal : tagsValTemp});

	},
	handleBack : function(){
		history.back();
	},
	handleSave : function(){
		var postData = {
			folderID : this.props.folderID,
			itemID : this.props.itemID,
			tagsArr : this.state.tagsArr,
			tagsVal : this.state.tagsVal
		}
		if(postData.tagsVal[0] && postData.tagsVal[1] && postData.tagsVal[2]){
			$.post("postMethod/saveItemChange",postData, function(data,status){
				if(data.ok == '-1'){
					alert('update Wrong ~ QAQ');
				}
				else if (data.ok == '1'){
					window.location = "index.html";
				}
				else{
					alert('something Wrong ~ QAQ');
				}
			})
		}
		else{
			alert('前三项不能为空！');
		}

			
	},
	handleXinZeng : function(name){
		var pps = this.state.tagsArr;
		var ppv = this.state.tagsVal;
		for(var i=0; i<pps.length; i++){
			if(name == pps[i]){
				alert('sb!repeat');
				return;
			}
		}
		pps.push(name);
		ppv.push("");
		this.setState({tagsArr : pps, tagsVal : ppv})
	},
	render : function(){
		var tagsArr = this.state.tagsArr;
		var tagsVal = this.state.tagsVal;
		var inputOnChange = this.inputOnChange;
		var tt = tagsArr.map(function(value, index){
			return(
				rce('div',{'key':'tag' + index, 'className': 'ui-grid-a'},
					rce('div',{'className': 'ui-block-a', 'style': {'width' : '30%'}},
						rce('p',null, value)
					),
					rce('div',{'className':'ui-block-b', 'style':{'width':'70%'}},
						rce('input',{'data-index':index,'type':'text', 'className':'for_handleBaoCun' + index, 'value' : tagsVal[index], 'onChange': inputOnChange})
					)
				)

			);
		})
		return (
			rce('div',{'data-role':'page', 'id':'pageThree', 'ref':'pageThree'},
				rce("div", {"data-role" : "header"},
						rce("h1",null,""),
						rce("a",{'onClick':this.handleBack,"data-role":"button","data-icon":"back", "data-iconpos":"notext"}, "返回"),
						rce("a",{"onClick":this.handleSave, "data-icon":"check", "data-iconpos":"notext"}, "保存")
				),
				
				rce('div',{'data-role':'content'},
					tt,
					rce('a',{'data-transition':'pop','data-position-to':'window',href:"#myPopup2",'data-rel':'popup', 'className':'ui-btn'},'新增'),
					rce(ppUp2,{'className':'ui-content', 'handleXinZeng' : this.handleXinZeng})
				)
			)
		);
	}
})

var total = React.createClass({displayName:"total",
	getInitialState : function(){
		return {
			account : '',
			userID : '',
			pageTwoFolderId : '',
			pageThreeFolderId : '',
			pageThreeItemId : ''

		}
	},
	//初始化渲染之后执行 在接受props之前  可以用来执行ajax请求
	componentDidMount : function(){
		$.get("getMethod/getAccount",function(data,status){
			this.setState({account : data.account, userID: data.userID});
		}.bind(this));

	},
	onPageTwoShow : function(folderID){
		this.setState({'pageTwoFolderId': folderID});
	},
	onPageThreeShow : function(folderID, itemID){
		this.setState({'pageThreeFolderId':folderID, 'pageThreeItemId': itemID});
	},
	render : function(){
		return (
			rce("div",null,
				rce(pageOne,{'account' : this.state.account, 'userID':this.state.userID, 'onPageTwoShow' : this.onPageTwoShow, 'onPageThreeShow' : this.onPageThreeShow }),
				rce(pageTwo,{'account':this.state.account, 'userID':this.state.userID, 'folderID':this.state.pageTwoFolderId}),
				rce(pageThree,{'folderID':this.state.pageThreeFolderId, 'itemID' : this.state.pageThreeItemId})
			)
		);
	}
});

React.render(rce(total,null), document.body);

