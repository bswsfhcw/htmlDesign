/**
 * 
 */
/**
 * JTOPO
 */

//window.location.href =  "index.html?pageName=main";
/*var url=location.search;
console.log("url="+url);
if ( url.indexOf( "?" ) != -1 ) {
  var str = url.substr( 1 ); //substr()方法返回从参数值开始到结束的字符串；
  var strs = str.split( "&" );
  for ( var i = 0; i < strs.length; i++ ) {
 	console.log( strs[ i ].split( "=" )[ 0 ] +"="+strs[ i ].split( "=" )[ 01]  ); //此时的theRequest就是我们需要的参数；
	}
}*/
//window.history.back(-1);
var canvas = document.getElementById('topo_canvas');
var stage = new JTopo.Stage(canvas); //舞台对象
var scene = new JTopo.Scene(stage); //场景对象
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
scene.alpha = 1;
scene.backgroundColor = "0,0,0";
//显示工具栏
showJTopoToobar(stage);
//scene.background = 'statics/images/topo/bg.jpg';
var _add_x; //鼠标所处的x值
var _add_y; //y值

//记录删除的节点及坐标
var _deleteNodeList = []; //
var _deleteLinkList = []; //

var childTopoNode; //和子拓扑关联的node
//拓扑全局变量
var _topoParentId = -1;
var _topoId = null;
var lineId = -1;

var globalNodeA = null;
var nodeA_x = null;
var nodeA_y = null;
var globalLinkStyle = null;

//用于节点对齐
var align_x = null;
var align_y = null;

var tempNodeA = new JTopo.Node('tempA');
tempNodeA.setSize(1, 1);
var tempNodeZ = new JTopo.Node('tempZ');
tempNodeZ.setSize(1, 1);
var _link = null; //创建连线时的缓存链路
var dragLine = false; //是否处在连线状态

scene.mousemove(function(e) {
	_add_x = e.x;
	_add_y = e.y;
	if(dragLine) {
		tempNodeZ.setLocation(e.x, e.y);
	}
	dragImg();
});

$('#refreshButton').click(function() {
	console.log("refreshButton");
	getTopo();
	initTree();
});

scene.mouseup(function(event) {
	if(event.target == undefined && event.button == 2) {
		$("#contextmenu3").menu('show', {
			left: event.pageX,
			top: event.pageY
		});
	}
	//	console.log("event.button:" + event.button+","+event.target);
	if(event.button == 0) {
		if(dragLine) { //左键
			if(event.target != null && event.target instanceof JTopo.Node) {
				if(globalNodeA != null && globalNodeA != event.target) {
					var nodeZ = event.target;
					var nodeType = nodeZ.nodeType;
					if(nodeType != "textNode" && globalLinkStyle) {
						var lk = createLink(globalNodeA, nodeZ, globalLinkStyle, "");
					}
				}
			}
		} else if(event.target != null) { //左键松开 保存所有选中对象
			console.log("左键");
			updataSelectNodes(0);
			/*console.log("左键 != null Node：" + JSON.stringify(event.target.nodeType));
			var node = event.target; //
			if(event.target.nodeType == 'imgNode' && event.target.parentId) {
				console.log("左键 != null parentId：" + JSON.stringify(event.target.parentId));
				scene.findElements(function(e) {
					//				console.log("findElements:" + JSON.stringify(e.nodeId));
					if(e.id != null && e.id == node.parentId) {
						node = e;
					}
				});
			}
			//容器里面的文本
			if(event.target.nodeType == 'contentNode' && event.target.childs && event.target.childs.length > 0) {
				console.log("contentNode");
				var childsNode = event.target.childs;
				var childs = [];
				for(var i = 0; i < childsNode.length; i++) {
					if(childsNode[i].nodeType == 'textNode') {
						var child = {
							"del": 0,
							"id": childsNode[i].id,
							"entityId": childsNode[i].entityId,
							"entityType": childsNode[i].entityType,
							"height": childsNode[i].height,
							"nodeId": childsNode[i]._id,
							"nodeName": childsNode[i].text,
							"nodeType": "textNode",
							"posx": childsNode[i].x,
							"posy": childsNode[i].y,
							"rotate": childsNode[i].rotate,
							"width": childsNode[i].width
						};
						childs.push(child);
					}
				}
			}
			var emslist = [];
			var ems1 = {}
			var dto = {
				"del": 0,
				"id": node.id,
				"entityId": node.entityId,
				"entityType": node.entityType,
				"height": node.height,
				"nodeId": node.nodeId,
				"nodeName": node.text,
				"nodeType": node.nodeType,
				"posx": node.x,
				"posy": node.y,
				"rotate": node.rotate,
				"width": node.width,
				"childs": childs
			};
			//	console.log("container.posx："+JSON.stringify(container));
			var ems1 = {
				"elementType": "node",
				"dto": dto
			};
			emslist.push(ems1);
			var content = {
				"ems": emslist
			};
			operateTopoList(content);*/
		}
		if(_link) {
			scene.remove(_link);
		}
		dragLine = false;
		globalNodeA = null;
		globalLinkStyle = null;
	}
});

function updataNode(node) {
	if('name' == node.entityType) {
		node.font = '30px 黑体';
		node.fontColor = '255,0,0';
	} else {
		node.font = '14px 黑体';
		node.fontColor = '255,255,255';
	}
	var ems = buildEmsNode(node, 0);
	var emslist = [];
	emslist.push(ems);
	var content = {
		"ems": emslist
	};
	operateTopoList(content);
}

function updataSelectNodes(del) {
	var data = scene.selectedElements;
	console.log("updataSelectNodes selectedElements.length:" + data.length);
	var emslist = [];
	for(var i = 0; i < data.length; i++) {
		var node = data[i];
		var ems = buildEmsNode(node, del);
		if(ems) {
			emslist.push(ems);
		}
		if(node.parentId && del == 0) { //删除子节点不删除容器
			scene.findElements(function(e) { //找容器
				//				console.log("findElements:" + JSON.stringify(e.nodeId));
				if(e.id != null && e.id == node.parentId) {
					var nodeContainer = e;
					ems = buildEmsNode(nodeContainer, del);
					if(ems) {
						emslist.push(ems);
					}
				}
			});
		} else if(node.nodeType == 'contentNode') {
			scene.findElements(function(e) { //找子节点
				//				console.log("findElements:" + JSON.stringify(e.nodeId));
				if(e.id != null && e.parentId == node.id) {
					var nodeChild = e;
					ems = buildEmsNode(nodeChild, del);
					if(ems) {
						emslist.push(ems);
					}
				}
			});
		}
	}
	var content = {
		"ems": emslist
	};
	//	console.log("updataSelectNodes:"+del);
	operateTopoList(content, true);
}
$(function() {
	//	initAreas();
	//	initFacsAndLines();
	getTopo();
	initTree();
	loadImgAll();
});
//浏览器大小改变事件
window.onresize = function() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
}

/*************************初始化**************************/

//初始化区域菜单
function initAreas() {
	var areas = new Array();
	$.ajax({
		url: '/facInfo/areas.do',
		type: 'POST',
		dataType: 'json',
		success: function(data) {
			if(data) {
				areas = data.success;
				$("#area option").remove();
				$("#area").append("<option value=-1>全部</option>");
				$.each(areas, function(i) {
					$("#area").append(
						"<option value=" + areas[i].id + ">" +
						areas[i].areaName + "</option>");
				});
			};
		},
		error: function(data) {
			layer.alert('加载出现异常，请联系管理员！', {
				skin: 'layui-layer-lan',
				anim: 4
				// 动画类型
			});
		}
	});
}

//控制菜单按钮changeNodeButton显示的值
function menuBtnValue() {
	if(_circleNodeList.length > 0) {
		var radius = _circleNodeList[0].radius;
		if(radius > 1) {
			$("#changeNodeButton").val("变小");
			$("#changeNodeButton").attr("onclick", "doCircleNode(0)");
		} else {
			$("#changeNodeButton").val("变大");
			$("#changeNodeButton").attr("onclick", "doCircleNode(1)");
		}
	}
}

function doCircleNode(type) {
	if(type == 0) { //所有链路的所有圆形节点都小
		for(var index in _circleNodeList) {
			if(isNaN(index)) {
				continue;
			}
			_circleNodeList[index].radius = 0.1;
			_circleNodeList[index].entity.radius = 0.1; //用于保存
		}
		$("#changeNodeButton").val("变大");
		$("#changeNodeButton").attr("onclick", "doCircleNode(1)");
	}
	if(type == 1) { //所有链路的所有圆形节点都变大，实现可拖拽链路的效果
		for(var index in _circleNodeList) {
			if(isNaN(index)) {
				continue;
			}
			_circleNodeList[index].radius = 3;
			_circleNodeList[index].entity.radius = 3; //用于保存
		}
		$("#changeNodeButton").val("变小");
		$("#changeNodeButton").attr("onclick", "doCircleNode(0)");
	}
	if(_circleNodeList.length > 0) {
		_isSave = true;
	}
}
//注释功能点击事件
//function updateMessage(){
//	var fq = $("#topo_fq").val();
//	if (!fq || isNaN(fq)) {
//		layer.msg("请选择分区...",{icon:7,offset: '200px',time:1500});
//		$("#topo_canvas").css("display","none");
//		return;
//	}
//		
//}

