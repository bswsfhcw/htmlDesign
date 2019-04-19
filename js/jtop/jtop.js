var t; //当前时间
var _add_x; //鼠标所处的x值
var _add_y; //y值
var globalNodeA = null;
var nodeA_x = null;
var nodeA_y = null;

var _link = null; //创建连线时的缓存链路
var tempLink = null; //点击链路所使用的全局变量

var _newNodeImgPath = null; //拖拽的图片的路径
var _newNodeImgCode;


//拓扑图标
var switchImg='../../img/jtop/kg.png';   //开关图
var byqImg = '../../img/jtop/byq.png';//变压器图


var canvas = document.getElementById('topo_canvas');
//alert(document.getElementById('panel').style.width);
canvas.width=document.documentElement.clientWidth-document.getElementById('panel').clientWidth;
var stage = new JTopo.Stage(canvas); // 创建一个舞台对象
var scene = new JTopo.Scene(stage); // 创建一个场景对象
scene.alpha = 1;
scene.backgroundColor = "0,0,0";
showJTopoToobar(stage);

$(function() {
	initTree();
	loadImgAll();
	newNode(70, 90, 36, 21, "new node", switchImg);
	//
	var container1 = newContainer(70, 70, 100, 50, "XXX变");
	//link
	var nodeA = newNode(170, 190, 36, 21, "new node", switchImg);
	var nodeB = newNode(270, 190, 36, 21, "new node", switchImg);
	var linkA = link_end(nodeA, nodeB, "A-B");
});
//监听鼠标松开事件
scene.mouseup(function(event) {
	if(event.button == 0) { //左键
		console.log("左键");
		if(event.target != null) {
			console.log("左键 != null");
			if(event.target instanceof JTopo.Node) {
				console.log("左键 != null Node");
				if(globalNodeA != null) {
					var nodeZ = event.target;
					var l = link_end(globalNodeA, nodeZ, 'lianx');
					globalNodeA = null;
					if(_link) {
						scene.remove(_link);
					}
				}
			}else if(event.target instanceof JTopo.Container) {
				console.log("左键 != null Container");
			}
		}
	} else if(event.button == 2) { //右键
		console.log("右键" + event.target);
		if(event.target == null) { //场景菜单，新建连线、文本
			$("#contextmenu3 li").css("background", "#eee");
			$("#contextmenu3").css({
				top: event.pageY,
				left: event.pageX
			}).show();
		} else if(event.target instanceof JTopo.Node) {
			console.log("****");
			globalNodeA = event.target;
			nodeA_x = event.x;
			nodeA_y = event.y;
		}else if(event.target instanceof JTopo.CircleNode){
    		 //圆形节点菜单
    	   globalNodeA = event.target;
			nodeA_x = event.x;
			nodeA_y = event.y;
    	 } else if(event.target instanceof JTopo.Link) {
			//当前位置弹出链路菜单（div）删除链路
			$("#contextmenu2").css({
				top: event.pageY,
				left: event.pageX
			}).show();
			tempLink = event.target;
		}
	} else {
		console.log("其他鼠标事件");
	}
})
scene.mousemove(function(e) {
	_add_x = e.x - 15;
	_add_y = e.y - 10;
	tempNodeZ.setLocation(e.x, e.y);
	dragImg();
});

