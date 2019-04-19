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

//线路展示table
var Interval = function() {
	var t1 = new Object();
	t1.initInterval = function() {
		$('#LinesTable').bootstrapTable({
			url: COMMO_URL + '/lineInfo/getLines.do',
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
				field: 'lineName',
				title: '线路名称',
				align: 'center',
				valign: 'middle',
			}, {
				field: 'type',
				title: '线路类型',
				align: 'center',
				valign: 'middle',
				formatter: function(value, row, index) {
					return getLineType(value);
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
			}],
			onClickRow: function(row) {
				return false;
			},
			onLoadSuccess: function(row) {
				console.log("onLoadSuccess:" + JSON.stringify(row));
				$('.bs-checkbox').css("vertical-align", "middle");
				$('#LinesTable').bootstrapTable('uncheckAll');
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
			switchOutId: $('#switchOutIdQuery').val(),
			_: $.now()
		};
		return temp;
	};
	return t1;
};

function query() { // 查询事件
	$('#LinesTable').bootstrapTable('refresh');
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
	$("#switchOutIdAdd > option").remove();
	$.ajax({
		url: COMMO_URL + "/switchInfo/switchIds.do",
		type: "POST",
		dataType: "json",
		data: {
			facId:$("#facIdAdd").val(),
			type: type
		},
		success: function(data) {
			$("#switchOutIdAdd").append("<option value='0'>请选择出线开关...</option>")
			for(var index in data.list) {
				if(!data.list[index].id) {
					continue;
				}
				$("#switchOutIdAdd").append("<option value=" + data.list[index].id + ">" + data.list[index].switchName + "</option>")
			}
		},
	})
}

function addLine() { //添加线路
	$('.LineExtend').css("display","none");
	if($("#typeAdd").val() ==1){
		$('.LineExtend').css("display","");
	}
	var addIndex = layer.open({
		type: 1,
		title: '添加出线线路',
		anim: 4,
		shade : 0,
		area: ['700px', '450px'],
		content: $("#add_Line"),
		btn: ['确认', '关闭'],
		yes: function() {
			var typeAdd = $("#typeAdd").val();
			var nameAdd = $("#nameAdd").val();
			var facIdAdd = $("#facIdAdd").val();
			var switchOutIdAdd = $("#switchOutIdAdd").val();
			if(facIdAdd == 0) {
				layer.msg("请选择厂站", {
					icon: 2,
					time: 1500
				});
				return;
			}
			if(switchOutIdAdd ==0 || switchOutIdAdd == null){
				layer.msg("请选择出线开关", {
					icon: 2,
					time: 1500
				});
				return;
			}
			if(nameAdd == "") {
				layer.msg("请输入线路名称", {
					icon: 2,
					time: 1500
				});
				return;
			}
			console.log("typeAdd :"+typeAdd)
			$.ajax({
				url: COMMO_URL+"/lineInfo/addLine.do",
				type: "POST",
				dataType: "json",
				data: {
					lineName: nameAdd,
					type: typeAdd,
					facId: facIdAdd,
					switchOutId: switchOutIdAdd
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						}, function() {
							$('#LinesTable').bootstrapTable('refresh');
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

function changeFacIdAdd() {
	getSwitchIds(0);
}
function changeSwitchOutIdAdd() {
	var nameAdd = $("#nameAdd").val();
//	if(nameAdd == null || nameAdd == "" ){
		console.log("changeSwitchOutIdAdd nameAdd is null");
		$("#nameAdd").val($("#switchOutIdAdd").find("option:selected").text());
//	}
}
function changeConditionQuery() {
	$('#LinesTable').bootstrapTable('refresh'); 
}

function updateLine() { //修改/查看线路信息跳转页面
	var rows = $("#LinesTable").bootstrapTable('getSelections');
	if(rows.length != 1) {
		layer.msg("请选择一组数据！", {
			icon: 2,
			time: 1500
		});
		return;
	}
	var id = rows[0].id;
	console.log("updateLine:"+id);
	$.ajax({
		url: COMMO_URL + "/lineInfo/getLine.do",
		type: "POST",
		dataType: "json",
		data: {
			id: id
		},
		success: function(data) {
			console.log("getLine:"+JSON.stringify(data));
			$("#typeAdd").val(data.type);
			$("#nameAdd").val(data.lineName);
			$("#facIdAdd").val(data.facId);
			changeFacIdAdd();
			setTimeout(function(){
				$("#switchOutIdAdd").val(data.switchOutId);
			},100);
		}
	})
	var index = layer.open({
		type: 1,
		title: '修改线路信息',
		anim: 4,
		shade:0,
		area: ['600px', '400px'],
		content: $("#add_Line"),
		btn: ['确认', '关闭'],
		yes: function() {
			var typeAdd = $("#typeAdd").val();
			var nameAdd = $("#nameAdd").val();
			var facIdAdd = $("#facIdAdd").val();
			var switchOutIdAdd = $("#switchOutIdAdd").val();
			if(nameAdd == "") {
				layer.msg("请输入线路名称", {
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
			if(switchOutIdAdd ==0 || switchOutIdAdd == null){
				layer.msg("请选择出线开关", {
					icon: 2,
					time: 1500
				});
				return;
			}
			$.ajax({
				url: COMMO_URL+"/lineInfo/updateLine.do",
				type: "POST",
				dataType: "json",
				data: {
					id:id,
					lineName: nameAdd,
					type: typeAdd,
					facId: facIdAdd,
					switchOutId: switchOutIdAdd
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						}, function() {
							$('#LinesTable').bootstrapTable('refresh');
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

//删除线路
function deleteLines() {
	var rows = $("#LinesTable").bootstrapTable('getSelections');
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
		title: '删除所选线路',
		anim: 4,
		area: ['260px', '150px'],
		content: "<div align='center' style = 'line-height:52px;word-wrap:break-word;'>你确认删除这 " + ids.length + " 条数据吗？</div>",
		btn: ['确认', '关闭'],
		yes: function() {
			$.ajax({
				url:COMMO_URL+ "/lineInfo/deleteLine.do",
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
					$('#LinesTable').bootstrapTable('refresh');
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
function getLineType(code) {
	//	console.log("getLineType:" + code);
	for(var i = 0; i < _LineType.length; i++) {
		//		console.log("getLineType:"+_LineType[i].CODE);
		if(_LineType[i].CODE == code) {
			return _LineType[i].NAME;
		}
	}
	return code;
}
//出线线路-联络线路
var _LineType = [{
	"CODE": 0,
	"NAME": "馈线线路"
}, {
	"CODE": 1,
	"NAME": "支线线路"
}];
