var ENV = 'prd'; //生产
ENV = 'dev'; //开发
var COMMO_URL = "http://192.168.1.188:8091"; //192.168.1.173
var COMMO_URL_IMG = "../../img/jtop/";
var COMMO_URL_JSON = "../../json/";
if(ENV == "prd") {
	COMMO_URL = "";
	COMMO_URL_IMG = "/resource/imgs/topo/";
	COMMO_URL_JSON = "/resource/json/";
}

//拓扑图标
var switchImg = 'switch-on.svg'; //开关
var transformerImg = 'byq.svg'; //变压
var tzjdImg='tzjd.svg';

var imgW=36;
var imgH=21;