$("#contextmenu2").mouseleave(function() {
	sleep(300);
	$("#contextmenu2").hide();
});
$("#contextmenu3").mouseleave(function() {
	sleep(300);
	$("#contextmenu3").hide();
});
$("#contextmenu4").mouseleave(function() {
	sleep(300);
	$("#contextmenu4").hide();
});
//链路右键菜单
$("#contextmenu2 li").click(function() {
	var text = $(this).text().trim();
	if(text == '移除链路') {
		if(tempLink) {
			scene.remove(tempLink);
			tempLink = null;
		}
	} else if(text == "添加交点") {
		createDbNode(tempLink); //创建线的交点
		tempLink = null;
	}
	$("#contextmenu2").hide();
});
//在线上创建节点/创建线的交点
function createDbNode(link) {
	if(link != null) {
		//把线路分割成两段
		//			var linkOldId = event.target.linkId;
		var node1Id = link.idA;
		var node2Id = link.idZ;
		var x = tempNodeZ.x;
		var y = tempNodeZ.y;
		var nodeMid = newCircleNode(x, y, "");
		var l1 = link_end(link.nodeA, nodeMid, "A");
		var l2 = link_end(nodeMid, link.nodeZ, "Z");
		scene.remove(link);
	}
}
//场景右键菜单
$("#contextmenu3 li").click(function(e) {
	var text = $(this).text().trim();
	console.log("contextmenu3 click:" + text);
	console.log("--");
	if(text == '新增节点') {
		$("#contextmenu3").hide();
		var node = newNode(_add_x, _add_y, 36, 21, "new node", switchImg);
	} else if(text == '新增圆点') {
		$("#contextmenu3").hide();
		var node = newCircleNode(_add_x, _add_y, "", 8);
	} else if(text == '新增容器') {
		$("#contextmenu3").hide();
		var container = newContainer(_add_x, _add_y, 100, 50, "");
	}else if(text == '新增文本') {
		$("#contextmenu3").hide();
		var text = newTextNode(_add_x,_add_y,30,10,"XXX");
	}
});

//浏览器大小改变事件
window.onresize = function() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
}
//
function handler(event) {
	if(event.button == 2) { // 右键
		if(event.target != null && event.target instanceof JTopo.Node) {}
		$("#contextmenu4 li").css("background", "#eee");
		$("#contextmenu4").css({
			top: event.pageY,
			left: event.pageX
		}).show();
	}
}
//连线子菜单点击事件
$("#contextmenu4 li").click(function(e) {
	var text = $(this).text().trim();
	console.log("contextmenu4 click:" + text);
	if(text == '连线') {
		if(globalNodeA != null && globalNodeA instanceof JTopo.Node && nodeA_x && nodeA_y) {
			link_start(globalNodeA); //设备连线方法
		}
	}else if(text == '移除节点') {
		scene.remove(globalNodeA);
		globalNodeA= null;
	}else if(text == '顺时针旋转') {
		globalNodeA.rotate+=0.785;
	}else if(text == '逆时针旋转') {
		globalNodeA.rotate-=0.785;
	}
	$("#contextmenu4").hide();
	$("#contextmenu").hide();
	$("#contextmenu3").hide();
	$("#link_type").hide();
});

var tempNodeA = new JTopo.Node('tempA');
tempNodeA.setSize(1, 1);
var tempNodeZ = new JTopo.Node('tempZ');
tempNodeZ.setSize(1, 1);
var _link = null; //创建连线时的缓存链路
function link_start(nodeA) {
	if(nodeA instanceof JTopo.Node) {
		_link = new JTopo.Link(tempNodeA, tempNodeZ);
		scene.add(_link);
		tempNodeA.setLocation(nodeA_x, nodeA_y);
		tempNodeZ.setLocation(nodeA_x, nodeA_y);
	}
}

//创建连线
function link_end(nodeA, nodeZ, linkName) {
	console.log("nodeA："+nodeA.x)
	var link = null;
	link = new JTopo.Link(nodeA, nodeZ);
	link.text = linkName;
	link.lineWidth = 1; // 线宽
	link.strokeColor = "123,184,237"; // 淡蓝色
	link.font = '13px 楷体';
	link.fontColor = '255,0,0'; //黑色
	//	link.arrowsRadius=5;//箭头大小
	scene.add(link);
	return link;
}
/**
 * 创建节点
 * @param x
 * @param y
 * @param w
 * @param h
 * @param text
 * @returns
 */
