/**
 * Created by 程海平 on 2017/6/8 0008.
 */
var currip = window.location.host.split(":")[0];
var orgId= getUrlParam("orgId")==null?10012:getUrlParam("orgId");

var prefixUrl="http://"+currip+":8011/outer";
// var prefixUrl="http://192.168.1.141:8011/outer";
$(function (){
    $.fn.serializeJson = function () {
        var serializeObj = {};
        $(this.serializeArray()).each(function () {
            //if (this.value != "") {
                serializeObj[this.name] = this.value;
            //}
        });
        return serializeObj;
    };

	 $.extend($.fn.validatebox.defaults.rules, {  
		number: {  //验证必须输入整数
			validator: function(value, param) {  
				return /^([0-9]+)$/.test(value);  
	        },  
	        message: '请输入整数'  
	    },  
	    enlishOrNumber:{
	    	validator: function(value, param){
	    		var reg = /^[A-Za-z0-9]+$/;
	    		return reg.test(value);
	    	},
	    	message: '只能输入英文或数字'  
	    },
	    portDesc: {
	    	validator: function(value, param){
	    		var reg = /^[A-Za-z0-9@.]+$/;
	    		return reg.test(value);
	    	},
	    	message: '只能输入字母和数字,格式：**@ip后两位，如xiaoming@1.1'
	    },
	    ip: {
	    	validator: function(value, param){
	    		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
	    		return reg.test(value);
	    	},
	    	message: 'IP格式错误,格式：xxx.xxx.xxx.xxx'
	    },
	    ipMatch: { //ip地址可包含*
	    	validator: function(value, param){
	    		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)$/;
		    	return reg.test(value);
	    	},
	    	message: '格式错误，请输入IP(可使用*匹配所有)'
	    },
	    isMac:{
	    	validator: function(value, param){
	    		var reg = /^([0-9a-fA-F]{2})(([\s:-][0-9a-fA-F]{2}){5})$/i;
	    	    return reg.test(value);
	    	},
	    	message: '请输入正确的MAC地址'  
	    },
	    maxLength: {  
	        validator: function (value, param) {
	            return value.length <= param[0];
	        },
	        message: '长度不能超过{0}个字符'
	    },
	    checkChinese:{
	    	validator: function (value, param) {
	    		var reg = /^[^\u4e00-\u9fa5]{0,}$/i;
	    	    return reg.test(value);
	        },
	        message: '不能输入中文'
	    },
	    comboxValidate : {  //验证下拉框必选
	        validator : function(value, param) {  
	        	var data = $('#'+param[0]).combobox('getText') || '请选择';
	        	return data != '请选择';  
	         },  
	        message : "该输入项为必选项"  
	    }
	});
});

//搜索框enter建搜索
function enterSerach(id,callFunction){ 
	$(id).textbox('textbox').keydown(function (e){
		var e = e || window.event;
		if (e.keyCode == 13) {
			callFunction();
		}
	});		
}

//url：窗口调用地址，title：窗口标题，width：宽度，height：高度，shadow：是否显示背景阴影罩层  
function showMessageDialog(url, title, width, height, shadow) {  
    var content = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>';  
    var boarddiv = '<div id="msgwindow" title="' + title + '" style="overflow:hidden;"></div>'//style="overflow:hidden;"可以去掉滚动条  
    $(document.body).append(boarddiv);  
    var win = $('#msgwindow').dialog({  
        content: content,  
        width: width,  
        height: height,  
        modal: shadow,  
        title: title,  
        onClose: function () {  
            $(this).dialog('destroy');//后面可以关闭后的事件  
        }  
    });  
    win.dialog('open');  
} 

//获取url中的传参，入参为参数名
function getUrlParam(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r!=null) return unescape(decodeURI(r[2])); return null; //返回参数值
}

//combobox数据加载
function loadComboboxData(data,classSelector,name,id,changeFunc,editable){
	$(classSelector).combobox({
        data: data,
        textField: name,
        valueField: id,
        editable:editable == null ? false:true,
        onLoadSuccess: function () { //加载完成后,设置选中第一项
            var val = $(this).combobox('getData');
            for (var item in val[0]) {
                if (item == id) {
                    $(this).combobox('select', val[0][item]);
                }
            }
        },
        onChange:function (newValue,oldValue) {
            if('undefined'!=changeFunc && null!=changeFunc) changeFunc(newValue);
        }
    });
}
//ajax get请求封装
function ajaxGetPostRequest(url,type,param,async,callback,errorback){
    if(null==param){
        $.ajax({
            url:url,
            type:type,
            async:async,
            dataType:'json',
            success:function (data) {
                callback(data);
            },
            error:function (e) {
                $.messager.show({ title: "提示", msg:JSON.stringify(e)});

            }
        });
    }else{
        $.ajax({
            url:url,
            type:type,
            data:param,
            async:async,
            dataType:'json',
            success:function (data) {
                callback(data);
            },
            error:function (data) {
            	$.messager.show({ title: "提示", msg:"操作失败"});
            },
            error:function (data) {
                errorback(data);
            },
            error:function (e) {
                $.messager.show({ title: "提示", msg:JSON.stringify(e)});
            }
        });
    }
}