/**
 * 获取拓扑 
 * @returns
 */
function getTopo() {
	scene.clear();
	//	console.log("scene.clear scene.selectedElements:"+scene.selectedElements.length);
	$.ajax({
		type: "post",
		url: COMMO_URL + "/topo/selectTopo.do",
		dataType: 'json',
		data: {
			lineId: lineId,
			parentId: _topoParentId
		},
		async: false,
		success: function(data) {
			//			console.log("getTopo:" + lineId + "," + _topoParentId + "," + JSON.stringify(data));
			console.log("topo nodes:" + (data.nodes == undefined));
			setTopoData(data);
			if("success" == data.msg && ((data.nodes == undefined || data.nodes == null || (data.nodes && data.nodes.length == 0)))) {
				console.log("空拓扑");
				if(childTopoNode) { //子拓扑
					console.log("空子拓扑");
					//复制节点到子拓扑
					var node = childTopoNode;
					console.log(node.nodeType + ",node.id:" + node.id + "," + node.entityId);
					node.id = null;
					console.log(node.nodeType + ",node.id:" + node.id + "," + node.entityId);
					newNodeCommon(node);
				}
			}
			childTopoNode == null;
		},
		error: function(result) {
			layer.msg("请求数据失败！", {
				icon: 5,
				offset: '200px',
				time: 1500
			});
		},
	})
}
//返回上一级拓扑  需要修改，接收上一级lineId,因为取拓扑是根据lineId
function upperLevel() {
	$("#upperLevel").css("cursor", "not-allowed");
	$("#upperLevel").attr("disabled", "disabled");
	_topoId = _topoParentId;
	_topoParentId = -1;
	lineId = -1;
	getTopo();
}

function openOrClose() {
	var data = scene.selectedElements;
	var node = data[0];
	console.log("openOrClose");
	var imgPath = node.imgPath;
	if(imgPath.indexOf("-on") > -1) {
		imgPath = imgPath.replace("-on", "-off");
	} else {
		imgPath = imgPath.replace("-off", "-on");
	}
	node.imgPath = imgPath;
	node.setImage(COMMO_URL_IMG + node.imgPath, false); //true:图片实际尺寸，false：节点设置的宽高
	updataNode(node);
	if(node.imgPath.indexOf("-off") > -1) {
		setTimeout(function() {
			getPowerOffByq(node);
		}, 1000);
	}
}
//获取影响用户-变压器
function getPowerOffByq(node) {
	//弹框
	$('#powerOffByqs').dialog('open');
	initDataGrid(node);
	setTimeout(function() {
		console.log("getRows():" + $("#gridPowerOffByqs").datagrid('getRows'));
	}, 1000);
}
//初始化表格控件
function initDataGrid(node) {
	$("#gridPowerOffByqs").datagrid({
		url: COMMO_URL + "/topo/getPowerOffByq.do",
		queryParams: {
			nodeId: node.id
		},
		fit: true,
		loadMsg: '数据加载中,请稍候...',
		border: false,
		singleSelect: false,
		pagination: false,
		pageSize: 20,
		rownumbers: true,
		fitColumns: true,
		scrollbarSize: 0,
		striped: true,
		SelectOnCheck: true,
		CheckOnSelect: true,
		remoteSort: true,
		nowrap: true,
		columns: [
			[{
					field: "id",
					title: "id",
					hidden: true,
					checkbox: true,
					align: "center"
				},
				{
					field: "transformerName",
					title: "变压器",
					align: "center",
					width: 25
				},
				{
					field: "fac",
					title: "变电站",
					align: "center",
					width: 12
				},
				{
					field: "switch",
					title: "出线开关",
					align: "center",
					width: 20
				}
			]
		]
	});
}
//node表主键
function goChildTopo() {
	if(_topoParentId != -1) {
		layer.msg("目前只开放一级子拓扑！", {
			icon: 5,
			time: 1500,
			offset: '200px',
		});
		return;
	}
	$("#upperLevel").css("cursor", "pointer");
	$("#upperLevel").removeAttr("disabled");
	$("#upperLevel").attr("class", "easyui-linkbutton l-btn l-btn-small");
	var data = scene.selectedElements;
	childTopoNode = data[0];
	_topoParentId = _topoId;
	_topoId = null;
	lineId = childTopoNode.id;
	scene.selectedElements = []; //防止主要拓扑最后一节点处于被选中状态
	console.log("childTopoNode:" + childTopoNode.id);
	getTopo();
}
/*************************数据解析**************************/
//解析拓扑数据
function setTopoData(result) {
	scene.clear(); //加载前清空画板
	var zoom = result.zoom == undefined ? 1 : result.zoom == undefined;
	//	console.log("result.zoom：" + zoom);
	scene.scaleX = zoom;
	scene.scaleY = zoom;
	//	console.log("result.zoom：" + scene.scaleX);
	_topoId = result.topoId;
	//	console.log("result:"+result.topoId);
	if(result.nodes) {
		for(var i = 0; i < result.nodes.length; i++) {
			var node = parseNode(result.nodes[i]); //解析节点
			if(result.nodes[i].nodeType == 'contentNode') {
				//				console.log("parseNode:" + "contentNode");
			} else if(result.nodes[i].parentId == null) { //
				//				console.log("parseNode:" + result.nodes[i].nodeType);
				nodeTextDis(node);
				addClickEvent(node); //点击事件
				scene.add(node);
			}
			nodeContextMenu(node); //右键菜单事件和双击事件
		}
	}
	if(result.links) {
		for(var j = 0; j < result.links.length; j++) {
			var anode = null,
				znode = null;
			scene.findElements(function(e) {
				//				console.log("findElements:" + JSON.stringify(e.nodeId));
				if(e.nodeId != null && e.nodeId == result.links[j].anodeId) {
					anode = e;
				}
			});
			scene.findElements(function(e) {
				if(e.nodeId != null && e.nodeId == result.links[j].znodeId) {
					znode = e
				};
			});

			var link = parseLink(result.links[j], anode, znode);
			if(link != undefined) {
				linkContextMenu(link); //右键菜单事件
				addClickEvent(link); //点击事件
				scene.add(link);
			}
		}
	}

}
//解析node,返回JTopoNode
function parseNode(obj) {
	var nodeType = obj.nodeType;
	var x = obj.posx;
	var y = obj.posy;
	var w = obj.width;
	var h = obj.height;
	var rotate = obj.rotate;
	var name = obj.nodeName;
	var node = null;
	if(nodeType == 'contentNode') {
		node = sceneAddContainer(x, y, w, h, name, "fac", "", obj);
		scene.add(node);
	} else if(nodeType == "textNode" && obj.parentId == null) { //普通文本node
		console.log("textNode:");
		node = new JTopo.TextNode(name);
		node.font = '14px 黑体';
		node.fontColor = '255,255,255';
		//textNode.dragable = false;//不许拖拽
		node.zIndex = -1;
	} else if(nodeType == "imgNode") { //图片node
		//			var imgPath = obj.imgPath;
		var imgPath = COMMO_URL_IMG + obj.imgPath;
		//		console.log("imgPath:" + imgPath);
		node = new JTopo.Node(name);
		//		node.font = '13px 楷体';
		//		node.fontColor = '#0c0c0c';
		node.font = '14px 黑体';
		node.fontColor = '255,255,255';
		node.setImage(imgPath, false); //true:图片实际尺寸，false：节点设置的宽高
	} else if(nodeType == "circleNode") { //圆点node
		node = new JTopo.CircleNode(name);
		node.radius = 15; // 半径
		node.alpha = 1; //节点透明度
		node.fillColor = "239,120,0"; // 填充颜色
		node.fontColor = '#0c0c0c';
		node.dragable = true; //不许拖拽
		node.nodeType = "circleNode";
	} else if(nodeType == "textNode") {
		console.log("textNode parentId is not null");
		return;
	}
	if(rotate) {
		node.rotate = rotate;
	} else {
		node.rotate = 0;
	}
	node.setBound(x, y, w, h); //位置
	node.nodeId = obj.nodeId;
	node.id = obj.id;
	node.nodeType = obj.nodeType;
	node.entityType = obj.entityType;
	node.entityId = obj.entityId;
	node.imgPath = obj.imgPath;
	if('name' == node.entityType) {
		node.font = '30px 黑体';
		node.fontColor = '255,0,0';
	}
	node.parentId = obj.parentId;
	return node;
}
//解析连线数据
function parseLink(obj, anode, znode) {
	if(anode == null || znode == null) {
		//		console.log("parseLink break");
		return;
	}
	switch(obj.linkType) {
		case 2:
			link = new JTopo.FoldLink(anode, znode);
			break;
		case 3:
			link = new JTopo.FlexionalLink(anode, znode);
			break;
		case 4:
			link = new JTopo.CurveLink(anode, znode);
			break;
		default:
			link = new JTopo.Link(anode, znode);
	}
	link.text = obj.linkName;
	link.linkName = obj.linkName;
	link.strokeColor = "239,120,0"; // 
	link.font = '13px 楷体';
	link.fontColor = '#0c0c0c'; //黑色
	link.id = obj.id;
	link.anodeId = obj.anodeId;
	link.znodeId = obj.znodeId;
	link.lineWidth = 1;
	return link;
}

