var itemData = {};
var main = null;
$(function() {
	main = new Main();
	main.init();
	getFacIds(); //获取厂站下拉列表
	var interval = new Interval();
	setTimeout(function() {
		interval.initInterval();
	}, 1000);
});

//开关展示table
var Interval = function() {
	var t1 = new Object();
	t1.initInterval = function() {
		$('#switchsTable').bootstrapTable({
			url: COMMO_URL + '/switchInfo/getSwitchs.do',
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
			columns: [{
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
			}],
			onClickRow: function(row) {
				return false;
			},
			onLoadSuccess: function(row) {
				console.log("onLoadSuccess:" + JSON.stringify(row));
				$('.bs-checkbox').css("vertical-align", "middle");
				$('#switchsTable').bootstrapTable('uncheckAll');
				$(".fixed-table-container tbody tr").removeAttr("class");
			},
			onLoadError: function(status, data) {
				console.log("error:" + JSON.stringify(data));
			}
		});
	};

	/**
	 * 
	 */
	t1.intervalQueryParams = function(params) {
		var temp = {
			pageNumber: this.pageNumber,
			pageSize: this.pageSize,
			type: $('#typeQuery').val(),
			name: $('#nameQuery').val(),
			facId: $('#facIdQuery').val(),
			parentId: $('#parentIdQuery').val(),
			lineId: $('#lineIdQuery').val(),
			_: $.now()
		};
		return temp;
	};
	return t1;
};

function query() { // 查询事件
	$('#switchsTable').bootstrapTable('refresh');
}
//获得厂站地址
function getFacIds() {
	$("#facIdQuery > option").remove();
	$("#facIdAdd > option").remove();
	$.ajax({
		url: COMMO_URL + "/facInfo/facIds.do",
		type: "POST",
		dataType: "json",
		success: function(data) {
			$("#facIdQuery").append("<option value='0'>请选择厂站地址...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#facIdQuery").append("<option value=" + data.list[index].id + ">" + data.list[index].facName + "</option>")
			}
			$("#facIdAdd").append("<option value='0'>请选择厂站地址...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#facIdAdd").append("<option value=" + data.list[index].id + ">" + data.list[index].facName + "</option>")
			}
		},
	})
}

function getSwitchIds(type) {
	$("#parentIdAdd > option").remove();
	$.ajax({
		url: COMMO_URL + "/switchInfo/switchIds.do",
		type: "POST",
		dataType: "json",
		data: {
			facId:$("#facIdAdd").val(),
			type: type
		},
		success: function(data) {
			$("#parentIdAdd").append("<option value='0'>请选择出线开关...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#parentIdAdd").append("<option value=" + data.list[index].id + ">" + data.list[index].switchName + "</option>")
			}
		},
	})
}
function getlineIds(){
	$("#lineIdAdd > option").remove();
	$.ajax({
		url: COMMO_URL + "/lineInfo/lineIds.do",
		type: "POST",
		dataType: "json",
		data: {
			switchOutId:$("#parentIdAdd").val()
		},
		success: function(data) {
			console.log("lineIds:"+JSON.stringify(data))
			$("#lineIdAdd").append("<option value='0'>请选择线路...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#lineIdAdd").append("<option value=" + data.list[index].id + ">" + data.list[index].lineName + "</option>")
			}
			if($("#typeAdd").val()==1 && data.list.length>0){
				$("#lineIdAdd").val(data.list[0].id);
			}
		},
	})
}
function addSwitch() { //添加开关
	$('.switchExtend').css("display","none");
	$('.lineAddFlag').css("display","");
	if($("#typeAdd").val() ==1){
		$('.switchExtend').css("display","");
		$('.lineAddFlag').css("display","none");
	}
	var addIndex = layer.open({
		type: 1,
		title: '添加出线开关',
		anim: 4,
		shade : 0,
		area: ['700px', '450px'],
		content: $("#add_switch"),
		btn: ['确认', '关闭'],
		yes: function() {
			var typeAdd = $("#typeAdd").val();
			var nameAdd = $("#nameAdd").val();
			var facIdAdd = $("#facIdAdd").val();
			var lineAddFlag = $("#lineAddFlag").get(0).checked;
			var parentIdAdd = $("#parentIdAdd").val();
			var lineIdAdd = $("#lineIdAdd").val();
			console.log("lineAddFlag:"+(lineAddFlag==true));
			if(nameAdd == "") {
				layer.msg("请输入开关名称", {
					icon: 2,
					time: 1500
				});
				return;
			}
			if(facIdAdd == 0) {
				layer.msg("请选择厂站", {
					icon: 2,
					time: 1500
				});
				return;
			}
			if(typeAdd == 1) {//联络开关
				if(lineIdAdd ==0 || lineIdAdd == null){
					layer.msg("请选择线路", {
						icon: 2,
						time: 1500
					});
					return;
				}
			}
			console.log("typeAdd lineIdAdd:"+typeAdd+","+lineIdAdd)
			$.ajax({
				url: COMMO_URL+"/switchInfo/addSwitch.do",
				type: "POST",
				dataType: "json",
				data: {
					switchName: nameAdd,
					type: typeAdd,
					lineId: lineIdAdd,
					facId: facIdAdd,
					parentId: parentIdAdd,
					lineAddFlag:lineAddFlag
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						}, function() {
							$('#switchsTable').bootstrapTable('refresh');
							//window.location.href = ctx + "/rack/devicesRackInfo.do";
						});
					} else {
						layer.msg(data.msg, {
							icon: 2,
							time: 1500
						});
					}
				},
			})
		}
	});
}