//ajax get请求封装
function ajaxJsonpRequest(url,type,param,async,callback){
    if(null==param){
        $.ajax({
            url:url,
            type:type,
            async:async,
            crossDomain:true,
            beforeSend:function (req) {
                req.setRequestHeader("Access-Control-Allow-Origin", "*");
                req.setRequestHeader("Access-Control-Allow-Methods", "POST");
                req.setRequestHeader("Access-Control-Allow-Headers", "x-requested-with,content-type");
            },
            success:function (data) {
                callback(data);
            },
            error:function (data) {
                $.messager.show({ title: "提示", msg:"出现了错误."});
            }
        });
    }else{
        $.ajax({
            url:url,
            type:type,
            data:param,
            async:async,
            dataType:'json',
            crossDomain:true,
            success:function (data) {
                callback(data);
            },
            error:function (data) {
                $.messager.show({ title: "提示", msg:"出现了错误."});
            }
        });
    }
}

/**
 * ajax后台请求
 * @param url  请求URL
 * @param params 请求传参
 * @param backFunction 请求之后函数处理
 * @param isAsync 是否为异步请求
 * @param type 请求类型，为GET或POST
 * @returns
 */
function ajaxRequest(url,params,backFunction,type,isAsync){
	type = type || "GET";
    if(isAsync == null) isAsync = true;
    
    $.ajax({
        type : type,
        url: url,
        async: isAsync,
        data: params,
        success : backFunction,
        failure : function(resp, opt) {
            alert("加载数据失败！");
        }
    });
}

// 验证是否全是数字
function numberCheck(s) {
    var p = /^[0-9]{1,20}$/;
    if (!p.exec(s)) return false;
    return true;
}

//验证ip
function ipCheck(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return reg.test(ip);
}

//验证MAC
function macCheck(mac) {
    var reg = /^([0-9a-fA-F]{2})(([\s:-][0-9a-fA-F]{2}){5})$/;
    return reg.test(mac);
}

//验证MAC
var yzmac = function (mactxt) {
    return /^([0-9a-fA-F]{2})(([\s:-][0-9a-fA-F]{2}){5})$/i.test(mactxt);
};

//array-->json
function parseToJson(array){
    var json = {};
    $.each(array,function(){
        if(json[this.name]){
            if(!json[this.name].push){
                json[this.name]=[json[this.name]];
            }
            json[this.name].push(this.value || '');
        }else{
            json[this.name]=this.value || '';
        }
    });
    return json;
}
//解析json对象到form表单
function parseJson2Form($form,json) {
}


//对Date的扩展，将 Date 转化为指定格式的String
//月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
//年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
//例子：
//(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
//(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function format(fmt) { //author: meizz
    var o = {
       "M+": this.getMonth() + 1, //月份
       "d+": this.getDate(), //日
       "h+": this.getHours(), //小时
       "m+": this.getMinutes(), //分
       "s+": this.getSeconds(), //秒
       "q+": Math.floor((this.getMonth() + 3) / 3), //季度
       "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
       if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
//时间枨式化
function formatDate(ns) {
    return new Date(parseInt(ns)).Format('yyyy-MM-dd hh:mm:ss');
}
function formatDate1(ns) {
    return new Date(parseInt(ns)).Format('yyyy-MM-dd hh:mm');
}

//easyui combobox判断文本框是否为下来选项
function isComboboxValue(obj){
	var _options = $(obj).combobox('options');  
	var _data = $(obj).combobox('getData');  //下拉框所有选项   
	var _value = $(obj).combobox('getValue'); //用户输入的值   
	var _b = false; //标识是否在下拉列表中找到了用户输入的字符   
	for (var i = 0; i < _data.length; i++) {  
	    if (_data[i][_options.valueField] == _value) {  
	        return true;
	    }  
	}  
	  return false;
}

function onHidePanel(obj){
	$(obj).combobox({
    	onHidePanel :function(){
    		var _options = $(this).combobox('options');  
    		var _data = $(this).combobox('getData');  //下拉框所有选项   
    		var _value = $(this).combobox('getValue'); //用户输入的值   
    		var _b = false; //标识是否在下拉列表中找到了用户输入的字符   
    		for (var i = 0; i < _data.length; i++) {  
    		    if (_data[i][_options.valueField] == _value) {  
    		        _b=true;  
    		        break;  
    		    }  
    		}  
    		if(!_b){  
    		    $(this).combobox('setValue', _data[0][_options.valueField]);  
    		}
    	}
    });
}
//转换ip到int值
var REG =/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
function ipToInt(ip){
    var result = REG.exec(ip);
    if(!result) return -1;
    return (parseInt(result[1]) << 24
    | parseInt(result[2]) << 16
    | parseInt(result[3]) << 8
    | parseInt(result[4]));
}

//easyui textbox 输入mac格式化
function formatMac(id){
	$('#'+id).next('span').find('input').blur(function(){
		var mac = $('#'+id).textbox('getValue').replace(/[^A-Za-z0-9]/ig,"");
		if(mac.length >= 3){
			var tmnMac = '';
			for(var i=0;i< mac.length;i++){
				tmnMac += mac[i];
			    if(i % 2 == 1 && i != mac.length-1) tmnMac += ':';
			} 
			$('#'+id).textbox('setValue',tmnMac);
		}
	});
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}