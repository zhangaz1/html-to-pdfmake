(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.htmlToPdfmake=f()}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){module.exports=function(htmlText,options){var wndw=options&&options.window?options.window:window;var tableAutoSize=options&&typeof options.tableAutoSize==="boolean"?options.tableAutoSize:false;var defaultStyles={b:{bold:true},strong:{bold:true},u:{decoration:"underline"},s:{decoration:"lineThrough"},em:{italics:true},i:{italics:true},h1:{fontSize:24,bold:true,marginBottom:5},h2:{fontSize:22,bold:true,marginBottom:5},h3:{fontSize:20,bold:true,marginBottom:5},h4:{fontSize:18,bold:true,marginBottom:5},h5:{fontSize:16,bold:true,marginBottom:5},h6:{fontSize:14,bold:true,marginBottom:5},a:{color:"blue",decoration:"underline"},strike:{decoration:"lineThrough"},p:{margin:[0,5,0,10]},ul:{marginBottom:5,marginLeft:5},table:{marginBottom:5},th:{bold:true,fillColor:"#EEEEEE"}};function changeDefaultStyles(){for(var keyStyle in options.defaultStyles){if(defaultStyles.hasOwnProperty(keyStyle)){if(options.defaultStyles.hasOwnProperty(keyStyle)&&!options.defaultStyles[keyStyle]){delete defaultStyles[keyStyle]}else{for(var k in options.defaultStyles[keyStyle]){if(!options.defaultStyles[keyStyle][k])delete defaultStyles[keyStyle][k];else defaultStyles[keyStyle][k]=options.defaultStyles[keyStyle][k]}}}}}if(options&&options.defaultStyles){changeDefaultStyles()}var convertHtml=function(htmlText){var parser=new wndw.DOMParser;var parsedHtml=parser.parseFromString(htmlText,"text/html");var docDef=parseElement(parsedHtml.body,[]);return docDef.stack||docDef.text};var parseElement=function(element,parents){var nodeName=element.nodeName.toUpperCase();var nodeNameLowerCase=nodeName.toLowerCase();var ret={text:[]};var text,needStack=false;var dataset,i,key;if(["COLGROUP","COL"].indexOf(nodeName)>-1)return"";switch(element.nodeType){case 3:{if(element.textContent){text=element.textContent.replace(/\n(\s+)?/g,"");if(text){ret={text:text};ret=applyStyle({ret:ret,parents:parents});return ret}}return""}case 1:{ret.nodeName=nodeName;parents.push(element);if(element.childNodes&&element.childNodes.length>0){[].forEach.call(element.childNodes,function(child){var res=parseElement(child,parents);if(res){if(Array.isArray(res.text)&&res.text.length===0)res.text="";ret.text.push(res)}});needStack=searchForStack(ret);if(needStack){ret.stack=ret.text.slice(0);delete ret.text}else{ret=applyStyle({ret:ret,parents:parents})}}parents.pop();switch(nodeName){case"TABLE":{var rowIndex,cellIndex;ret.table={body:[]};rowIndex=0;(ret.stack||ret.text).forEach(function(tbody){var rows=tbody.stack||tbody.text;rows.forEach(function(row){ret.table.body[rowIndex]=[];var cells=row.stack||row.text;cellIndex=0;cells.forEach(function(cell){ret.table.body[rowIndex].push(cell);if(cell.colSpan){i=cell.colSpan;setRowSpan({rows:rows,cell:cell,rowIndex:rowIndex,cellIndex:cellIndex});while(--i>0){ret.table.body[rowIndex].push({text:""});setRowSpan({rows:rows,cell:cell,rowIndex:rowIndex,cellIndex:cellIndex});cellIndex++}}else{setRowSpan({rows:rows,cell:cell,rowIndex:rowIndex,cellIndex:cellIndex})}cellIndex++});rowIndex++})});delete ret.stack;delete ret.text;ret=applyStyle({ret:ret,parents:parents.concat([element])});if(tableAutoSize){var cellsWidths=[];var cellsHeights=[];var tableWidths=[];var tableHeights=[];ret.table.body.forEach(function(row,rowIndex){cellsWidths.push([]);cellsHeights.push([]);row.forEach(function(cell){var width=typeof cell.width!=="undefined"?cell.width:"auto";var height=typeof cell.height!=="undefined"?cell.height:"auto";if(width!=="auto"&&cell.colSpan){if(!isNaN(width))width/=cell.colSpan;else width="auto"}if(height!=="auto"&&cell.rowSpan){if(!isNaN(height))height/=cell.colSpan;else height="auto"}cellsWidths[rowIndex].push(width);cellsHeights[rowIndex].push(height)})});cellsWidths.forEach(function(row){row.forEach(function(cellWidth,cellIndex){var type=typeof tableWidths[cellIndex];if(type==="undefined"||cellWidth!=="auto"&&type==="number"&&cellWidth>tableWidths[cellIndex]||cellWidth!=="auto"&&tableWidths[cellIndex]==="auto"){tableWidths[cellIndex]=cellWidth}})});cellsHeights.forEach(function(row,rowIndex){row.forEach(function(cellHeight){var type=typeof tableHeights[rowIndex];if(type==="undefined"||cellHeight!=="auto"&&type==="number"&&cellHeight>tableHeights[rowIndex]||cellHeight!=="auto"&&tableHeights[rowIndex]==="auto"){tableHeights[rowIndex]=cellHeight}})});if(tableWidths.length>0)ret.table.widths=tableWidths;if(tableHeights.length>0)ret.table.heights=tableHeights}if(element.dataset&&element.dataset.pdfmake){dataset=JSON.parse(element.dataset.pdfmake);for(key in dataset){ret.table[key]=dataset[key]}}break}case"TH":case"TD":{if(element.getAttribute("rowspan"))ret.rowSpan=element.getAttribute("rowspan")*1;if(element.getAttribute("colspan"))ret.colSpan=element.getAttribute("colspan")*1;ret=applyStyle({ret:ret,parents:parents.concat([element])});break}case"SVG":{ret={svg:element.outerHTML.replace(/\n(\s+)?/g,""),nodeName:"SVG",style:["html-svg"]};break}case"BR":{ret.text=[{text:"\n"}];break}case"HR":{var styleHR={width:514,type:"line",margin:[0,12,0,12],thickness:.5,color:"#000000",left:0};if(element.dataset&&element.dataset.pdfmake){dataset=JSON.parse(element.dataset.pdfmake);for(key in dataset){styleHR[key]=dataset[key]}}ret.margin=styleHR.margin;ret.canvas=[{type:styleHR.type,x1:styleHR.left,y1:0,x2:styleHR.width,y2:0,lineWidth:styleHR.thickness,lineColor:styleHR.color}];delete ret.text;break}case"OL":case"UL":{ret[nodeNameLowerCase]=(ret.stack||ret.text).slice(0);delete ret.stack;delete ret.text;ret=applyStyle({ret:ret,parents:parents.concat([element])});break}case"IMG":{ret.image=element.getAttribute("src");delete ret.stack;delete ret.text;ret=applyStyle({ret:ret,parents:parents.concat([element])});break}case"A":{ret.link=element.getAttribute("href");break}}if(Array.isArray(ret.text)&&ret.text.length===1&&ret.text[0].text&&!ret.text[0].nodeName){ret.text=ret.text[0].text}if(nodeName!=="HR"&&nodeName!=="TABLE"&&element.dataset&&element.dataset.pdfmake){dataset=JSON.parse(element.dataset.pdfmake);for(key in dataset){ret[key]=dataset[key]}}return ret}}};var searchForStack=function(ret){if(Array.isArray(ret.text)){for(var i=0;i<ret.text.length;i++){if(ret.text[i].stack||["P","DIV","TABLE","SVG","UL","OL","IMG","H1","H2","H3","H4","H5","H6"].indexOf(ret.text[i].nodeName)>-1)return true;if(searchForStack(ret.text[i])===true)return true}}return false};var setRowSpan=function(params){var cells;if(params.cell.rowSpan){for(var i=1;i<=params.cell.rowSpan-1;i++){cells=params.rows[params.rowIndex+i].text||params.rows[params.rowIndex+i].stack;cells.splice(params.cellIndex,0,{text:""})}}};var applyStyle=function(params){var cssClass=[];var lastIndex=params.parents.length-1;params.parents.forEach(function(parent,parentIndex){var parentNodeName=parent.nodeName.toLowerCase();var htmlClass="html-"+parentNodeName;if(htmlClass!=="html-body"&&cssClass.indexOf(htmlClass)===-1)cssClass.unshift(htmlClass);var parentClass=(parent.getAttribute("class")||"").split(" ");parentClass.forEach(function(p){if(p)cssClass.push(p)});var style;var ignoreNonDescendentProperties=parentIndex!==lastIndex;if(defaultStyles[parentNodeName]){for(style in defaultStyles[parentNodeName]){if(defaultStyles[parentNodeName].hasOwnProperty(style)){if(!ignoreNonDescendentProperties||ignoreNonDescendentProperties&&style.indexOf("margin")===-1&&style.indexOf("border")===-1)params.ret[style]=defaultStyles[parentNodeName][style]}}}if(parentNodeName==="tr")ignoreNonDescendentProperties=false;style=parseStyle(parent,ignoreNonDescendentProperties);style.forEach(function(stl){params.ret[stl.key]=stl.value})});params.ret.style=cssClass;return params.ret};var parseStyle=function(element,ignoreProperties){var style=element.getAttribute("style")||"";style=style.split(";");if(element.getAttribute("width")){style.unshift("width:"+element.getAttribute("width")+"px")}if(element.getAttribute("height")){style.unshift("height:"+element.getAttribute("height")+"px")}var styleDefs=style.map(function(style){return style.toLowerCase().split(":")});var ret=[];var borders=[];var nodeName=element.nodeName.toUpperCase();styleDefs.forEach(function(styleDef){if(styleDef.length===2){var key=styleDef[0].trim();var value=styleDef[1].trim();switch(key){case"margin":{if(ignoreProperties)break;value=value.split(" ");if(value.length===1)value=[value[0],value[0],value[0],value[0]];else if(value.length===2)value=[value[1],value[0]];else if(value.length===3)value=[value[1],value[0],value[1],value[2]];else if(value.length===4)value=[value[3],value[0],value[1],value[2]];value.forEach(function(val,i){value[i]=convertToUnit(val)});if(value.indexOf(false)===-1)ret.push({key:key,value:value});break}case"text-align":{ret.push({key:"alignment",value:value});break}case"font-weight":{if(value==="bold")ret.push({key:"bold",value:true});break}case"text-decoration":{ret.push({key:"decoration",value:toCamelCase(value)});break}case"font-style":{if(value==="italic")ret.push({key:"italics",value:true});break}case"font-family":{ret.push({key:"font",value:value.replace(/"|^'|'$/g,"")});break}case"color":{ret.push({key:"color",value:parseColor(value)});break}case"background-color":{ret.push({key:nodeName==="TD"||nodeName==="TH"?"fillColor":"background",value:parseColor(value)});break}default:{if(key==="border"||key.indexOf("border-left")===0||key.indexOf("border-top")===0||key.indexOf("border-right")===0||key.indexOf("border-bottom")===0){if(!ignoreProperties)borders.push({key:key,value:value})}else{if(ignoreProperties&&(key.indexOf("margin-")===0||key==="width"||key==="height"))break;if(key.indexOf("padding")===0)break;if(key.indexOf("-")>-1)key=toCamelCase(key);if(value){var parsedValue=convertToUnit(value);ret.push({key:key,value:parsedValue===false?value:parsedValue})}}}}}});if(borders.length>0){var border=[];var borderColor=[];borders.forEach(function(b){var properties=b.value.split(" ");var width=properties[0].replace(/(\d+)(\.\d+)?([^\d]+)/g,"$1$2 ").trim();var index=-1,i;if(b.key.indexOf("-left")>-1)index=0;else if(b.key.indexOf("-top")>-1)index=1;else if(b.key.indexOf("-right")>-1)index=2;else if(b.key.indexOf("-bottom")>-1)index=3;if(index>-1){border[index]=width>0}else{for(i=0;i<4;i++)border[i]=width>0}if(properties.length>2){var color=properties.slice(2).join(" ");if(index>-1){borderColor[index]=parseColor(color)}else{for(i=0;i<4;i++)borderColor[i]=parseColor(color)}}});for(var i=0;i<4;i++){if(border.length>0&&typeof border[i]==="undefined")border[i]=true;if(borderColor.length>0&&typeof borderColor[i]==="undefined")borderColor[i]="#000000"}if(border.length>0)ret.push({key:"border",value:border});if(borderColor.length>0)ret.push({key:"borderColor",value:borderColor})}return ret};var toCamelCase=function(str){return str.replace(/-([a-z])/g,function(g){return g[1].toUpperCase()})};var parseColor=function(color){var haxRegex=new RegExp("^#([0-9a-f]{3}|[0-9a-f]{6})$");var rgbRegex=new RegExp("^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$");var nameRegex=new RegExp("^[a-z]+$");if(haxRegex.test(color)){return color}else if(rgbRegex.test(color)){var decimalColors=rgbRegex.exec(color).slice(1);for(var i=0;i<3;i++){var decimalValue=+decimalColors[i];if(decimalValue>255){decimalValue=255}var hexString="0"+decimalValue.toString(16);hexString=hexString.slice(-2);decimalColors[i]=hexString}return"#"+decimalColors.join("")}else if(nameRegex.test(color)){return color}else{console.error('Could not parse color "'+color+'"');return color}};var convertToUnit=function(val){if(!isNaN(parseFloat(val))&&isFinite(val))return val;var mtch=(val+"").trim().match(/^(\d+(\.\d+)?)(pt|px|rem)$/);if(!mtch)return false;val=mtch[1];switch(mtch[3]){case"px":{val=Math.round(val*.75292857248934);break}case"rem":{val*=12;break}}return val*1};return convertHtml(htmlText)}},{}]},{},[1])(1)});