//node文本换行展示
function nodeTextDis(node) {
	node.paintText = function(a) {
		var b = this.text;
		if(null != b && "" != b) {
			a.beginPath(),
				a.font = this.font;
			var c = a.measureText(b).width,
				d = a.measureText("田").width;
			a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
			var e = this.getTextPostion(this.textPosition, c, d);
			a.wrapText(b, e.x, e.y),
				a.closePath()
		}
	}
}

//元素点击选中事件
function addClickEvent(elemet) {
	elemet.addEventListener("click", function() {
		//				console.log("addClickEvent");
		scene.findElements(function(e) {
			e.selected = false;
		});
		elemet.selected = true;
	});
	//	elemet.addEventListener("dbclick", function() {
	//		console.log("dblclick");
	//		goChildTopo(); //双击进入子拓扑，暂时用右键
	//	});
}

/*************************ztree**************************/

/**
 * ztree
 */
var initTree = function(id) {
	//	console.log("initTree:" + id);
	$.ajax({
		type: "post",
		url: COMMO_URL + "/topo/getDeviceTree.do",
		dataType: 'json',
		data: {
			lineId: lineId,
		},
		async: false,
		success: function(result) {
			//			console.log("success initTree:" + JSON.stringify(result));
			var t = $("#tree_left");
			if(result && result.list && result.list.length > 0) {
				t = $.fn.zTree.init(t, setting, result.list);
				var treeObj = $.fn.zTree.getZTreeObj("tree_left");
				//treeObj.expandAll(treeObj);
			}
		},
		error: function(result) {
			console.log("error initTree:" + JSON.stringify(result));
		},
	});
}
var setting = {
	check: {
		enable: false
	},
	view: {
		showIcon: true, //是否显示图标
		fontCss: setFontCss
	},
	data: {
		key: {
			url: "myurl" // 更改默认的超链接获取属性,取消超链接
		},
		simpleData: {
			enable: true,
			idKey: "id",
			pIdKey: "pId",
			rootPId: ""
		}
	},
	edit: {
		drag: {
			isCopy: false,
			isMove: true,
			prev: false,
			next: false,
			inner: false,
			autoOpenTime: 0,
			minMoveSize: 10
		},
		enable: true,
		editNameSelectAll: true,
		removeTitle: "删除节点",
		renameTitle: "编辑节点名称",
		showRemoveBtn: false,
		showRenameBtn: false,
	},
	callback: {
		beforeClick: beforeClick, //点击前
		beforeDrag: beforeDrag, //拖拽前
		onClick: onClick, //点击后
		onDrop: zTreeOnDrop, //拖拽后
	}
};
//拖拽之前——除了设备之外不许拖拽
//1变电站 2出线开关 3联络开关 4变压器   -1：开关目录 变压器目录
function beforeDrag(treeId, treeNodes) {
	var treeNode = treeNodes[0];
	console.log("beforeDrag:" + treeNode.name + "," + treeNode.type);
	if(treeNode.type == -1) {
		return false;
	}
	return true;
}

//拖拽之后——在鼠标的位置生成对应设备节点
function zTreeOnDrop(event, treeId, treeNodes) {
	var treeNode = treeNodes[0];
	console.log("zTreeOnDrop:" + treeNode.name + "," + treeNode.type + "," + treeNode.id);
	var sameNode;
	scene.findElements(function(e) { //找容器
		//				console.log("findElements:" + JSON.stringify(e.nodeId));
		if(e.entityId == treeNode.id && e.text == treeNode.name) {
			console.log("所选已经在拓扑中");
			sameNode = e;
			return;
		}
	});
	if(sameNode) {
		layer.msg("所选已经在当前拓扑中！", {
			icon: 5,
			time: 1000,
			offset: '200px',
		});
		return;
	}
	if(treeNode.type == 2 || treeNode.type == 3) { //开关
		//新增节点
		console.log("treeNode.statu:" + treeNode.statu);
		var img = switchImg;
		if(1 == treeNode.statu) { //0 闭合 1开
			img = img.replace("-on", "-off");
		}
		var node = newNode(_add_x, _add_y, imgW, imgH, treeNode.name, "switch", img, 0, treeNode.id);
		_newNodeImgPath = null;
		_entityType = null;

	} else if(treeNode.type == 1) { //变电站
		var container = newContainer(_add_x, _add_y, 200, 100, treeNode.name, "", "fac", "", 0, treeNode.id);
	} else if(treeNode.type == 4) {
		//新增节点
		var node = newNode(_add_x, _add_y, imgW, imgH, treeNode.name, "transformer", transformerImg, 0, treeNode.id);
		_newNodeImgPath = null;
		_entityType = null;

	}
}

function setFontCss(treeId, treeNode) {
	if(treeNode.highlight) {
		return {
			color: "#A60000",
			"font-weight": "bold"
		};
	} else {
		if(treeNode.flag == 4) {
			if(treeNode.topoId != undefined) {
				return {
					color: "red",
					"font-weight": "normal"
				};
			}
		} else {
			return {};
		}
	}
};

function beforeClick(treeId, treeNode) {
	return(treeNode.click != false);
}

function onClick(event, treeId, treeNode) {

}

/*************************图元操作**************************/
var oUl = document.getElementById("drag_div");
var aLi = oUl.getElementsByTagName('div');
var disX = 0;
var disY = 0;
var minZindex = 1;
var aPos = [];
var _imgEleIdList = []; //记录被选中的图元ID，用于删除

/**
 * 获取工具栏内的所有图元
 * @returns
 */
function loadImgAll() {
	var index2;
	$.ajax({
		type: "get",
		url: COMMO_URL_JSON + "jtopLeftImgs.json",
		dataType: 'json',
		beforeSend: function() {
			index2 = layer.load(1, {
				offset: ['200px', '90px'],
				time: 500 * 1000,
				shade: [0.1, '#fff'] //0.1透明度的白色背景
			});
		},
		success: function(data) {
			if(data) {
				for(var index in data) {
					if(isNaN(index)) {
						continue;
					}
					var imgPath = data[index].imgPath;
					var title = data[index].title;
					var id = data[index].id;
					var code = "";
					if(data[index].code) {
						code = data[index].code;
					}
					$("#drag_div").append("<div id='imgele_" + id + "'><img title='" + title + "' ondragstart='drag(event)'  " +
						"draggable='true' name='" + code + "' src='" + (COMMO_URL_IMG + imgPath) + "'/></div>")
				}
			}
			layer.close(index2);
		},
		error: function(result) {
			layer.msg("请求数据失败！", {
				icon: 5,
				time: 1500,
				offset: '200px',
			});
		},
	});
}

function deleteImg() {
	if(_imgEleIdList.length < 1) {
		layer.msg("请先选择需要删除的图元！", {
			icon: 7,
			offset: '200px',
			time: 2000
		});
		return;
	}

	$.ajax({
		url: COMMO_URL + "/topo/deleteImg.do",
		type: "POST",
		dataType: 'json',
		data: {
			ids: _imgEleIdList,
		},
		success: function(data) {
			layer.msg(data.msg, {
				icon: 1,
				time: 1500,
				offset: '200px',
			});
			$("#drag_div").empty();
			loadImgAll();
		},
		error: function(result) {
			layer.msg("发送请求失败！", {
				icon: 5,
				time: 1500,
				offset: '200px',
			});
		},
	});
	clearEditImg();
}

function editImg() {
	$("#editImg").attr("onclick", "clearEditImg()");
	$("#editUploadImg").removeAttr("hidden");
	$("#deleteImg").removeAttr("hidden");
	$("#uploadImg").attr("hidden", "true");
	//图元抖动，标志进入编辑模式
	for(var i = 0; i < aLi.length; i++) {
		var t = aLi[i].offsetTop;
		var l = aLi[i].offsetLeft;
		aLi[i].style.top = t + "px";
		aLi[i].style.left = l + "px";
		aPos[i] = {
			left: l,
			top: t
		};
		aLi[i].index = i;
	}
	for(var i = 0; i < aLi.length; i++) {
		aLi[i].style.position = "absolute";
		aLi[i].style.margin = 0;
		setDrag(aLi[i]);
	}
}

