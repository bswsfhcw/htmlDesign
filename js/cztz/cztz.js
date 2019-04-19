
var itemData = {};
var main = null;
$(function() {
	main = new Main();
	main.init();
	initTree();
	getFacIds(); //获取厂站下拉列表
	var interval = new Interval();
	setTimeout(function() {
		interval.initInterval();
	}, 1000);
});
//添加厂站
function addFac() {
	//添加厂站先清除添加框内的数据
	$("#facName").val("");
	$("#facId").val("");
	var index = layer.open({
		type: 1,
		title: '添加厂站',
		anim: 4,
		area: ['600px', '300px'],
		content: $("#add_fac"),
		btn: ['确认', '关闭'],
		yes: function() {
			var facName = $("#facName").val();
			var facId = $("#facId").val();
			if(facName == "") {
				layer.msg("请输入厂站名称", {
					icon: 2,
					time: 1500
				});
				return;
			}
			/*if ( facId == "") {
				layer.msg("请输入厂站ID", {
					icon : 2,
					time : 1500
				});
				return;
			}*/
			$.ajax({
				url: COMMO_URL + "/facInfo/addFac.do",
				type: "POST",
				dataType: "json",
				data: {
					facName: $("#facName").val(),
					facId: $("#facId").val()
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						});
						//						layer.close(index);
					} else {
						layer.msg(data.msg, {
							icon: 2,
							time: 1500
						});
					}
					initTree();
					//					$('#czDevicesTable').bootstrapTable('refresh');
					//					getFacIds();
				},
			})
		}
	});
}
//ztree
var initTree = function(id) {
	$.post(COMMO_URL + '/facInfo/facTree.do?', function(result) {
		var t = $("#tree_left");
		t = $.fn.zTree.init(t, setting, result.list);
		var treeObj = $.fn.zTree.getZTreeObj("tree_left");
		treeObj.expandAll(treeObj);
	}, 'json');

}
//ztree配置
var setting = {
	check: {
		enable: true,
		chkStyle: "checkbox"
	},
	view: {
		showIcon: true,
		showTitle: false // 2 这个开关也要打开，默认是关闭的
	},
	data: {
		key: {
			url: "myurl", // 更改默认的超链接获取属性,取消超链接
			//title:"id"
		},
		simpleData: {
			enable: true,
			idKey: "id",
			pIdKey: "pId",
			rootPId: ""
		}
	},
	edit: {
		enable: false,
		showRemoveBtn: false
	},
	callback: {
		beforeClick: beforeClick,
		onDblClick: updateFac,
		onClick: onClick,
		onRemove: deleteFac,
		//onDblClick : getEnginneRoomInfo
	}
};

function beforeClick(treeId, treeNode) {
	return(treeNode.click != false);
}
//ztree 点击事件
function onClick(event, treeId, treeNode) {
	var flag = treeNode.flag;
	var children = treeNode.children;
	$('#facQuery').val(treeNode.id);
	$('#czDevicesTable').bootstrapTable('refresh');
}

//屏柜展示table
var Interval = function() {
	var t1 = new Object();
	t1.initInterval = function() {
		$('#czDevicesTable').bootstrapTable({
			url: COMMO_URL + '/facInfo/czDevices.do',
			method: 'POST',
			dataType: 'json',
			contentType: "application/x-www-form-urlencoded",
			cache: false,
			toolbar: '#equip_toolbar',
			striped: true, // 是否显示行间隔色
			showColumns: true,
			queryParams: t1.intervalQueryParams,
			queryParamsType: '',
			pagination: true,
			sidePagination: "server",
			paginationLoop: true,
//			showRefresh: true,
			paginationPreText: '上一页',
			paginationNextText: '下一页',
			pageNumber: 1, // 初始化加载第一页，默认第一页
			pageSize: 10, // 每页的记录行数（*）
			pageList: [15, 30, 100, 200],
//			showExport: true,
//			exportDataType: 'all',
//			exportTypes: ['excel'], //导出程excel格式
			clickToSelect: true,
			columns:mycolumn ,
			onClickRow: function(row) {
				return false;
			},
			onLoadSuccess: function(row) {
				console.log("onLoadSuccess:" + JSON.stringify(row));
				$('.bs-checkbox').css("vertical-align", "middle");
				$('#czDevicesTable').bootstrapTable('uncheckAll');
				$(".fixed-table-container tbody tr").removeAttr("class");
			},
			onLoadError: function(status, data) {
				console.log("error:" + JSON.stringify(data));
			}
		});
	};

	/**
	 * 获取当前登录用户的id
	 */
	t1.intervalQueryParams = function(params) {
		var temp = {
			pageNumber: this.pageNumber,
			pageSize: this.pageSize,
			deviceType:$('#deviceType').val(),
			fac: $('#facQuery').val(),
			name: $('#name').val(),
			_: $.now()
		};
		return temp;
	};
	return t1;
};

