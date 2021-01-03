
var blockSize = 32
var totalDevice = 0
var matrixWidth = 600
var matrixHeight
var modelOSdata
var modelslist
var osList
var featureMap = [{feature:"UE", startos: 13},{ featureMap:"DEP", startos: 7}]; 

var modelOScount
// var finalData
var finalArray = [{}]
var matrix

/*

Logic : 

model list - os matrix: 
for every model-os list row : 
	y axis=modeldevice, 
	x axis= osversion 
	grey square if current os > lastiOS or < firstiOS
	else 
	darkblue square if feature is selected && current os is part of supported list 
	else
	red square if feature is selected && maxiOS is not part of supported list
	else
	blue square
	
	value = deviceData.count where model = y and os = x

*/

 //Build color
// svg.append("circle").attr("cx",50).attr("cy",100).attr("r",20)
//   .style("fill", "#69b3a2");
// function mapColor(currentOS, firstos, lastos, supportedFeature){
// 	return (currentOS < firstos || currentOS > lastos) ? "#F8F8F8" : 
// 	((supportedFeature == part of featureMap && currentOS >= featureMap.[feature]) ? "#77AAFF" : 
// 		((supportedFeature == part of featureMap && currentOS < featureMap.[feature]) : "#FFB3B8" : "D0E1FF")
// 	)
// }
function openNav() {
  document.getElementById("mySidenav").style.display = 'inline-block';
}

function closeNav() {
  document.getElementById("mySidenav").style.display = 'none';
}

function filter(featureNum){
	feature = (featureNum==1? 13 : (featureNum==2? 7 : 0))
	matrix.selectAll("rect")
	.style("fill", function(d) {
		id = d3.select(this).attr('id')
		model = id.substring(0,id.indexOf('_'))
		os =  parseInt(id.substring(id.indexOf('_')+1))
		return mapColor(model,os,feature) 
	})
	if(feature==0){
		document.getElementById("rec1").style.display = 'inline-block';
		document.getElementById("rec2").style.display = 'none';
		//closeNav()
	}else{
		document.getElementById("rec2").style.display = 'inline-block';
		document.getElementById("rec1").style.display = 'none';
		//openNav()
	}
}

function blockText(currModel, currentOS, count){
	if (modelOSdata.get(currModel) != undefined){
		firstos = modelOSdata.get(currModel).firstos
		lastos = modelOSdata.get(currModel).lastos
	} else {
		lastos = 0
		firstos = 0
	}
	if (currentOS > lastos || currentOS < firstos ){
			//grey
		return " ";
	} else if( count==0 || count == -1 ){
		return "-";
	}
	else{
		return count;
	}
}

function mapColor(currModel, currentOS, Fstartos){

	if (modelOSdata.get(currModel) != undefined){
		firstos = modelOSdata.get(currModel).firstos
		lastos = modelOSdata.get(currModel).lastos
	} else {
		lastos = 0
		firstos = 0
	}

	if (currentOS > lastos || currentOS < firstos){
		//grey
		return "#F8F8F8";
	} else if ( Fstartos!= 0 && currentOS >= Fstartos){ //|| currentOS <= featureMap.get(feature).lastos
		//darkblue
		return "#77AAFF"
	} else if(Fstartos!= 0 && (lastos < Fstartos)){
		//red
		return "#FFB3B8"
	} else {
		return "#D0E1FF"
	}
}


