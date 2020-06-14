
function degToRad(d) {
    return d * Math.PI / 180;
}
function radToDeg(r) {
    return r*180/Math.PI;
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

