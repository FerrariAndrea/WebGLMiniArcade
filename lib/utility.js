
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
    //versione per file locali
    // $.ajax({
    //     url: filePath,
    //     dataType: 'text',
    //     success: callback
    // });
    //versione per il server 
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

// function xzRotateVectorOnSrc(src,dst,rad){
//     const a = src[0];
//     const b = src[2];    //z
//     const x = dst[0];
//     const y = dst[2];//z
//     const alfa = degToRad(rad);

//     const x_ = (x-a)*Math.cos(alfa)-(y-b)*Math.sin(alfa)+a;
//     const y_ = (x-a)*Math.sin(alfa)-(y-b)*Math.cos(alfa)+b;
//     return [x_,dst[1],y_];
// }

function vec4ToVec3(vec4){
        return [vec4[0],vec4[1],vec4[2]];
}

function transformVector3(m, v){

    const tempVec4 = [v[0],v[1],v[2],1.0];
   return vec4ToVec3(m4.transformVector(m,tempVec4));
}


function addMouseEventOnGame(game_canvas,game_controller){
        var lastPoint =null;
        const offsetRaggio=1;      
        const viewEventMouseMove =function(e){
                if( lastPoint!==null){
                    const offsetRotazione=(game_canvas.width+ game_canvas.height)/(game_canvas.width*game_canvas.height)*100; 
                    var rect = e.target.getBoundingClientRect();
                    var x= event.clientX - rect.left; //x position within the element.
                    var y = event.clientY - rect.top;  //y position within the element.
                    const offset_x = Math.abs(lastPoint.x-x);                    
                    const offset_y = Math.abs(lastPoint.y-y);
                    //rotazione orrizontale
                    if(x>lastPoint.x){  
                        //ruoto a sinistra
                        game_controller.settings.theta+=degToRad(offsetRotazione*offset_x);
                    }else if(x<lastPoint.x){
                        //ruoto a destra
                        game_controller.settings.theta-=degToRad(offsetRotazione*offset_x);
                    }
                    //rotazione verticale
                    if(y>lastPoint.y){  
                        //ruoto in su
                        game_controller.settings.phi+=degToRad(offsetRotazione*offset_y);                       
                    }else if(y<lastPoint.y){
                        //ruoto in giù
                        game_controller.settings.phi-=degToRad(offsetRotazione*offset_y);
                    }
                    if(radToDeg(game_controller.settings.phi)>=90){
                        game_controller.settings.phi= degToRad(89);  
                    }
                    if(radToDeg(game_controller.settings.phi)<=0){
                        game_controller.settings.phi= degToRad(0.1);  
                    }
                    lastPoint.x=x;
                    lastPoint.y=y;
                }
        }

        const viewEventMouseDown =function(e){
            lastPoint ={};
            var rect = e.target.getBoundingClientRect();
            lastPoint.x = e.clientX - rect.left; //x position within the element.
            lastPoint.y = e.clientY - rect.top;  //y position within the element.
        }
        const viewEventMouseUp =function(e){
            lastPoint=null;
        }

        const viewEventMouseWheel =function(e){
            if(e.deltaY>0){
                //mi allontano
                game_controller.settings.radius+=offsetRaggio; 
                if(game_controller.settings.radius>70){
                    game_controller.settings.radius=70;
                } 
            }else{
                //zoom
                game_controller.settings.radius-=offsetRaggio;
                if(game_controller.settings.radius<=10){
                    game_controller.settings.radius=10;
                } 
            }
        }
        game_canvas.onmousewheel=viewEventMouseWheel;
        game_canvas.onmousemove=viewEventMouseMove;
        game_canvas.addEventListener('mousedown',viewEventMouseDown);
        game_canvas.addEventListener('mouseup',viewEventMouseUp);
}


// }else if(this.testiAttuali[s]==="Ruota a destra"){
//     this.gp.settings.theta-=degToRad(this.offsetRotazione); 
// }else if(this.testiAttuali[s]==="Ruota a sinistra"){
//     this.gp.settings.theta+=degToRad(this.offsetRotazione);
// }else if(this.testiAttuali[s]==="Ruota in alto"){
//     this.gp.settings.phi-= degToRad(this.offsetRotazione);  
//      //limiti visuale mobile
//      if(radToDeg(this.gp.settings.phi)<=0){
//         this.gp.settings.phi= degToRad(0.1);  
//     }
// }else if(this.testiAttuali[s]==="Ruota in basso"){
//     this.gp.settings.phi+= degToRad(this.offsetRotazione); 
//      //limiti visuale mobile
//     if(radToDeg(this.gp.settings.phi)>=90){
//         this.gp.settings.phi= degToRad(89);  
//     }
// }