//删除厂站
function deleteFac() {
	var treeObj = $.fn.zTree.getZTreeObj("tree_left");
	var checkedNodes = treeObj.getCheckedNodes();
	if(checkedNodes.length < 1) {
		layer.msg("请先选择数据", {
			icon: 2,
			time: 1500
		});
		return;
	}
	var array = new Array();
	for(var index in checkedNodes) {
		if(index == "del") {
			continue;
		}
		array.push(checkedNodes[index].id);
	}
	console.log(array);
	$.ajax({
		url: COMMO_URL + "/facInfo/deleteFac.do",
		type: "POST",
		dataType: "json",
		data: {
			ids: array
		},
		success: function(data) {
			if(data.code == 200) {
				layer.msg(data.msg, {
					icon: 1,
					time: 1500
				});
			} else {
				layer.msg(data.msg, {
					icon: 2,
					time: 1500
				});
			}
			initTree();
			//			$('#czDevicesTable').bootstrapTable('refresh');
			//			getFacIds();
		}
	})
}

//修改厂站信息
function updateFac(event, treeId, treeNode) {
	if(treeNode == null) {
		return;
	}
	var id = treeNode.id;
	$.ajax({
		url: COMMO_URL + "/facInfo/getFac.do",
		type: "POST",
		dataType: "json",
		data: {
			id: id
		},
		success: function(data) {
			$("#facName").val(data.facName);
			$("#facId").val(data.facId);
		}
	})
	var index = layer.open({
		type: 1,
		title: '修改厂站信息',
		anim: 4,
		area: ['600px', '400px'],
		content: $("#add_fac"),
		btn: ['确认', '关闭'],
		yes: function() {
			var facName = $("#facName").val();
			var facId = $("#facId").val();
			if(facName == "") {
				layer.msg("请输入厂站名称", {
					icon: 2,
					time: 1500
				});
				return;
			}
			$.ajax({
				url: COMMO_URL + "/facInfo/updateFac.do",
				type: "POST",
				dataType: "json",
				data: {
					id: id,
					facName: facName,
					facId: facId,
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						});
						layer.close(index);
					} else {
						layer.msg(data.msg, {
							icon: 2,
							time: 1500
						});
					}
					initTree();
					//					$('#czDevicesTable').bootstrapTable('refresh');
					//					layer.close(index);
					//					getFacIds();
				},
			})
		}
	});
}

function query() { // 查询事件
	$('#czDevicesTable').bootstrapTable('refresh');
}
//获得厂站地址
function getFacIds() {
	$("#facQuery > option").remove();
	$("#facAdd > option").remove();
	$.ajax({
		url: COMMO_URL + "/facInfo/facIds.do",
		type: "POST",
		dataType: "json",
		success: function(data) {
			$("#facQuery").append("<option value='0'>请选择厂站地址...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#facQuery").append("<option value=" + data.list[index].id + ">" + data.list[index].facName + "</option>")
			}
			$("#facAdd").append("<option value='0'>请选择厂站地址...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#facAdd").append("<option value=" + data.list[index].id + ">" + data.list[index].facName + "</option>")
			}
		},
	})
}

function changeDeviceType() {
	console.log($('#deviceType').val());
	if($('#deviceType').val() == 1){
		mycolumn=mycolumnSwitch;
	}else{
		mycolumn = mycolumnByq;
	}
	$('#czDevicesTable').bootstrapTable('refreshOptions',{columns : mycolumn});
}
function changeConditionQuery() {
	$('#czDevicesTable').bootstrapTable('refresh'); 
}

function animate(cssId, remain) {
	var a = 100 - remain;
	$("#r-" + cssId).animate({
		width: a + "%"
	}, 1000);
}

