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
		$('#transformersTable').bootstrapTable({
			url: COMMO_URL + '/transformerInfo/getTransformers.do',
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
			}],
			onClickRow: function(row) {
				return false;
			},
			onLoadSuccess: function(row) {
				console.log("onLoadSuccess:" + JSON.stringify(row));
				$('.bs-checkbox').css("vertical-align", "middle");
				$('#transformersTable').bootstrapTable('uncheckAll');
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
			name: $('#nameQuery').val(),
			facId: $('#facIdQuery').val(),
			switchOutId: $('#switchOutIdQuery').val(),
			lineId: $('#lineIdQuery').val(),
			_: $.now()
		};
		return temp;
	};
	return t1;
};

function query() { // 查询事件
	$('#transformersTable').bootstrapTable('refresh');
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
function getlineIds(){
	$("#lineIdAdd > option").remove();
	$.ajax({
		url: COMMO_URL + "/lineInfo/lineIds.do",
		type: "POST",
		dataType: "json",
		data: {
			switchOutId:$("#switchOutIdAdd").val()
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
			if(data.list.length>0){//默认第一个，馈线
				$("#lineIdAdd").val(data.list[0].id);
			}
		},
	})
}
function addTransformer() { //添加开关
	$('.transformerExtend').css("display","none");
	if($("#typeAdd").val() ==1){
		$('.transformerExtend').css("display","");
	}
	var addIndex = layer.open({
		type: 1,
		title: '添加变压器',
		anim: 4,
		shade : 0,
		area: ['700px', '450px'],
		content: $("#add_transformer"),
		btn: ['确认', '关闭'],
		yes: function() {
			var nameAdd = $("#nameAdd").val();
			var facIdAdd = $("#facIdAdd").val();
			var switchOutIdAdd = $("#switchOutIdAdd").val();
			var lineIdAdd = $("#lineIdAdd").val();
			if(nameAdd == "") {
				layer.msg("请输入变压器名称", {
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
			if(lineIdAdd ==0 || lineIdAdd == null){
				layer.msg("请选择线路", {
					icon: 2,
					time: 1500
				});
				return;
			}
			$.ajax({
				url: COMMO_URL+"/transformerInfo/addTransformer.do",
				type: "POST",
				dataType: "json",
				data: {
					transformerName: nameAdd,
					lineId: lineIdAdd,
					facId: facIdAdd,
					switchOutId: switchOutIdAdd
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						}, function() {
							$('#transformersTable').bootstrapTable('refresh');
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
	$('.transformerExtend').css("display","none");
	if($("#typeAdd").val() ==1){
		$('.transformerExtend').css("display","");
	}
}
function changeFacIdAdd() {
	getSwitchIds(0);
}
function changeOutSwitcIdAdd() {
	getlineIds();
}
function changeConditionQuery() {
	$('#transformersTable').bootstrapTable('refresh'); 
}

function updateTransformer() { //修改/查看
	var rows = $("#transformersTable").bootstrapTable('getSelections');
	if(rows.length != 1) {
		layer.msg("请选择一组数据！", {
			icon: 2,
			time: 1500
		});
		return;
	}
	var id = rows[0].id;
	console.log("updateTransformer:"+id);
	$.ajax({
		url: COMMO_URL + "/transformerInfo/getTransformer.do",
		type: "POST",
		dataType: "json",
		data: {
			id: id
		},
		success: function(data) {
			console.log("updateTransformer:"+JSON.stringify(data));
			$("#nameAdd").val(data.transformerName);
			$("#facIdAdd").val(data.facId);
			//
			changeFacIdAdd();
			setTimeout(function(){
				$("#switchOutIdAdd").val(data.switchOutId);
				changeOutSwitcIdAdd();
			},100);
			setTimeout(function(){
				$("#lineIdAdd").val(data.lineId);
			},200);
		}
	})
	var index = layer.open({
		type: 1,
		title: '修改变压器信息',
		anim: 4,
		shade:0,
		area: ['600px', '400px'],
		content: $("#add_transformer"),
		btn: ['确认', '关闭'],
		yes: function() {
			var nameAdd = $("#nameAdd").val();
			var facIdAdd = $("#facIdAdd").val();
			var changeOutSwitcIdAdd = $("#changeOutSwitcIdAdd").val();
			var lineIdAdd = $("#lineIdAdd").val();
			if(nameAdd == "") {
				layer.msg("请输入变压器名称", {
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
			if(lineIdAdd ==0 || lineIdAdd == null){
				layer.msg("请选择线路", {
					icon: 2,
					time: 1500
				});
				return;
			}
			$.ajax({
				url: COMMO_URL+"/transformerInfo/updateTransformer.do",
				type: "POST",
				dataType: "json",
				data: {
					id:id,
					transformerName: nameAdd,
					lineId: lineIdAdd,
					facId: facIdAdd,
					switchOutId: changeOutSwitcIdAdd
				},
				success: function(data) {
					if(data.code == 200) {
						layer.msg(data.msg, {
							icon: 1,
							time: 1500
						}, function() {
							$('#transformersTable').bootstrapTable('refresh');
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
			layer.close(index);
		}
	});
}

//删除开关
function deleteTransformers() {
	var rows = $("#transformersTable").bootstrapTable('getSelections');
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
				url:COMMO_URL+ "/transformerInfo/deleteTransformer.do",
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
					$('#transformersTable').bootstrapTable('refresh');
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