"use strict"
var rce = React.createElement.bind();
React.initializeTouchEvents(true);  //如果需要在手机或平板等触摸设备上使用 React，需要调用 React.initializeTouchEvents(true); 启用触摸事件处理。



var total = React.createClass({displayName: "total",
	getInitialState : function(){
		return{
			account : '',
			password : ''
		}
	},
	accountChange : function(e){
		this.setState({account : e.target.value});
	},
	passwordChange : function(e){
		this.setState({password : e.target.value})
	},
	handleSignup : function(){
		if(this.state.account == ''){
			this.setState({account : '账号不能为空！'});
		}
		else if(this.state.password == ''){
			this.setState({password: '密码不能为空！'});
		}
		else{
			$.post("postMethod/signup", {account:this.state.account, password: this.state.password}, function(data,status){
				if(data.ok == '1'){
					window.location = "index.html";
				}
				else{
					alert('注册失败');
				}
			}.bind(this))
		}
	},
	handleSignin : function(){
		if(this.state.account == ''){
			this.setState({account : '账号不能为空！'});
		}
		else if(this.state.password == ''){
			this.setState({password: '密码不能为空！'});
		}
		else{
			$.post("postMethod/signin", {account:this.state.account, password: this.state.password}, function(data,status){
				if(data.ok == '1'){
					window.location = "index.html";
				}
				else{
					alert('登陆失败');
				}
			}.bind(this))
		}
	},

	render : function(){
		return (
			rce("div", {"data-role":"page", id:"pageOne"},
				rce("div", {"data-role" : "content"},
					rce('div',null,
						rce('img',{src:"tz.jpg", "className" : "tzImg"})
					),
					rce('div',{'className':'ui-field-contain'},
							rce('input',{'type':'text', 'name':'account', 'id':'account',  'placeholder':'user.account', 'value': this.state.account, 'onChange':this.accountChange}),
							rce('input',{'type':'text', 'name':'password', 'id':'password',  'placeholder':'user.password','value': this.state.password, 'onChange':this.passwordChange}),
							rce('div',{'data-role':'controlgroup'},
								rce('input',{'type':'button', 'value':'注册', 'data-mini':'true', 'onClick':this.handleSignup, 'style':{'backgroundColor':'green'}}),
								rce('input',{'type':'button', 'value':'登陆', 'data-mini':'true', 'onClick':this.handleSignin})
							)
					)
				)
			)
		);
	}

})

React.render(rce(total,null), document.body);