d3.csv("data/model-os-map.csv")
.then(function(data) {
	modelOSdata = d3.map(data, function(d){return d.model;})
	modelslist = d3.map(data, function(d){return d.model;}).keys()
 	var firstOSlist = d3.map(data, function(d){return +d.firstos;}).keys()
 	var lastOSlist = d3.map(data, function(d){return +d.lastos;}).keys()
 	osList = firstOSlist.concat(lastOSlist)
 	osList = osList.filter(function(elem, index, self) {
 		return index === self.indexOf(elem);
 	})
 	osList.forEach(function(d,i) {
    	osList[i] = parseInt(osList[i])  
	})
	osList = osList.sort((a,b)=>a-b)

 	blockSize = (matrixWidth)/osList.length ;
 	matrixHeight = blockSize * modelslist.length;

	matrix = d3.select("#matrix").append("svg").attr("width",matrixWidth)
	.attr("height", matrixHeight).attr("id","matrix-container")

	// Build X scales and axis:
	var x = d3.scaleBand()
	  .range([ 0, matrixWidth ])
	  .domain(osList)
	  .padding(0.1);
	matrix.append("g")
	  .attr("transform", "translate(0,0)")
	  .call(d3.axisTop(x).tickSize(0))

	// Build Y scales and axis:
	var y = d3.scaleBand()
	  .range([ 0, matrixHeight ])
	  .domain(modelslist)
	  .padding(0.01);
	matrix.append("g")
	  .call(d3.axisLeft(y).tickSize(0));


	//get device counts for model and os
	d3.csv("data/device-list.csv")
	.then(function(data) {
		
		modelOScount = d3.rollup(data, v => v.length, d => d.model, d => d.os)
		
		modelslist.forEach(
			function(currentModel,i){
			currModel = currentModel.toString()
			//y axis
			osgroup = modelOScount.get(currModel)

			osList.forEach(
				function(currentOS,j){
					currOS = currentOS.toString()
					//device data doesnt have any entry for curr model = osgroup is undefined
					osgroup == undefined ? (deviceCount = -1) : (deviceCount = osgroup.get(currOS))
					//device data doesnt have any entry for curr os = current os is underfined
					deviceCount == undefined ? (deviceCount=0) : deviceCount
					totalDevice = totalDevice + deviceCount;
					//create ideal map model, os, count
					finalArray.push({"model":currModel, "os":currentOS, "count":deviceCount})

				})

			d3.select("totalDevice")
				.append("text")
				.text(totalDevice)

			})
		
		// Three function that change the tooltip when user hover / move / leave a cell
		// create a tooltip
		var tooltip = d3.select("#matrix")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("position","absolute")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "2px")
			.style("padding", "5px")
			.style("color", "#f8f8f8")
			.style("background-color", "#161616")

			  var mouseover = function(d) {
			    tooltip.style("opacity", 1)
			    d3.select(this)
			      .style("stroke", "#0f62fe")
			      .style("stroke-width", 1)
			      .style("z-index",20)
			      // .style("stroke-opacity", 1)
			  }
			  var mousemove = function(d) {
			    tooltip
			      .html("Model: " + d.model +"<br/>OS: "+d.os + "<br/>Device count: " + (d.count>0 ? d.count :"-"))
			      .style("left", (d3.event.pageX+10) + "px")
			      .style("top", (d3.event.pageY-10) + "px")
			  }
			  var mouseleave = function(d) {
			    tooltip.style("opacity", 0)
			    d3.select(this)
			      .style("stroke-width", 4)
			      .style("stroke", "#fff")
			      .style("z-index",0)
			      // .style("stroke-opacity", 0.01)
			  }

			matrix.selectAll()
			    .data(finalArray, function(d) {return d.os+':'+d.model;})
			    .enter()
			    .append("g")
			    .attr("class","blocks")
			    .append("rect")
			      .attr("x", function(d) { return x(d.os) })
			      .attr("y", function(d) { return y(d.model) })
			      .attr("width", blockSize )
			      .attr("id",function(d){return (d.model+ "_" +d.os);})
			      .attr("height", blockSize )//y.bandwidth()
			      .style("fill", function(d) { return mapColor(d.model,d.os,0)} )
			      .style("stroke-width", 4)
			      .style("margin", 0.1)
				  .style("stroke", "#fff")
				  .style("z-index",0)
				  .attr("class", function(d){return d.os; })
				  // .style("stroke-opacity",0.01)
			    .on("mouseover", mouseover)
			    .on("mousemove", mousemove)
			    .on("mouseleave", mouseleave)


			matrix.selectAll("class","blocks")
				.data(finalArray, function(d) {return d.os+':'+d.model;})
				.enter()
				.append("text")
				.attr("font-size","12px")
				.attr("fill", "black")
				.attr("x", function(d) { return x(d.os) + 20 })
				.attr("y", function(d) { return y(d.model) + blockSize/2 })
				.text(function(d){ 
					return blockText(d.model,d.os,d.count)
					})
				.attr("class","blockText")

				
	})


})