function newNode(x, y, w, h, text, img) {
	var node = new JTopo.Node(text);
	//节点名称换行方法
	//	node.paintText = function(a){
	//		a.beginPath();
	//		a.font = this.font;
	//		a.wrapText(text,this.height/2,this.height);
	//		a.closePath();
	//	}
	node.setBound(x, y, w, h); //位置
	node.font = '22px 楷体';
	node.textColor = 'red';
	if(img == null) {
		//		node.fillColor="230,120,0";//颜色
		//		node.fillColor="230,120,0";//颜色
	} else {
		node.setImage(img, false); //true:图片实际尺寸，false：节点设置的宽高
	}
	scene.add(node);
	node.addEventListener('mouseup', function(event) { //节点监听事件
		handler(event);
	});
	return node;
}
/**
 *创建文本节点--拓扑注释
 */
function newTextNode(x, y,w,h,text) {
	var textNode = new JTopo.TextNode(text);
	//textNode.zIndex++;
	textNode.setBound(x, y,w,h);//位置
	textNode.font = '14px 黑体';
	textNode.fontColor = '255,255,255';
	//textNode.dragable = false;//不许拖拽
	textNode.zIndex = 3;
    scene.add(textNode);
    return textNode;
}
function newCircleNode(x, y, text, radius) {
	var circleNode = new JTopo.CircleNode(text);
	if(radius) {
		circleNode.radius = radius; // 半径
	} else {
		circleNode.radius = 3; // 半径
	}
	circleNode.alpha = 1; //节点透明度
	circleNode.fillColor = "255,0,0"; // 填充颜色
	circleNode.setLocation(x, y);
	circleNode.textPosition = 'Middle_Center'; // 文本位置
	circleNode.textOffsetY = -2; // 文字向上偏移2个像素
	circleNode.fontColor = '#0c0c0c';
	circleNode.dragable = true; //不许拖拽
	//添加父节点属性，方便一起拖动
	scene.add(circleNode);
	circleNode.addEventListener('mouseup', function(event) { //节点监听事件
		handler(event);
	});
	return circleNode;
}

function newContainer(x, y, w, h, text) {
	var container = new JTopo.Container();
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
	scene.add(container);
	//
	var text1 = newTextNode(x+w/2,y+h/2,30,10,text);
	//
	var node1 = newNode(x, y, 5, 5, "", "../../img/jtop/tzjt.png");
	console.log("node1:"+JSON.stringify(node1._id));
	node1.rotate = -0.785;
	var node2 = newNode(x+w, y + h, 5, 5, "", "../../img/jtop/tzjt.png");
	console.log("node2:"+JSON.stringify(node2._id));
	node2.rotate = 2.285;
	container.add(text1);
	container.add(node1);
	container.add(node2);
	var childsCount=container.childs.length;
	for(var i=0;i<childsCount;i++){
		console.log("container:"+JSON.stringify(container.childs[i]._id));
	}
	return container;
}
/**
 * 延迟方法
 * @returns
 */
function sleep(d) {
	t = Date.now();
	while(Date.now() - t <= d);
}

function allowDrop(ev) {
	ev.preventDefault();
}
//拖拽结束
function dropImg(ev) {
	ev.preventDefault();
	_newNodeImgPath = ev.dataTransfer.getData("Text");
	//	_newNodeImgCode = ev.dataTransfer.getData("Code");
}
/**
 * 获取工具栏内的所有图元
 * @returns
 */
