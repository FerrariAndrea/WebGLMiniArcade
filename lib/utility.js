
function degToRad(d) {
    return d * Math.PI / 180;
}

function getreferedSize(percentuale,max,text_length=-1){
     if(text_length>0){
         return percentuale*max/100/text_length;
     }else{
        return percentuale*max/100;
    }
}