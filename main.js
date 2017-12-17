let msgInfo1;
let msgInfo0;
let msgInfo2;
let lmsg;
let rmsg;
let toast;
let data_port = {"1":{}, "2":{}};
let speed = 100;
let finished = true;
let ipTable = {};  // 转发表
let stop = false;
window.onload = function(){
	msgInfo1 = document.getElementById("msgInfo1");
	msgInfo0 = document.getElementById("msgInfo0");
	msgInfo2 = document.getElementById("msgInfo2");
	toast = document.getElementById('toast');
	lmsg = document.getElementById("lmsg");
	rmsg = document.getElementById("rmsg");

	msgInfo1.innerHTML = '<table class="table table-bordered">'+
	'<tr>'+
		'<th>源地址</th>'+
		'<th>目的地址</th>'+
		'<th>信息</th>'+
	'</tr>'+
	'</table>';

	msgInfo0.innerHTML = '<table class="table table-bordered">'+
	'<tr>'+
		'<th>目的地址</th>'+
		'<th>转发端口</th>'+
		''+
	'</tr>'+
	'</table>';

	msgInfo2.innerHTML = '<table class="table table-bordered">'+
	'<tr>'+
		'<th>源地址</th>'+
		'<th>目的地址</th>'+
		'<th>信息</th>'+
	'</tr>'+
	'</table>';
}


//加载端口1数据
function handleFiles(files, index) {
    if(files.length<=0)
        return;
    var reader = new FileReader();//new一个FileReader实例
    reader.onload = function() {
        console.log("加载到文件："+reader.result);
        const data = reader.result.split('\n');
        
        data_port[index] = {data:data};
        console.log(data_port);
        toast.innerText="模拟数据配置到端口" + index;
        showFrameTable(index, data);
    }
    reader.readAsText(files[0]);
}


function showFrameTable(index, data){  // 显示数据帧到表格中
	if(index == 1){
		msgInfo1.innerHTML = geneFrameTable(data);
	}
	if(index == 2){
		msgInfo2.innerHTML = geneFrameTable(data);
	}
}
function getRandom(){
	return Math.random() > 0.5;
}
function stopIt(){
	stop = !stop;
}
function run(){  // 模拟运行
	if(!finished){  // 加锁
		return;
	}
	finished = false;
	if(!data_port["1"] || !data_port["2"]){
		setToast("数据未加载完成", "bg-danger");
		return;
	}
	setToast("运行中", "bg-success");
	
	let id = setInterval(function(){
		// 数据发送完成
		console.log(data_port["1"]);
		if(data_port["1"]["data"].length == 0 && data_port["2"]["data"].length == 0 ){
			finished = true;
			setToast("运行结束", "bg-primary");
			clearInterval(id);
		}
		if(stop){
			setToast("已暂停", "bg-warning");
			return;
		}
		if(getRandom() && data_port["1"]["data"].length > 0){  // 端口1接收数据
			let frame = data_port["1"]["data"].pop();
			console.log(frame);
			rightTran("l", "green");
			let needTran = handleFrame(frame.split(" "), 1);  // 是否转发
			lmsg.innerText = "帧数据:" + frame;

			if(needTran){
				setTimeout(function(){
					rmsg.innerText = "帧数据:" + frame;
					rightTran("r", "red");
				}, speed*6);
			}
		}else if(data_port["2"]["data"].length > 0){  // 端口二接收数据
			let frame = data_port["2"]["data"].pop();
			console.log(frame);

			leftTran("r", "green");
			let needTran = handleFrame(frame.split(" "), 2);  // 是否转发
			rmsg.innerText = "帧数据:" + frame;
			if(needTran){
				setTimeout(function(){
					lmsg.innerText = "帧数据:" + frame;
					leftTran("l", "red");
				}, speed*6);
			}
		}


	}, 2000);


	
}

function geneFrameTable(data){  // 生成帧表格
	let result = '<table class="table table-bordered">'+
	'<tr>'+
		'<th>源地址</th>'+
		'<th>目的地址</th>'+
		'<th>信息</th>'+
	'</tr>';

	for (var i = data.length-1; i >= 0 ; i--) {
		row = "<tr>";
		rowData = data[i].split(' ');
		for (var j = 0; j < rowData.length; j++) {
		 	row += "<td>" + rowData[j] + "</td>";
		 } 
		row += "</tr>";
		result += row;
	}

	result += '</table>';

	return result;
}

function setToast(content, className){  // 设置提示
	toast.innerText= content
	toast.className = className;
}


function rightTran(port, color){  // 向右传输
	for(let i = 0; i < 7; i++){
		setTimeout(function(){
			let sp = document.getElementById(port+i);
			sp.className = color;

			setTimeout(function(){
				sp.className = "grey";
			}, speed);
		}, speed * i)

	}
}

function leftTran(port, color){  // 向左传输
	for(let i = 6; i >= 0; i--){
		setTimeout(function(){
			let sp = document.getElementById(port+i);
			sp.className = color;

			setTimeout(function(){
				sp.className = "grey";
			}, speed);
		}, speed * (6-i))

	}
}

function handleFrame(frame, index){  // 网桥处理帧数据
	console.log(frame);
	ipTable[frame[0]] = index; // 无论源地址是否在转发表都设置到这个接口
	showIpTable();
	if(!ipTable[frame[1]]){ // 转发表不存在目的地址
		setToast("转发表不存在目的地址,可以转发", "bg-success");
		showIpTable();
		return true;
	}
	if(ipTable[frame[1]] != index){
		setToast("转发表和接收帧的目的地址对应，转发","bg-success");
		showIpTable();
		return true;
	}

	setToast("帧目的地址和转发表不一致,不转发", "bg-danger");
	return false;
}

function showIpTable(){
	result = '<table class="table table-bordered">'+
	'<tr>'+
		'<th>目的地址</th>'+
		'<th>转发端口</th>'+
		''+
	'</tr>';

	for(let p in ipTable){
		row = "<tr><td>" + p + "</td><td>" +ipTable[p]+"</td></tr>";
		result += row;
	}

	result += "</table>";

	msgInfo0.innerHTML = result;
}