function clearEditImg() {
	$("#editUploadImg").attr("hidden", "true");
	$("#deleteImg").attr("hidden", "true");
	$("#uploadImg").removeAttr("hidden");
	for(var i = 0; i < aLi.length; i++) {
		aLi[i].onmouseover = null;
		aLi[i].onmousedown = null;
		aLi[i].onmouseup = null;
		//取消改变的样式--div背景
		aLi[i].style.background = "#fff";
		_imgEleIdList = []; //初始化被选中的图元集合
	}
	$("#editImg").attr("onclick", "editImg()");
}

//显示上传图片窗口
function uploadImg() {
	$('#imgDescription').textbox('setValue', '');
	$('#code').textbox('setValue', '');
	//	$('#myImgs').filebox('setText','');
	//	$('#myImgs').filebox();
	var layerOpen = layer.open({
		type: 1,
		title: '新增图元',
		anim: 4,
		area: ['400px', '290px'],
		content: $("#uploadImgDiv"),
		btn: ['上传'],
		yes: function() {
			checkImg(false);
		}
	});
}

function editUploadImg() {
	var dicArr = $("#drag_div div");
	var i = 0;
	var imgId, title, code;
	for(var index in dicArr) {
		if(isNaN(index)) {
			continue;
		}
		var background = dicArr[index].style.background;
		if(background && background != "rgb(255, 255, 255)") { //有值且背景不是白色则是被选中的
			console.log(background);
			console.log(dicArr[index].id);
			imgId = dicArr[index].id.split("_")[1];
			title = dicArr[index].children[0].title;
			code = dicArr[index].children[0].name;
			i++;
		}
	}
	if(i != 1) {
		layer.msg("请选择一张可编辑的图片。", {
			icon: 7,
			time: 2000,
			offset: '200px',
		});
		return;
	}

	$('#imgDescription').textbox('setValue', title);
	$('#code').textbox('setValue', code);
	$('#imgId').val(imgId);
	//	$('#myImgs').filebox('setText','');
	//	$('#myImgs').filebox();
	var layerOpen = layer.open({
		type: 1,
		title: '编辑图元信息',
		anim: 4,
		area: ['400px', '290px'],
		content: $("#uploadImgDiv"),
		btn: ['确定'],
		yes: function() {
			checkImg(true);
		}
	});
}
//校验图片
function checkImg(isUpdate) {
	if(!isUpdate) {
		var myfile = document.getElementById("filebox_file_id_1").files[0];
		if(myfile == undefined) {
			layer.msg("请选择需要上传的文件！", {
				icon: 7,
				time: 1500,
				offset: '200px',
			});
			return;
		}
	}
	//验证上传的图片格式
	var myfiles = document.getElementById("filebox_file_id_1").files;
	for(var index in myfiles) {
		if(isNaN(index)) {
			continue;
		}
		if(myfiles[index] != undefined) {
			var fileName = myfiles[index].name;
			var fileTypeArr = fileName.split(".");
			var s = fileTypeArr.length - 1;
			var fileType = fileTypeArr[s];
			var imgType = ['png', 'jpg', 'jpeg', 'gif', 'JPEG', 'GIF', 'JPG', 'PNG'];
			if(!isContain(imgType, fileType)) {
				layer.msg("图片格式错误！", {
					icon: 2,
					time: 2000,
					offset: '200px',
				});
				return;
			}
		}
	}
	var code = $("#code").textbox('getValue');
	if(!code) {
		layer.msg("图片编码不能为空！", {
			icon: 7,
			time: 2000,
			offset: '200px',
		});
		return;
	}

	if(code.split("，").length > 1) {
		layer.msg("图片编码只能为1个，且不能含有特殊字符。", {
			icon: 2,
			time: 2000,
			offset: '200px',
		})
		return;
	}

	if(isUpdate) {
		updateImg();
	} else {
		saveImg();
	}
}
//提交图片信息到后台
function updateImg() {
	var formData = new FormData($("#uploadImgForm")[0]);
	formData.append("imgType", 1);
	$.ajax({
		url: COMMO_URL + "/topo/upadteImg.do",
		type: "POST",
		datatype: "json",
		data: formData,
		contentType: false,
		processData: false,
		success: function(data) {
			layer.closeAll(); //关闭弹出框
			if(data.code == 200) {
				layer.msg(data.msg, {
					icon: 1,
					time: 1500,
					offset: '200px',
				});
				$("#drag_div").empty();
				loadImgAll();
			} else {
				layer.msg(data.msg, {
					icon: 2,
					time: 1500,
					offset: '200px',
				});
			}
		}
	})
}

//提交图片信息到后台
function saveImg() {
	var formData = new FormData($("#uploadImgForm")[0]);
	formData.append("imgType", 1);
	$.ajax({
		url: COMMO_URL + "/topo/saveImg.do",
		type: "POST",
		datatype: "json",
		data: formData,
		contentType: false,
		processData: false,
		success: function(data) {
			layer.closeAll(); //关闭弹出框
			if(data.code == 200) {
				layer.msg(data.msg, {
					icon: 1,
					time: 1500,
					offset: '200px',
				});
				$("#drag_div").empty();
				loadImgAll();
			} else {
				layer.msg(data.msg, {
					icon: 2,
					time: 1500,
					offset: '200px',
				});
			}
		}
	})
}

//图元菜单栏点击事件
function imgEleClick() {
	$(".img_menu").mouseover(function() {
		$(this).css("background-color", "#fff");
		$(this).css("border-radius", "6px");
	});
	$(".img_menu").mouseout(function() {
		$(this).css("background-color", "");
		$(this).css("border-radius", "");
	});
	$(".img_menu").mousedown(function() {
		$(this).css("background-color", "#ddd");
		$(this).css("border-radius", "6px");
	});
	$(".img_menu").mouseup(function() {
		$(this).css("background-color", "");
		$(this).css("border-radius", "");
	});

}