function changeTypeIdAdd() {
	$('.switchExtend').css("display","none");
	$('.lineAddFlag').css("display","");
	if($("#typeAdd").val() ==1){
		$('.switchExtend').css("display","");
		$('.lineAddFlag').css("display","none");
	}
}
function changeFacIdAdd() {
	getSwitchIds(0);
}
function changeParentIdAdd() {
	getlineIds();
}
function changeConditionQuery() {
	console.log($('#deviceType').val());
	$('#switchsTable').bootstrapTable('refresh'); 
}

function updateSwitch() { //修改/查看开关信息跳转页面
	var rows = $("#switchsTable").bootstrapTable('getSelections');
	if(rows.length != 1) {
		layer.msg("请选择一组数据！", {
			icon: 2,
			time: 1500
		});
		return;
	}
	var id = rows[0].id;
	console.log("updateSwitch:"+id);
	$.ajax({
		url: COMMO_URL + "/switchInfo/getSwitch.do",
		type: "POST",
		dataType: "json",
		data: {
			id: id
		},
		success: function(data) {
			$("#typeAdd").val(data.type);
			$("#nameAdd").val(data.switchName);
			$("#facIdAdd").val(data.facId);
			$('.switchExtend').css("display","none");
			$('.lineAddFlag').css("display","none");
			if($("#typeAdd").val() ==1){
				$('.switchExtend').css("display","");
			}
			//
			changeFacIdAdd();
			setTimeout(function(){
				$("#parentIdAdd").val(data.parentId);
				changeParentIdAdd();
			},100);
			setTimeout(function(){
				$("#lineIdAdd").val(data.lineId);
			},200);
		}
	})
	var index = layer.open({
		type: 1,
		title: '修改开关信息',
		anim: 4,
		shade:0,
		area: ['600px', '400px'],
		content: $("#add_switch"),
		btn: ['确认', '关闭'],
		yes: function() {
			var typeAdd = $("#typeAdd").val();
			var nameAdd = $("#nameAdd").val();
			var facIdAdd = $("#facIdAdd").val();
			var parentIdAdd = $("#parentIdAdd").val();
			var lineIdAdd = $("#lineIdAdd").val();
			if(nameAdd == "") {
				layer.msg("请输入开关名称", {
					icon: 2,
					time: 1500
				});
				return;
			}
			if(facIdAdd == 0) {
				layer.msg("请选择厂站", {
					icon: 2,
					time: 1500
				});
				return;
			}
			if(typeAdd == 1) {//联络开关
				if(lineIdAdd ==0 || lineIdAdd == null){
					layer.msg("请选择线路", {
						icon: 2,
						time: 1500
					});
					return;
				}
			}
			console.log("typeAdd lineIdAdd:"+typeAdd+","+lineIdAdd)
			$.ajax({
				url: COMMO_URL+"/switchInfo/updateSwitch.do",
				type: "POST",
				dataType: "json",
				data: {
					id:id,
					switchName: nameAdd,
					type: typeAdd,
					lineId: lineIdAdd,
					facId: facIdAdd,
					parentId: parentIdAdd
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						}, function() {
							$('#switchsTable').bootstrapTable('refresh');
							//window.location.href = ctx + "/rack/devicesRackInfo.do";
						});
						layer.close(index);
					} else {
						layer.msg(data.msg, {
							icon: 2,
							time: 1500
						});
					}
				},
			})
		}
	});
}

//删除开关
function deleteSwitchs() {
	var rows = $("#switchsTable").bootstrapTable('getSelections');
	var ids = new Array();
	for(var index in rows) {
		if(isNaN(index)) {
			continue;
		}
		ids.push(rows[index].id);
	}
	if(ids.length < 1) {
		layer.msg("请先选择数据", {
			icon: 2,
			time: 1500
		});
		return;
	}
	var index = layer.open({

		type: 1,
		title: '删除所选开关',
		anim: 4,
		area: ['260px', '150px'],
		content: "<div align='center' style = 'line-height:52px;word-wrap:break-word;'>你确认删除这 " + ids.length + " 条数据吗？</div>",
		btn: ['确认', '关闭'],
		yes: function() {
			$.ajax({
				url:COMMO_URL+ "/switchInfo/deleteSwitch.do",
				type: "POST",
				dataType: "json",
				data: {
					ids: ids
				},
				success: function(data) {
					layer.close(index);
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
					$('#switchsTable').bootstrapTable('refresh');
				}
			})
		}
	})
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
