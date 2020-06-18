
function degToRad(d) {
    return d * Math.PI / 180;
}
function radToDeg(r) {
    return r*180/Math.PI;
}
function expandRLEData(rleData, padding) {
    padding = padding || [];
    const data = [];
    for (let ii = 0; ii < rleData.length; ii += 4) {
      const runLength = rleData[ii];
      const element = rleData.slice(ii + 1, ii + 4);
      element.push.apply(element, padding);
      for (let jj = 0; jj < runLength; ++jj) {
        data.push.apply(data, element);
      }
    }
    return data;
  }
function getreferedSize(percentuale,max,text_length=-1){
     if(text_length>0){
         return percentuale*max/100/text_length;
     }else{
        return percentuale*max/100;
    }
}

function loadFile(filePath,callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {     
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }
    xhr.open('GET', filePath);
    xhr.send();
 }
 function loadBin(filePath,callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function() {     
        if (xhr.readyState == 4 && xhr.status == 200) {
            var arrayBuffer = xhr.response; // Note: not oReq.responseText
            callback(new Uint8Array(arrayBuffer));
        }
    }
    xhr.open('GET', filePath);
    xhr.send();
 }

 function byteArrayToInt(b, offset) {
    var value = '';
    for (var i = 0; i < 4; i++) {
        var temp = b[offset+i].toString(2);
        for(var x =temp.length;x<8;x++){
            temp='0'+temp;
        }
      value=temp+value;
    }
    //console.log("value",value)
    return parseInt(value,2);
}
function readTextCoord(file){
    var ris = [];
    //console.log(file);
    var lines = file.split("\n");
    for(var x in lines){
            if(lines[x][0]==="v" && lines[x][1]==="t"){
                //console.log(lines[x]);
                var temp =lines[x].split(" ");
                ris.push(parseFloat(temp[1]));
                ris.push(parseFloat(temp[2]));
                ris.push(parseFloat(temp[3]));
            }
    }
    return ris;
}
function StartWhenReady(objs, callback){
    var notYet = false;
    //console.log("isReady",objs[0].isReady());
    if(objs.length<=0){
        console.log("warning: no obj array");
    }else{
        for(var i = 0;i<objs.length;i++){
            if(!objs[i].isReady()){
                notYet=true;
                break;
            }
        }
        if(notYet){ 
            setTimeout(function(){ StartWhenReady(objs, callback);}, 250);
        }else{
            callback();
        }
    }
 
}