//拖拽
function setDrag(obj) {
	obj.onmouseover = function() {
		obj.style.cursor = "move";
	}
	obj.onmousedown = function(event) {
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
		obj.style.zIndex = minZindex++;
		//当鼠标按下时计算鼠标与拖拽对象的距离
		disX = event.clientX + scrollLeft - obj.offsetLeft;
		disY = event.clientY + scrollTop - obj.offsetTop;
		document.onmousemove = function(event) {
			//当鼠标拖动时计算div的位置
			var l = event.clientX - disX + scrollLeft;
			var t = event.clientY - disY + scrollTop;
			obj.style.left = l + "px";
			obj.style.top = t + "px";
			/*for(var i=0;i<aLi.length;i++){
				aLi[i].className = "";
				if(obj==aLi[i])continue;//如果是自己则跳过自己不加红色虚线
				if(colTest(obj,aLi[i])){
					aLi[i].className = "active";
				}
			}*/
			for(var i = 0; i < aLi.length; i++) {
				aLi[i].className = aLi[i].className;
			}
			var oNear = findMin(obj);

			if(oNear) {
				//oNear.className = "active";
			}
		}
		document.onmouseup = function() {
			document.onmousemove = null; //当鼠标弹起时移出移动事件
			document.onmouseup = null; //移出up事件，清空内存
			//检测是否普碰上，在交换位置
			var oNear = findMin(obj);
			if(oNear) {
				var width1 = oNear.clientWidth;
				var height1 = oNear.clientHeight;
				var width2 = obj.clientWidth;
				var height2 = obj.clientHeight;
				//				console.log(width1+width2)
				//                console.log(oNear.className);
				//                 console.log(obj.className)
				var className1 = obj.className;
				var className2 = oNear.className;
				obj.className = className2;
				oNear.className = className1;
				oNear.style.zIndex = minZindex++;
				obj.style.zIndex = minZindex++;
				startMove(oNear, aPos[obj.index]);
				startMove(obj, aPos[oNear.index]);
				//交换index
				oNear.index += obj.index;
				obj.index = oNear.index - obj.index;
				oNear.index = oNear.index - obj.index;

				obj.clientWidth = width2;
				obj.clientHeight = height2;

				oNear.clientWidth = width1;
				oNear.clientHeight = height1;

			} else {
				startMove(obj, aPos[obj.index]);
				var imgEleId = obj.id.split("_")[1];
				if(_imgEleIdList.length > 0) {
					if(isContain(_imgEleIdList, imgEleId)) { //重复点击 取消选中状态，并移除
						var index = _imgEleIdList.indexOf(imgEleId);
						_imgEleIdList.splice(index, 1);
						obj.style.background = "#fff";
					} else {
						_imgEleIdList.push(imgEleId);
						obj.style.background = "#9e9c8f";
					}
				} else {
					_imgEleIdList.push(imgEleId);
					obj.style.background = "#9e9c8f";
				}
			}
		}
		clearInterval(obj.timer);
		return false; //低版本出现禁止符号
	}
}
//碰撞检测
function colTest(obj1, obj2) {
	var t1 = obj1.offsetTop;
	var r1 = obj1.offsetWidth + obj1.offsetLeft;
	var b1 = obj1.offsetHeight + obj1.offsetTop;
	var l1 = obj1.offsetLeft;

	var t2 = obj2.offsetTop;
	var r2 = obj2.offsetWidth + obj2.offsetLeft;
	var b2 = obj2.offsetHeight + obj2.offsetTop;
	var l2 = obj2.offsetLeft;

	if(t1 > b2 || r1 < l2 || b1 < t2 || l1 > r2) {
		return false;
	} else {
		return true;
	}
}
//勾股定理求距离
function getDis(obj1, obj2) {
	var a = obj1.offsetLeft - obj2.offsetLeft;
	var b = obj1.offsetTop - obj2.offsetTop;
	return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
//找到距离最近的
function findMin(obj) {
	var minDis = 999999999;
	var minIndex = -1;
	for(var i = 0; i < aLi.length; i++) {
		if(obj == aLi[i]) continue;
		if(colTest(obj, aLi[i])) {
			var dis = getDis(obj, aLi[i]);
			if(dis < minDis) {
				minDis = dis;
				minIndex = i;
			}
		}
	}
	if(minIndex == -1) {
		return null;
	} else {
		return aLi[minIndex];
	}
}

function getStyle(obj, attr) { //解决JS兼容问题获取正确的属性值
	return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
}

function startMove(obj, json, fun) {
	clearInterval(obj.timer);
	obj.timer = setInterval(function() {
		var isStop = true;
		for(var attr in json) {
			var iCur = 0;
			//判断运动的是不是透明度值
			if(attr == "opacity") {
				iCur = parseInt(parseFloat(getStyle(obj, attr)) * 100);
			} else {
				iCur = parseInt(getStyle(obj, attr));
			}
			var ispeed = (json[attr] - iCur) / 8;
			//运动速度如果大于0则向下取整，如果小于0想上取整；
			ispeed = ispeed > 0 ? Math.ceil(ispeed) : Math.floor(ispeed);
			//判断所有运动是否全部完成
			if(iCur != json[attr]) {
				isStop = false;
			}
			//运动开始
			if(attr == "opacity") {
				obj.style.filter = "alpha:(opacity:" + (json[attr] + ispeed) + ")";
				obj.style.opacity = (json[attr] + ispeed) / 100;
			} else {
				obj.style[attr] = iCur + ispeed + "px";
			}
		}
		//判断是否全部完成
		if(isStop) {
			clearInterval(obj.timer);
			if(fun) {
				fun();
			}
		}
	}, 30);
}

/*************************图片拖拽至画布内**************************/
var _newNodeImgPath = null; //拖拽的图片的路径
var _entityType = null;

function drag(ev) {
	console.log("drag:" + ev.target.src + "," + ev.target.name);
	ev.dataTransfer.setData("imgPath", ev.target.src);
	ev.dataTransfer.setData("entityType", ev.target.name);
}

function allowDrop(ev) {
	ev.preventDefault();
}

function dropImg(ev) {
	ev.preventDefault();
	_newNodeImgPath = ev.dataTransfer.getData("imgPath");
	_newNodeImgPath = _newNodeImgPath.substring(_newNodeImgPath.lastIndexOf("\/") + 1, _newNodeImgPath.length);
	_entityType = ev.dataTransfer.getData("entityType");
	console.log("dropImg:" + _newNodeImgPath + "," + _entityType);
}

function dragImg() {
	if(_newNodeImgPath) {
		var img = _newNodeImgPath;
		//新增节点
		if(_entityType == 'jx') {
			console.log("dragImg jx");
			var container = newContainer(_add_x, _add_y, 200, 100, "", "", 'contentNode', _entityType, 0, null);
		} else {
			//		if (img.indexOf("cloud") != -1) {//标记为云图，用于显示子拓扑菜单
			//			imgType = "yun";
			//		}
			//		if (img.indexOf("on-off") != -1) {//标记为开关，用于显示开/合菜单
			//			imgType = "on-off";
			//		}
			//新增节点
			var node = newNode(_add_x, _add_y, 10, 10, "", _entityType, img, 0, null);
		}
		_newNodeImgPath = null;
		_entityType = null;
	}
}

/*************************节点\链路 右键菜单**************************/

//节点右键菜单事件和双击事件
function nodeContextMenu(node) {
	node.addEventListener("mouseup", function(e) {
		if(e.button == 2) { //2表示右键
			var nodeType = node.nodeType;
			console.log("nodeContextMenu nodeType:" + nodeType);
			if(nodeType == "imgNode") {
				globalNodeA = node;
				nodeA_x = e.x;
				nodeA_y = e.y;
				$("#openOrClose").css("display", "none");
				if('switch' == node.entityType) {
					$("#openOrClose").css("display", "");
					var tt = "打开";
					if(node.imgPath.indexOf("-off") > -1) {
						tt = "合上";
					}
					$("#openOrCloseText").text(tt);
				}
				$("#contextmenu4").menu('show', {
					left: e.pageX,
					top: e.pageY
				});
			} else if(nodeType == "circleNode") {
				globalNodeA = node;
				nodeA_x = e.x;
				nodeA_y = e.y;
				$("#contextmenu").menu('show', {
					left: e.pageX,
					top: e.pageY
				});
			} else if(nodeType == "textNode") {
				$("#contextmenu5").menu('show', {
					left: e.pageX,
					top: e.pageY
				});
			} else if(nodeType == "contentNode") {
				$("#contextmenuContent").menu('show', {
					left: e.pageX,
					top: e.pageY
				});
			}
			align_x = node.x + (node.width / 2);
			align_y = node.y + (node.height / 2);
		}
	});

}

//连线右键菜单事件
function linkContextMenu(link) {
	link.addEventListener("mouseup", function(e) {
		if(e.button == 2) {
			$("#contextmenu2").menu('show', {
				left: e.pageX,
				top: e.pageY
			});
		}
	});
}

/*************************创建节点、链路**************************/
function newNodeCommon(node) {
	console.log("newNode:" + node.nodeType + "," + node.text);
	var node;
	if("imgNode" == node.nodeType) {
		node = newNode(node.x, node.y, node.width, node.height, node.text, node.entityType, node.imgPath, node.rotate, node.entityId);
	} else if("circleNode" == node.nodeType) {
		node = newCircleNode(node.x, node.y, node.text, "");
	}
	return node;
}

function newNode(x, y, w, h, text, entityType, img, rotate, entityId) {
	console.log("newNode");
	var node = new JTopo.Node(text);
	//节点名称换行方法
	//	node.paintText = function(a){
	//		a.beginPath();newNode
	//		a.font = this.font;
	//		a.wrapText(text,this.height/2,this.height);
	//		a.closePath();
	//	}
	node.setBound(x, y, w, h); //位置
	node.font = '13px 楷体';
	node.fontColor = '#0c0c0c';
	node.imgPath = img;
	if(rotate) {
		node.rotate = rotate;
	} else {
		node.rotate = 0;
	}
	//	node.textPosition = 'Middle_Center';
	//确定节点图片路径
	if(node.imgPath == null) {
		node.fillColor = "164,46,237"; //颜色
	} else {
		node.setImage(COMMO_URL_IMG + node.imgPath, false); //true:图片实际尺寸，false：节点设置的宽高
	}
	node.nodeType = "imgNode";
	node.entityType = entityType;
	node.nodeId = node._id;
	node.entityId = entityId;
	/*	var entity = {"id":node._id,"imgType":imgType,"imgPath":img,"isCircle":false};
		node.entity = entity;    // 在创建节点的时候添加自定义属性   
	    node.serializedProperties.push("entity"); // 把自定义属性加入进节点的属性组 serializedProperties 中
	*/
	nodeContextMenu(node);
	addClickEvent(node); //点击事件
	scene.add(node);
	//	console.log("imgPath:" + node.imgPath);
	var ems = buildEmsNode(node, 0);
	var emslist = [];
	emslist.push(ems);
	var content = {
		"ems": emslist
	};
	operateTopoList(content, true);
	return node;
}
/**
 * 创建圆形节点--描述设备接口详情
 * @param x
 * @param y
 * @param text 文本
 * @param color  节点颜色
 * @returns
 */
function newCircleNode(x, y, text, radius) {
	var circleNode = new JTopo.CircleNode(text);
	if(radius) {
		circleNode.radius = radius; // 半径
	} else {
		circleNode.radius = 3; // 半径
	}
	circleNode.alpha = 1; //节点透明度
	circleNode.fillColor = "239,120,0"; // 填充颜色
	circleNode.setLocation(x, y);
	circleNode.textPosition = 'Middle_Center'; // 文本位置
	circleNode.textOffsetY = -2; // 文字向上偏移2个像素
	circleNode.fontColor = '#0c0c0c';
	circleNode.dragable = true; //不许拖拽
	circleNode.nodeType = "circleNode";
	//添加父节点属性，方便一起拖动
	/*    var entity = {"id":circleNode._id,"radius":circleNode._radius,"isCircle":true};
		circleNode.entity = entity;    // 在创建节点的时候添加自定义属性   
		circleNode.serializedProperties.push("entity"); // 把自定义属性加入进节点的属性组 serializedProperties 中
	*/
	circleNode.nodeId = circleNode._id;
	nodeContextMenu(circleNode);
	addClickEvent(circleNode); //点击事件
	scene.add(circleNode);

	var emslist = [];
	var ems = buildEmsNode(circleNode, 0);
	emslist.push(ems);
	var content = {
		"ems": emslist
	};
	operateTopoList(content, true);
	return circleNode;
}

//创建连线
function createLink(nodeA, nodeZ, linkStyle, linkName) {
	var link = null;
	switch(linkStyle) {
		case 2:
			link = new JTopo.FoldLink(nodeA, nodeZ);
			break;
		case 3:
			link = new JTopo.FlexionalLink(nodeA, nodeZ);
			break;
		case 4:
			link = new JTopo.CurveLink(nodeA, nodeZ);
			break;
		default:
			link = new JTopo.Link(nodeA, nodeZ);
	}
	link.text = linkName;
	link.lineWidth = 1; // 线宽
	link.strokeColor = "239,120,0"; // 
	link.font = '13px 楷体';
	link.fontColor = '#0c0c0c'; //黑色
	//	link.arrowsRadius=5;//箭头大小
	/*    link.idA = nodeA.entity.id;    // 在创建节点的时候添加自定义属性   
	    link.serializedProperties.push("idA"); // 把自定义属性加入进节点的属性组 serializedProperties 中
	    link.idZ = nodeZ.entity.id;      
	    link.serializedProperties.push("idZ"); 
	    link.serializedProperties.push("linkStyle");
	    
	    link.linkId = link._id;  
	    link.serializedProperties.push("linkId");
	*/
	link.linkStyle = linkStyle;
	linkContextMenu(link);
	addClickEvent(link); //点击事件
	scene.add(link);

	var emslist = [];
	var ems1 = {}
	var dto = {
		"id": link.id,
		"del": 0,
		"linkFlow": null,
		"linkName": link.text,
		"linkType": link.linkStyle,
		"anodeId": nodeA.nodeId,
		"znodeId": nodeZ.nodeId

	};
	//	console.log("container.posx："+JSON.stringify(container));
	var ems1 = {
		"elementType": "link",
		"dto": dto
	};
	emslist.push(ems1);
	var content = {
		"ems": emslist
	};
	operateTopoList(content, true);

	return link;
}

// 简单连线
function newLink(nodeA, nodeZ, text) {
	var link = new JTopo.Link(nodeA, nodeZ, text);
	link.lineWidth = 1; // 线宽
	//link.dashedPattern = dashedPattern; // 虚线
	link.direction = 'vertical';
	link.bundleGap = 0; // 线条之间的间隔
	link.textOffsetY = 3; // 文本偏移量（向下3个像素）
	link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
	scene.add(link);
	return link;
}

function addTempLink(nodeA, linkType) {
	if(nodeA instanceof JTopo.Node) {
		switch(linkType) {
			case 2:
				_link = new JTopo.FoldLink(tempNodeA, tempNodeZ);
				break;
			case 3:
				_link = new JTopo.FlexionalLink(tempNodeA, tempNodeZ);
				break;
			case 4:
				_link = new JTopo.CurveLink(tempNodeA, tempNodeZ);
				break;
			default:
				_link = new JTopo.Link(tempNodeA, tempNodeZ);
		}
		scene.add(_link);
		tempNodeA.setLocation(nodeA_x, nodeA_y);
		tempNodeZ.setLocation(nodeA_x, nodeA_y);
	}
}

function addLinkByLinkType(linkType) {
	dragLine = true;
	globalLinkStyle = linkType;
	addTempLink(globalNodeA, linkType); //设备连线方法
}

/**
 *创建文本节点--拓扑注释
 */
function newTextNode(x, y, w, h, text, entityType) {
	if(!x) {
		x = _add_x;
	}
	if(!y) {
		y = _add_y;
	}
	var textNode = new JTopo.TextNode(text);
	//textNode.zIndex++;
	textNode.setBound(x, y, w, h); //位置
	//textNode.dragable = false;//不许拖拽
	textNode.nodeType = "textNode";
	textNode.nodeId = textNode._id;
	textNode.entityType = entityType;
	textNode.font = '14px 黑体';
	textNode.fontColor = '255,255,255';
	if('name' == textNode.entityType) {
		textNode.font = '24px 黑体';
		textNode.fontColor = '255,255,255';
	}
	nodeContextMenu(textNode);
	addClickEvent(textNode); //点击事件
	scene.add(textNode);

	var emslist = [];
	var ems = buildEmsNode(textNode, 0);
	emslist.push(ems);
	var content = {
		"ems": emslist
	};
	operateTopoList(content, true);
	return textNode;
}

//在线上创建节点/创建线的交点
function createDbNode(link) {
	var nodeA = link.nodeA;
	var nodeZ = link.nodeZ;
	var x = _add_x;
	var y = _add_y;
	var nodeMid = newCircleNode(x, y, "");
	var linkStyle = link.linkStyle;
	console.log("linkStyle:" + linkStyle);
	var linkName = link.text;
	if(link.id != null) {
		_deleteLinkList.push(link);
	}
	//删除原有线路
	scene.remove(link);
	deleteLink(link);
	var link1 = createLink(nodeA, nodeMid, linkStyle, linkName);
	var link2 = createLink(nodeMid, nodeZ, linkStyle, linkName);

}

/*************************链路\节点 删除**************************/
//删除容器
function deleteContent() {
	/*var data = scene.selectedElements;
	var node = data[0];
	if(node.id != null) {
		console.log("deleteContent:" + JSON.stringify(node.id));
		scene.remove(node);
		var emslist = [];
		var ems1 = {}
		var childs = [];
		var dto = {
			"del": 1,
			"id": node.id
		};
		//	console.log("container.posx："+JSON.stringify(container));
		var ems1 = {
			"elementType": "node",
			"dto": dto
		};
		emslist.push(ems1);
		var content = {
			"ems": emslist
		};
		operateTopoList(content);
	}*/
	updataSelectNodes(1);
}

/**
 * 合并容器和节点
 * 一个容器多个节点
 */
function mergeContent() {
	var data = scene.selectedElements;
	console.log("updataSelectNodes selectedElements.length:" + data.length);
	var emslist = [];
	var nodesContent = [];
	var childs = [];
	var child = {};
	for(var i = 0; i < data.length; i++) {
		console.log(i + ":" + data[i].nodeType + "," + data[i].entityType);
		var node = data[i];
		if(('imgNode' == node.nodeType || 'textNode' == node.nodeType || "circleNode" == node.nodeType) && node.id) {
			child = buildDtoNode(node, 0);
			childs.push(child);
		} else if(node.nodeType == 'contentNode') {
			nodesContent.push(node);
		}
	}
	console.log("nodesContent:" + nodesContent.length + ",childs:" + childs.length);
	if(nodesContent.length == 1 && childs.length > 0) {
		console.log("可以合并");
		var ems = buildEmsNode(nodesContent[0], 0, childs);
		emslist.push(ems);
	} else {
		layer.msg("请选择合适的区域和开关！", {
			icon: 5,
			offset: '200px',
			time: 1000
		});
	}
	var content = {
		"ems": emslist
	};
	//	console.log("updataSelectNodes:"+del);
	operateTopoList(content, true);
}
//删除节点
function deleteNode() {
	/*var data = scene.selectedElements;
	var node = data[0];
	if(node.id != null) {
		console.log("deleteNode:" + JSON.stringify(node.id));
		scene.remove(node);
		var emslist = [];
		var ems1 = {}
		var childs = [];
		var dto = {
			"del": 1,
			"id": node.id
		};
		//	console.log("container.posx："+JSON.stringify(container));
		var ems1 = {
			"elementType": "node",
			"dto": dto
		};
		emslist.push(ems1);
		var content = {
			"ems": emslist
		};
		operateTopoList(content);*/

	//	}
	updataSelectNodes(1);
}

function deleteLink(link) {
	var data = scene.selectedElements;
	if(link == null) {
		console.log("deleteLink: null");
		var link = data[0];
	}
	if(link.id != null) {
		console.log("deleteLink:" + JSON.stringify(link.id));
		scene.remove(link);
		var emslist = [];
		var ems1 = {}
		var dto = {
			"del": 1,
			"id": link.id
		};
		//	console.log("container.posx："+JSON.stringify(container));
		var ems1 = {
			"elementType": "link",
			"dto": dto
		};
		emslist.push(ems1);
		var content = {
			"ems": emslist
		};
		operateTopoList(content);
	}
}

function addLinkNode() {
	var data = scene.selectedElements;
	var link = data[0];
	createDbNode(link);
}

function rotateNode() {
	var data = scene.selectedElements;
	var node = data[0];
	node.rotate += 0.785;
	updataNode(node);
}

function alignXNode() {
	var data = scene.selectedElements;
	for(var i = 0; i < data.length; i++) {
		var node = data[i];
		if(node instanceof JTopo.Node) {
			node.setLocation(node.x, align_y - (node.height / 2));
		}
	}
	updataSelectNodes(0);
}

function alignYNode() {
	var data = scene.selectedElements;
	for(var i = 0; i < data.length; i++) {
		var node = data[i];
		if(node instanceof JTopo.Node) {
			node.setLocation(align_x - (node.width / 2), node.y);
		}
	}
	updataSelectNodes(0);
}

function addCircleNode() {
	var node = newCircleNode(_add_x, _add_y, "");
}
//新增环网柜
function addHwg() {
	$("#message_text").val("HWG");
	var index = layer.open({
		type: 1,
		title: '注释',
		anim: 1,
		area: ['350px', '300px'],
		content: $("#message_div"),
		btn: ['确认', '关闭'],
		yes: function() {
			var text = $("#message_text").val();
			var textType = $("input[name='textType']:checked").val();
			console.log("textType:" + textType);
			var node = newContainer(_add_x, _add_y, 200, 100, text, textType, "hwg", "", 0, null);
			layer.close(index);
		}
	});
}

function addTextNode() {
	$("#message_text").val("");
	var index = layer.open({
		type: 1,
		title: '注释',
		anim: 1,
		area: ['350px', '300px'],
		content: $("#message_div"),
		btn: ['确认', '关闭'],
		yes: function() {
			var text = $("#message_text").val();
			var textType = $("input[name='textType']:checked").val();
			console.log("textType:" + textType);
			var node = newTextNode(null, null, 100, 100, text, textType);
			layer.close(index);
		}
	});
}

function updateTextNode() {
	var data = scene.selectedElements;
	var node = data[0];

	$("#message_text").val(node.text);
	var index = layer.open({
		type: 1,
		title: '注释',
		anim: 1,
		area: ['350px', '300px'],
		content: $("#message_div"),
		btn: ['确认', '关闭'],
		yes: function() {
			var text = $("#message_text").val();
			node.text = text;
			var textType = $("input[name='textType']:checked").val();
			console.log("textType:" + textType);
			node.entityType = textType;
			updataNode(node);
			layer.close(index);
		}
	});
}

function updateNodeInfo() {
	var data = scene.selectedElements;
	var node = data[0];
	if('switch' == node.entityType || 'transformer' == node.entityType) {
		updateNodeImg(node);
	} else {
		updateNodeText(node);
	}

}

function updateNodeText(node) {
	console.log("updateNodeText");
	$("#device_name_div_text").val(node.text);
	var index = layer.open({
		type: 1,
		title: '编辑名称',
		anim: 1,
		area: ['280px', '180px'],
		content: $("#device_name_text"),
		btn: ['确认', '关闭'],
		yes: function() {
			var text = $("#device_name_div_text").val();
			node.text = text;
			updataNode(node);
			layer.close(index);
		}
	});

}

function updateNodeImg(node) {
	console.log("updateNodeImg");
	$("#device_name_div_img").val(node.text);
	var imgPathH = node.imgPath;
	var imgPathV = node.imgPath;
	if(node.imgPath.indexOf("-v.") > -1) {
		imgPathH = imgPathH.replace("-v.", ".");
	} else {
		imgPathV = imgPathV.replace(".", "-v.");
	}
	$("#imgTypeh").attr("src", COMMO_URL_IMG + imgPathH);
	$("#imgTypev").attr("src", COMMO_URL_IMG + imgPathV);
	var index = layer.open({
		type: 1,
		title: '编辑名称',
		anim: 1,
		area: ['280px', '250px'],
		content: $("#device_name_img"),
		btn: ['确认', '关闭'],
		yes: function() {
			var text = $("#device_name_div_img").val();
			node.text = text;
			var imgType = $("input[name='imgType']:checked").val();
			console.log("imgType:" + imgType + "," + node.imgPath);
			if('h' == imgType) {
				node.imgPath = imgPathH;
				node.width = imgW;
				node.height = imgH;
			} else {
				node.imgPath = imgPathV;
				node.width = imgH;
				node.height = imgW;
			}
			node.setImage(COMMO_URL_IMG + node.imgPath, false); //true:图片实际尺寸，false：节点设置的宽高
			updataNode(node);
			layer.close(index);
		}
	});

}
/*************************topo 保存 **************************/
//保存
function saveTopo() {
	var translateX = scene.translateX;
	var translateY = scene.translateY;
	translateX = 0;
	translateY = 0;
	console.log("saveTopo:" + translateX + "," + translateY);
	var emslist = [];
	scene.findElements(function(e) {
		var node = e;
		//		console.log("findElements:"+node.nodeType+","+node.saveFlag+","+node.parentId);
		var ems = buildEmsNode(node, 0);
		if(ems) {
			emslist.push(ems);
		}
	});
	//
	var content = {
		"ems": emslist
	};
	operateTopoList(content, true);
}
/*
 * del 0 新增/更新     1删除
 */
function buildEmsNode(node, del, childs) {
	if(del == 1) {
		scene.remove(node);
	}
	var dto = buildDtoNode(node, del, childs);
	if(dto) {
		var ems = {
			"elementType": "node",
			"dto": dto
		};
		return ems;
	}
	return;
}
//
function buildDtoNode(node, del, childs) {
	//	console.log("buildDtoNode:"+(del==0));
	if("no" != node.saveFlag) { //不保存
		var dto = {};
		if(del == 1) { //删除
			dto = {
				"del": del,
				"id": node.id
			};
		} else if(childs) {
			dto = {
				"del": del,
				"id": node.id,
				"entityId": node.entityId,
				"entityType": node.entityType,
				"height": node.height,
				"nodeId": node.nodeId,
				"nodeName": node.text,
				"nodeType": node.nodeType,
				"posx": node.x,
				"posy": node.y,
				"rotate": node.rotate,
				"width": node.width,
				"imgPath": node.imgPath,
				"parentId": node.parentId,
				"childs": childs
			};
		} else {
			dto = {
				"del": del,
				"id": node.id,
				"entityId": node.entityId,
				"entityType": node.entityType,
				"height": node.height,
				"nodeId": node.nodeId,
				"nodeName": node.text,
				"nodeType": node.nodeType,
				"posx": node.x,
				"posy": node.y,
				"rotate": node.rotate,
				"width": node.width,
				"imgPath": node.imgPath,
				"parentId": node.parentId
			};
		}
		return dto;
	}
	return;
}
/**
 * node文字换行居中方法
 */
CanvasRenderingContext2D.prototype.wrapText = function(str, x, y) {
	var textArray = str.split(',');
	if(textArray == undefined || textArray == null) return false;

	var rowCnt = textArray.length;
	var i = 0,
		imax = rowCnt,
		maxLength = 0;
	maxText = textArray[0];
	for(; i < imax; i++) {
		var nowText = textArray[i],
			textLength = nowText.length;
		if(textLength >= maxLength) {
			maxLength = textLength;
			maxText = nowText;
		}
	}
	//换行，左对齐
	var maxWidth = this.measureText(maxText).width;
	var lineHeight = this.measureText("元").width;
	x -= lineHeight * 2;
	for(var j = 0; j < textArray.length; j++) {
		var words = textArray[j];
		//换行，居中，
		var maxWidth = this.measureText(textArray[j]).width;
		this.fillText(words, -(maxWidth / 2), y - textArray.length * lineHeight / 100);
		y += lineHeight;
	}
}
//根据图片名称自动生成编码
function autoImgCode() {
	var myfile = document.getElementById("filebox_file_id_1");
	if(myfile == undefined || myfile.files.length == 0) {
		return;
	}
	var imgName = myfile.files[0].name;
	var codeArr = makePy(imgName.toUpperCase());
	var code = "";
	if(codeArr) {
		for(var index in codeArr) {
			if(isNaN(index)) {
				continue;
			}
			if(index > 0) {
				code = code + "，" + codeArr[index].split(".")[0];
			} else {
				code = code + codeArr[index].split(".")[0];
			}
		}
		$('#code').textbox('setValue', code);
	}
}

/**
 * 延迟方法
 * @returns
 */
function sleep(d) {
	var t = Date.now();
	while(Date.now() - t <= d);
}
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

//拖拽新增容器
function newContainer(x, y, w, h, text, textType, entityType, img, rotate, entityId) {
	console.log("newContainer entityId:" + entityId);
	var container = new JTopo.Container();
	container.nodeType = 'contentNode';
	container.entityId = entityId;
	container.entityType = entityType;
	container.nodeId = container._id;
	container.textPosition = 'Middle_Left';
	container.fontColor = '255,255,255';
	//  container.font = '18pt 微软雅黑';
	container.border = 'solid';
	container.borderWidth = 1;
	container.borderColor = '255,0,0';
	container.borderRadius = 0; // 圆角
	container.setBound(x, y, w, h);
	container.fillColor = '0,0,0';
	container.alpha = 1; //透明度
	container.resizable = true;
	//	container.zIndex=-2;//折叠时的层数
	nodeContextMenu(container);
	scene.add(container);
	//
	var textNode;
	if(text) { //这里不调用后台接口
		textNode = sceneAddTextNode(x + w / 2, y + h / 2, 30, 10, text, textType);
		container.add(textNode);
	}
	//
	var node1 = sceneAddNode(x, y, 5, 5, "", "", tzjdImg, 0, null);
	console.log("node1:" + JSON.stringify(node1._id));
	node1.saveFlag = "no";
	node1.rotate = -0.785;
	var node2 = sceneAddNode(x + w, y + h, 5, 5, "", "", tzjdImg, 0, null);
	console.log("node2:" + JSON.stringify(node2._id));
	node2.saveFlag = "no";
	node2.rotate = 2.285;
	container.add(node1);
	container.add(node2);

	var emslist = [];
	var childs = [];
	var child = {};
	if(textNode) {
		console.log("textNode");
		child = buildDtoNode(textNode, 0);
		console.log("child:" + child);
		childs.push(child);
	}
	var ems = buildEmsNode(container, 0, childs);
	emslist.push(ems);
	var content = {
		"ems": emslist
	};
	operateTopoList(content, true);
	return container;
}

function sceneAddNode(x, y, w, h, text, entityType, img, rotate, entityId) {
	//	console.log(h+","+entityType);
	var node = new JTopo.Node(text);
	//节点名称换行方法
	//	node.paintText = function(a){
	//		a.beginPath();
	//		a.font = this.font;
	//		a.wrapText(text,this.height/2,this.height);
	//		a.closePath();
	//	}
	node.setBound(x, y, w, h); //位置
	node.font = '13px 楷体';
	node.fontColor = '#0c0c0c';
	if(rotate) {
		node.rotate = rotate;
	} else {
		node.rotate = 0;
	}
	//	node.textPosition = 'Middle_Center';
	//确定节点图片路径
	//	console.log("img:"+img);
	if(img == null) {
		node.fillColor = "164,46,237"; //颜色
	} else {
		node.setImage(COMMO_URL_IMG + img, false); //true:图片实际尺寸，false：节点设置的宽高
	}
	node.nodeType = "imgNode";
	node.imgPath = img;
	node.entityType = entityType;
	node.nodeId = node._id;
	node.entityId = entityId;
	/*	var entity = {"id":node._id,"imgType":imgType,"imgPath":img,"isCircle":false};
		node.entity = entity;    // 在创建节点的时候添加自定义属性   
	    node.serializedProperties.push("entity"); // 把自定义属性加入进节点的属性组 serializedProperties 中
	*/
	nodeContextMenu(node);
	addClickEvent(node); //点击事件
	scene.add(node);
	return node;
}

function sceneAddTextNode(x, y, w, h, text, entityType) {
	if(!x) {
		x = _add_x;
	}
	if(!y) {
		y = _add_y;
	}
	var textNode = new JTopo.TextNode(text);
	//textNode.zIndex++;
	textNode.entityType = entityType;
	textNode.setBound(x, y, w, h); //位置
	textNode.font = '14px 黑体';
	textNode.fontColor = '255,255,255';
	if('name' == textNode.entityType) {
		textNode.font = '30px 黑体';
		textNode.fontColor = '255,0,0';
	}
	//textNode.dragable = false;//不许拖拽
	textNode.nodeType = "textNode";
	textNode.nodeId = textNode._id;

	nodeContextMenu(textNode);
	addClickEvent(textNode); //点击事件
	scene.add(textNode);
	return textNode;
}

function sceneAddContainer(x, y, w, h, text, entityType, img, obj) {
	var childs = obj.childs;
	var container = new JTopo.Container();
	//, entityId, childs

	container.id = obj.id;
	container.entityType = entityType;
	container.entityId = obj.entityId;
	container.nodeType = 'contentNode';
	container.textPosition = 'Middle_Left';
	container.fontColor = '255,255,255';
	//  container.font = '18pt 微软雅黑';
	container.border = 'solid';
	container.borderWidth = 1;
	container.borderColor = '255,0,0';
	container.borderRadius = 0; // 圆角
	container.setBound(x, y, w, h);
	container.fillColor = '0,0,0';
	container.alpha = 1; //透明度
	container.resizable = true;
	container.zIndex = -2; //折叠时的层数
	//	scene.add(container);
	addChilds(container, childs); //
	//x, y, w, h, text, entityType, img, rotate, entityId
	var node1 = sceneAddNode(x, y, 5, 5, "", "", tzjdImg, 0, null);
	//	console.log("node1:" + JSON.stringify(node1._id));
	node1.saveFlag = "no";
	node1.parentId = container.id;
	node1.rotate = -0.785;
	var node2 = sceneAddNode(x + w - 5, y + h - 5, 5, 5, "", "", tzjdImg, 0, null);
	//	console.log("node2:" + JSON.stringify(node2._id));
	node2.saveFlag = "no";
	node2.parentId = container.id;
	node2.rotate = 2.285;
	container.add(node1);
	container.add(node2);
	//	var childsCount = container.childs.length;
	//	for(var i = 0; i < childsCount; i++) {
	//		console.log("container:" + JSON.stringify(container.childs[i]._id));
	//	}
	return container;
}

function addChilds(container, childs) {
	var obj;
	var nodeType;
	var x;
	var y;
	var w;
	var h;
	var rotate;
	var name;
	var node;
	if(childs) {
		//		console.log("childs.length:" + JSON.stringify(childs.length));
		for(var i = 0; i < childs.length; i++) {
			obj = childs[i];
			nodeType = obj.nodeType;
			x = obj.posx;
			y = obj.posy;
			w = obj.width;
			h = obj.height;
			rotate = obj.rotate;
			name = obj.nodeName;
			if(nodeType == "textNode") { //普通文本node
				console.log("textNode:");
				node = new JTopo.TextNode(name);
				node.font = '14px 黑体';
				node.fontColor = '255,255,255';
				//textNode.dragable = false;//不许拖拽
				node.zIndex = -1;
			} else if(nodeType == "imgNode") { //图片node
				//			var imgPath = obj.imgPath;
				var imgPath = COMMO_URL_IMG + obj.imgPath;
				//		console.log("imgPath:" + imgPath);
				node = new JTopo.Node(name);
				//		node.font = '13px 楷体';
				//		node.fontColor = '#0c0c0c';
				node.font = '14px 黑体';
				node.fontColor = '255,255,255';
				node.setImage(imgPath, false); //true:图片实际尺寸，false：节点设置的宽高
			} else if(nodeType == "circleNode") { //圆点node
				node = new JTopo.CircleNode(name);
				node.radius = 15; // 半径
				node.alpha = 1; //节点透明度
				node.fillColor = "239,120,0"; // 填充颜色
				node.fontColor = '#0c0c0c';
				node.dragable = true; //不许拖拽
				node.nodeType = "circleNode";
			}
			if(rotate) {
				node.rotate = rotate;
			} else {
				node.rotate = 0;
			}
			node.setBound(x, y, w, h); //位置
			node.nodeId = obj.nodeId;
			node.id = obj.id;
			node.nodeType = obj.nodeType;
			node.entityType = obj.entityType;
			node.imgPath = obj.imgPath;
			if('name' == node.entityType) {
				node.font = '30px 黑体';
				node.fontColor = '255,0,0';
			}
			node.parentId = container.id;
			nodeContextMenu(node); //右键菜单事件和双击事件
			scene.add(node);
			container.add(node);
		}
	}
}

function operateTopoList(content, refreshTopoFlag) {
	//	console.log("operateTopoList:" + JSON.stringify(content));
	//	console.log("operateTopoList:" + _topoId + "," + lineId + "," + JSON.stringify(content));
	//	console.log("operateTopoList:" + _topoId+","+lineId+ ","+_topoParentId);
	$.ajax({
		type: "post",
		url: COMMO_URL + "/topo/operateTopoList.do",
		dataType: 'json',
		data: {
			id: _topoId,
			topoName: "",
			lineId: lineId,
			zoom: scene.saclex,
			content: JSON.stringify(content)
			//			deleteLinkList: JSON.stringify(deleteLinkList)
		},
		async: false,
		success: function(result) {
			//						console.log("success operateTopoList:" + JSON.stringify(result));
			if(result && result.msg && result.msg == 'success') {
				//								console.log("success :" + JSON.stringify(result.msg));
				//加线模式
				if($("input[name='modeRadio']:checked").val() != 'edit') {
					if(refreshTopoFlag) {
						//						console.log("refreshTopoFlag")
						setTopoData(result);
					}
				} //
				/*if(result.data.node){//节点、容器
					console.log("result.data.node："+result.data.node.length)
				}
				if(result.data.link){//链路
					console.log("result.data.link："+result.data.link.length)
				}*/
			}
		},
		error: function(result) {
			console.log("error operateTopoList:" + JSON.stringify(result));
			//			layer.msg("保存数据失败！", {
			//				icon: 5,
			//				time: 1500,
			//				offset: '200px',
			//			});
		},
	})
}