//回车键查询
$('#name,#code,#pgzrr').keydown(function(e) {
	if(e.keyCode == 13) { //按键信息对象以参数的形式传递进来了  
		//此处编写用户敲回车后的代码  
		query();
	}
})

/**
 * 判断数组是否包含某个元素
 * @param array
 * @param s
 * @returns
 */
function isContain(array, s) {
	for(var index in array) {
		if(array[index] == s) {
			return true;
		}
	}
	return false;
}
/**
 * 加载层
 */
function showloading() {
	var index2 = layer.load(1, {
		shade: [0.1, '#fff'] //0.1透明度的白色背景
	});
}

/**
 * 日期转换
 * @param inputTime
 * @returns
 */
function formatDateTime(inputTime) {
	var date = new Date(inputTime);
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
};

//刷新页面
function repeat() {
	window.location.reload();
}
/* 
英文判断函数，返回true表示是全部英文，返回false表示不全部是英文 
*/
function isLetter(str) {
	if("" == str) {
		return false;
	}
	for(var i = 0; i < str.length; i++) {
		var c = str.charAt(i);
		if((c < "A" || c > "Z")) {
			return false;
		}
	}
	return true;
}

function isNumbers(str) {
	if("" == str) {
		return false;
	}
	for(var i = 0; i < str.length; i++) {
		var c = str.charAt(i);
		if((c < "0" || c > "9")) {
			return false;
		}
	}
	return true;
}
// 主操作类
function Main() {
	this.init = function() {

	};
}
//跟了类型ID取类型名称
function getSwitchType(code) {
//	console.log("getSwitchType:" + code);
	for(var i = 0; i < _switchType.length; i++) {
		//		console.log("getSwitchType:"+_switchType[i].CODE);
		if(_switchType[i].CODE == code) {
			return _switchType[i].NAME;
		}
	}
	return code;
}
//出线开关-联络开关
var _switchType = [{
	"CODE": 0,
	"NAME": "出线开关"
}, {
	"CODE": 1,
	"NAME": "联络开关"
}];
var mycolumn=[];
var mycolumnSwitch = [{
	checkbox: true,
	field: '',
	//title : 'id',
	align: 'center',
	valign: 'middle',
	/*formatter : function(value, row, index) {
		var url = '';
		url += '<input name="rack_check" type="checkbox" value='
				+ row.id
				+ ' />';
		return url;
	}*/
}, {
	field: '',
	title: '序号',
	align: 'center',
	valign: 'middle',
	formatter: function(value, row, index) {
		return index + 1;
	}
}, {
	field: 'id',
	title: 'id',
	align: 'center',
	valign: 'middle',
	visible: false
}, {
	field: 'switchName',
	title: '开关名称',
	align: 'center',
	valign: 'middle',
}, {
	field: 'type',
	title: '开关类型',
	align: 'center',
	valign: 'middle',
	formatter: function(value, row, index) {
		return getSwitchType(value);
	}
}, {
	field: 'facName',
	title: '上联厂站',
	align: 'center',
	valign: 'middle',
}, {
	field: 'outSwitchName',
	title: '上联出线开关',
	align: 'center',
	valign: 'middle'
}, {
	field: 'lineName',
	title: '所属线路',
	align: 'center',
	valign: 'middle'
}];
var mycolumnByq = [{
	checkbox: true,
	field: '',
	//title : 'id',
	align: 'center',
	valign: 'middle',
	/*formatter : function(value, row, index) {
		var url = '';
		url += '<input name="rack_check" type="checkbox" value='
				+ row.id
				+ ' />';
		return url;
	}*/
}, {
	field: '',
	title: '序号',
	align: 'center',
	valign: 'middle',
	formatter: function(value, row, index) {
		return index + 1;
	}
}, {
	field: 'id',
	title: 'id',
	align: 'center',
	valign: 'middle',
	visible: false
}, {
	field: 'transformerName',
	title: '变压器名称',
	align: 'center',
	valign: 'middle',
}, {
	field: 'facName',
	title: '上联厂站',
	align: 'center',
	valign: 'middle',
}, {
	field: 'outSwitchName',
	title: '上联出线开关',
	align: 'center',
	valign: 'middle'
}, {
	field: 'lineName',
	title: '所属线路',
	align: 'center',
	valign: 'middle'
}];
mycolumn = mycolumnSwitch;