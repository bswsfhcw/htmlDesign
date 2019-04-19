var menus = [{
		id: "9000",
		text: "header",
		icon: "",
		isHeader: true
	},
	{
		id: "10008",
		text: "首页",
		icon: "fa fa-laptop",
		url: "home.html",
		targetType: "iframe-tab"
		/*children: [{
				id: "9101",
				text: "首页-TCP",
				icon: "fa fa-circle-o",
				url: "home.html",
				targetType: "iframe-tab"
			},{
				id: "9101",
				text: "首页-TCP",
				icon: "fa fa-circle-o",
				url: "home_iframe.html",
				targetType: "iframe-tab"
			},
			{
				id: "9102",
				text: "首页-端口",
				icon: "fa fa-circle-o",
				url: "home_iframe_port.html",
				targetType: "iframe-tab"
			},
			{
				id: "9103",
				text: "首页-IP",
				icon: "fa fa-circle-o",
				url: "home_iframe_ip.html",
				targetType: "iframe-tab"
			},
			{
				id: "9104",
				text: "首页-包",
				icon: "fa fa-circle-o",
				url: "home_iframe_packet.html",
				targetType: "iframe-tab"
			}
		]*/
	},
	{
		id: "9200",
		text: "104协议分析",
		icon: "fa fa-laptop",
		children: [{
				id: "9201",
				text: "全局统计",
				icon: "fa fa-circle-o",
				url: "104/all_104.html",
				targetType: "iframe-tab"
			},
			{
				id: "9202",
				text: "IP异动",
				icon: "fa fa-circle-o",
				url: "104/ipException.html",
				targetType: "iframe-tab"
			},
			/*
						{
							id: "90053",
							text: "通讯异常分析",
							icon: "fa fa-circle-o",
							url: "",
							targetType: "iframe-tab"
						},
						{
							id: "90054",
							text: "数据传输异常分析(k,w)",
							icon: "fa fa-circle-o",
							url: "",
							targetType: "iframe-tab"
						},
						*/

			{
				id: "9205",
				text: "数据跳帧异常",
				icon: "fa fa-circle-o",
				url: "104/tz.html",
				targetType: "iframe-tab"
			},
			{
				id: "9208",
				text: "数据传输异常(k,w)", 
				icon: "fa fa-circle-o",
				url: "104/kw.html",
				targetType: "iframe-tab"
			}/*,
			{
				id: "9206",
				text: "S帧确认异常", 
				icon: "fa fa-circle-o",
				url: "104/syc.html",
				targetType: "iframe-tab"
			}
			,
			{
				id: "9207",
				text: "I帧频繁", 
				icon: "fa fa-circle-o",
				url: "104/iyc.html",
				targetType: "iframe-tab"
			}*/
			/*,
						
						{
							id: "90056",
							text: "参数配置异常分析",
							icon: "fa fa-circle-o",
							url: "104/ipException.html",
							targetType: "iframe-tab"
						}
						*/
		]

	},
	{
		id: "9300",
		text: "网络设备负载",
		icon: "fa fa-laptop",
		url: "wlfz.html",
		targetType: "iframe-tab"
	},

	{
		id: "9400",
		text: "网络异常诊断",
		icon: "fa fa-laptop",
		targetType: "iframe-tab",
		url: "zd.html",
		children: [

		]
	},
	{
		id: "9500",
		text: "网络安全风险预警",
		icon: "fa fa-laptop",
		targetType: "iframe-tab",
		children: [
			{
				id: "95001",
				text: "预警查询",
				icon: "fa fa-circle-o",
				url: "yj/yjcx.html",
				targetType: "iframe-tab"
			},
			{
				id: "95002",
				text: "预警统计",
				icon: "fa fa-circle-o",
				url: "yj/yjtj.html",
				targetType: "iframe-tab"
			}
		]
	},
	{
		id: "9010",
		text: "系统管理",
		icon: "fa fa-laptop",
		children: [{
				id: "90101",
				text: "部门人员管理",
				icon: "fa fa-circle-o",
				url: "",
				targetType: "iframe-tab"
			},
			{
				id: "90102",
				text: "角色权限管理",
				icon: "fa fa-circle-o",
				url: "",
				targetType: "iframe-tab"
			}, {
				id: "90103",
				text: "菜单管理",
				icon: "fa fa-circle-o",
				url: "",
				targetType: "iframe-tab"
			}
		]
	},
	{
		id: "9011",
		text: "插件",
		icon: "fa fa-laptop",
		children: [{
				id: "90111",
				text: "Layx",
				icon: "fa fa-circle-o",
				url: "layx/index.html",
				targetType: "iframe-tab"
			}
		]
	}
];