function loadImgAll() {
	var index2;
	$.ajax({
		//      type : "post",  
		type: "get",
		url: "../../json/jtopLeftImgs.json",
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
						"draggable='true' name='" + code + "' src='" + imgPath + "'/></div>")
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
//左侧图标被拖
function drag(ev) {
	console.log("");
	ev.dataTransfer.setData("Text", ev.target.src);
	ev.dataTransfer.setData("Code", ev.target.name);
}
//在拓扑上绘图
function dragImg() {
//	console.log("dragImg:" + _newNodeImgPath);
	if(_newNodeImgPath) {
		if(_newNodeImgPath.indexOf("jx.png")>-1){
			console.log("dragImg x.png" );
			var container = newContainer(_add_x, _add_y, 100, 50, "");
		}else{
		var img = _newNodeImgPath;
		var imgType = _newNodeImgCode;
		//		if (img.indexOf("cloud") != -1) {//标记为云图，用于显示子拓扑菜单
		//			imgType = "yun";
		//		}
		//		if (img.indexOf("on-off") != -1) {//标记为开关，用于显示开/合菜单
		//			imgType = "on-off";
		//		}
		//新增节点
			var node = newNode(_add_x, _add_y, 36, 21, _newNodeImgCode, img);
		}
		_newNodeImgPath = null;
		_isSave = true;
	}
	//	saveTopo();
}

/*************************ztree**************************/

/**
 * ztree
 */
var initTree = function() {
	console.log("initTree");
	var lineId = $("#lineName").val();
	$.ajax({  
//      type : "post",  
//      url : "http://192.168.1.173:8090/topo/getDeviceTree.do",  
//      async : false, 
 		type : "get",  
        url : "../../json/jtopLeftDev.json",  
        async : false, 
        dataType : 'json',
        data : {
        	lineId : -1,
        },
        success : function(result){  
        	console.log(JSON.stringify(result));
        	var t = $("#tree_left");
        	if (result && result.list && result.list.length > 0) {
        		t = $.fn.zTree.init(t, setting, result.list);
        		var treeObj = $.fn.zTree.getZTreeObj("tree_left");
        		//treeObj.expandAll(treeObj);
			}
         }  
    });
}
var setting = {
	check : {
		enable : false
	},
	view : {
		showIcon : true,//是否显示图标
		fontCss: setFontCss
	},
	data : {
		key : {
			url : "myurl"// 更改默认的超链接获取属性,取消超链接
		},
		simpleData : {
			enable : true,
			idKey : "id",
			pIdKey : "pId",
			rootPId : ""
		}
	},
	edit : {
		drag:{
            isCopy: false,
            isMove: true,
            prev: false,
            next: false,
            inner: false,
            autoOpenTime: 0,
            minMoveSize: 10
        },
        enable:true,
        editNameSelectAll: true,
        removeTitle: "删除节点",
        renameTitle: "编辑节点名称",
        showRemoveBtn: false,
        showRenameBtn: false,
	},
	callback : {
		beforeClick : beforeClick,//点击前
		beforeDrag : beforeDrag,//拖拽前
		onClick : onClick,//点击后
		onDrop : zTreeOnDrop,//拖拽后
	}
};
//拖拽之前——除了设备之外不许拖拽
function beforeDrag(treeId, treeNodes) {
//	var treeNode = treeNodes[0];
//  var nodes = stage.find('node');
//  if(treeNode.id < 0){
//		return false;
//  }
//
//  for (var i = 0; i < nodes.length; i++) {
//  	var node = nodes[i];
//  	if(node.text==treeNode.name){
//			return false;
//  	}
//  }
//	return true;

}

//拖拽之后——在鼠标的位置生成对应设备节点
function zTreeOnDrop(event, treeId, treeNodes) {
	var treeNode = treeNodes[0];
	if(treeNode.type==1){//开关
		//新增节点
		var node= newNode(_add_x, _add_y, 36, 21,treeNode.name,switchImg);
		_newNodeImgPath=null;
		_entityType=null;

	}else if(treeNode.type==2){
		//新增节点
		var node= newNode(_add_x, _add_y, 36, 21,treeNode.name,byqImg);
		_newNodeImgPath=null;
		_entityType=null;

	}else if(treeNode.type==0){
		//新增节点
		var container=newContainer(_add_x, _add_y, 100, 50, treeNode.name);
	}
}
function setFontCss(treeId, treeNode) {
	if (treeNode.highlight) {
		return {color:"#A60000", "font-weight":"bold"};
	} else {
		if (treeNode.flag == 4) {
			if (treeNode.topoId != undefined) {
				return {color:"red","font-weight":"normal"};
			}
		} else {
			return {};
		}
	}
};

function beforeClick(treeId, treeNode) {
	return (treeNode.click != false);
}
function onClick(event, treeId, treeNode) {
	console.log("ztree click");
}