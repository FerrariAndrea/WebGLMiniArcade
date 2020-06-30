
function convertiBoolToTesto(attivato){
    if(attivato){
        return "abilitato";
    }else{   
        return "disabilitato";
    }
}
class Pulsantiera{ 
    //questa classe è inutile
    //molte delle sue cose vengono già fatte nella classe Panel2D
    //si potrebbe unificare con Panel2D
    constructor(canvas,GamePanel,Game){

        this.isSelected = this.isSelected.bind(this);
        this.mouseClick = this.mouseClick.bind(this);
        this.mouseMove = this.mouseMove.bind(this);        
        this.mouseExit = this.mouseExit.bind(this);
        this.offTouch=this.offTouch.bind(this);
        this.getCanvasW=function(){
        //return canvas.clientWidth;
                return canvas.width;
        }
        this.getCanvasH=function(){
        //return canvas.clientHeight;
                return canvas.height;
        }
        this.gp=GamePanel;
        this.game =Game;
        canvas.onmousemove= this.mouseMove;
        canvas.onclick= this.mouseClick;        
        canvas.onmouseleave= this.mouseExit;
        canvas.touchend = this.offTouch;        
        canvas.touchcancel = this.offTouch;
        
        this.selected = -1; //nessun pulsante selezionato
        this.isFreeCamera=true;
        const mod_testo= "Mode: "+ ( this.gp.isDriftOn() ? "Drift" : "Race") ;
        var illuminazione = "Illuminazione: " ;
        if(this.gp.illuminazione===0.6){
            illuminazione+="alta"
        }else if(this.gp.illuminazione===0.4){
            illuminazione+="media"
        }else{
            illuminazione+="bassa"
        }
        this.testiAttuali= [
                "Cambia visuale: libera",
                "Allontanati",
                "Avvicinati",
                "Ruota a destra",            
                "Ruota a sinistra",
                "Ruota in alto",            
                "Ruota in basso",
                "Specchio: " + convertiBoolToTesto(this.gp.specchio),
                "Frustum: " + convertiBoolToTesto(this.gp.frustum),
                "Blur shadow: " + convertiBoolToTesto(this.gp.blur_shadow),
                mod_testo,
                illuminazione
        ];
        this.offsetRaggio = 5;        
        this.offsetRotazione = 10;//gradi DEG
    }

    isSelected(index){
        return this.selected===index;
    }
    mouseExit(event){
        this.selected=-1;
        //console.log("exit");
    }
    offTouch(){
        this.selected=-1;
    }
    mouseClick(event){
       const s = this.selected;
      //non c'è bisogno che ricalcolo quale pulsante è stato premuto
      if(s>-1 && s< this.testiAttuali.length){
        //click su un pulsante eseguo la sua azione
        if(this.testiAttuali[s]==="Cambia visuale: libera" || this.testiAttuali[s]==="Cambia visuale: dinamica"){
            if(this.isFreeCamera){
                this.isFreeCamera=false;
            }else{
                this.isFreeCamera=true;          
                this.selected=-1;
            }            
            this.gp.setFreeCamera(this.isFreeCamera);
        }else if(this.testiAttuali[s]==="Allontanati"){
            this.gp.settings.radius+=this.offsetRaggio; 
            //limiti visuale mobile 
            if(this.gp.settings.radius>75){
                this.gp.settings.radius=75;
            } 
            //console.log(this.gp.settings.radius);
        }else if(this.testiAttuali[s]==="Avvicinati"){
            this.gp.settings.radius-=this.offsetRaggio;
             //limiti visuale mobile
             if(this.gp.settings.radius<=10){
                this.gp.settings.radius=10;
            } 
        }else if(this.testiAttuali[s]==="Ruota a destra"){
            this.gp.settings.theta-=degToRad(this.offsetRotazione); 
        }else if(this.testiAttuali[s]==="Ruota a sinistra"){
            this.gp.settings.theta+=degToRad(this.offsetRotazione);
        }else if(this.testiAttuali[s]==="Ruota in alto"){
            this.gp.settings.phi-= degToRad(this.offsetRotazione);  
             //limiti visuale mobile
             if(radToDeg(this.gp.settings.phi)<=0){
                this.gp.settings.phi= degToRad(0.1);  
            }
        }else if(this.testiAttuali[s]==="Ruota in basso"){
            this.gp.settings.phi+= degToRad(this.offsetRotazione); 
             //limiti visuale mobile
            if(radToDeg(this.gp.settings.phi)>=90){
                this.gp.settings.phi= degToRad(89);  
            }
        }else if(this.testiAttuali[s].startsWith("Specchio")){
            this.gp.specchio=!this.gp.specchio;
        }else if(this.testiAttuali[s].startsWith("Frustum")){
            this.gp.frustum=!this.gp.frustum;
        }else if(this.testiAttuali[s].startsWith("Blur shadow")){
            if(this.gp.blur_shadow>0){
                this.gp.blur_shadow=0;
            }else{
                this.gp.blur_shadow=700;
            }
        }else if(this.testiAttuali[s].startsWith("Mode")){
            this.gp.setDriftOn(!this.gp.isDriftOn());
            this.game.forceReset();
        }else if(this.testiAttuali[s].startsWith("Illuminazione")){
            if(this.gp.illuminazione===0.6){
                this.gp.illuminazione=0.2;
            }else if(this.gp.illuminazione===0.4){                
                this.gp.illuminazione=0.6;
            }else{                        
                this.gp.illuminazione=0.4;
            }
        }
       
      }     
      var illuminazione = "Illuminazione: " ;
      if(this.gp.illuminazione===0.6){
          illuminazione+="alta"
      }else if(this.gp.illuminazione===0.4){
          illuminazione+="media"
      }else{
          illuminazione+="bassa"
      }
      const mod_testo="Mode: "+ ( this.gp.isDriftOn() ? "Drift" : "Race") ;
       if(this.isFreeCamera){
            this.testiAttuali= [
                    "Cambia visuale: libera",
                    "Allontanati",
                    "Avvicinati",
                    "Ruota a destra",            
                    "Ruota a sinistra",
                    "Ruota in alto",            
                    "Ruota in basso",
                    "Specchio: " + convertiBoolToTesto(this.gp.specchio),
                    "Frustum: " + convertiBoolToTesto(this.gp.frustum),
                    "Blur shadow: " + convertiBoolToTesto(this.gp.blur_shadow>0),
                    mod_testo,
                    illuminazione          
            ];   
        }else{
            this.testiAttuali= [
                "Cambia visuale: dinamica",
                "Specchio: " + convertiBoolToTesto(this.gp.specchio),
                "Frustum: " + convertiBoolToTesto(this.gp.frustum),
                "Blur shadow: " + convertiBoolToTesto(this.gp.blur_shadow>0),
                mod_testo,
                illuminazione      
            ];                       
        }            

    }
    mouseMove(event){
        
        //console.log("move");
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left; //x position within the element.
        var y = event.clientY - rect.top;  //y position within the element.
        //controllo le posizioni nel canvas dei pulsanti
        //per poi stabilire quale è selezionato ( se uno di loro lo è )
        const count = this.testiAttuali.length;
        const marginLeft= getreferedSize(this.getCanvasW(),6);
        const offsetTop = getreferedSize(this.getCanvasH(),20);
        // const marginTop = 5;
        const w= getreferedSize(this.getCanvasW(),86);
        const n =  this.testiAttuali.length;
        const h=getreferedSize(this.getCanvasH(),79 /n);
        for(var i=0;i<count;i++){
            //controllo se il cursore risiede nel quadrato del tasto
            if(x>marginLeft && x< marginLeft+w && y>i*(h)+offsetTop && y< i*(h)+h+offsetTop){
                //se è così il tasto è Selected e quindi posso fermare la mia ricerca
                this.selected=i;
                return;
            }
        }
        //se il cursore non è su nessun pulsante annullo la selezione
        this.selected=-1;
    }
}

class Panel2D{

    constructor(canvas,GamePanel,Game){                           
        //------------------------binds
        this.render= this.render.bind(this);
        this.reset=this.reset.bind(this);
        this.update=this.update.bind(this);
        this.drawPulsante=this.drawPulsante.bind(this);
        //------------------------------------------parametri pubblici
        this.ctx = canvas.getContext("2d");
        this.getCanvasW=function(){
        //return canvas.clientWidth;
                return canvas.width;
        }
        this.getCanvasH=function(){
        //return canvas.clientHeight;
                return canvas.height;
        }
        this.requestAnimationEnabled=false;
        this.FPS=30;
        this.FRAME_MIN_TIME = (1000/60) * (60 / this.FPS) - (1000/60) * 0.5;
        this.lastFrameTime =0;
        //------------------------------
        this.bkColor = "rgba(105, 130, 230, 1)";
        this.textColor = "white";
        this.pulsante = "#A0CED9";        
        this.pulsante_selected = "#ADF7B6";
        //-------------------------------
        this.fpscounter = 0;
        //pulsantiera
        this.pulsantiera = new Pulsantiera(canvas,GamePanel,Game);

    }


    drawPulsante(index,testo,n){
        const selected = this.pulsantiera.isSelected(index);
        const marginLeft= getreferedSize(this.getCanvasW(),6);
        const offsetTop = getreferedSize(this.getCanvasH(),20);
        const marginTop = 5;
        const w= getreferedSize(this.getCanvasW(),86);
        const h=getreferedSize(this.getCanvasH(),79 /n)-marginTop;
        const text_size = getreferedSize(this.getCanvasW(),80);

        this.ctx.strokeStyle ="black";
        this.ctx.beginPath();
        this.ctx.moveTo(marginLeft,     index*(marginTop+h)+offsetTop);
        this.ctx.lineTo(marginLeft+w,  index*(marginTop+h)+offsetTop);        
        this.ctx.lineTo(marginLeft+w, index*(marginTop+h)+h+offsetTop);            
        this.ctx.lineTo(marginLeft, index*(marginTop+h)+h+offsetTop); 
        this.ctx.closePath();
        if(selected){
            this.ctx.fillStyle = this.pulsante_selected;
        }else{
            this.ctx.fillStyle = this.pulsante;
        }
        this.ctx.fill(); 
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.fillStyle =  "black";  
        this.ctx.textAlign = "center";           
        this.ctx.font ="14pt Arial";
        if(selected){
            this.ctx.fillText(testo,marginLeft+w/2, index*(marginTop+h)+h/2-2+offsetTop,text_size);
        }else{
            this.ctx.fillText(testo, marginLeft+w/2, index*(marginTop+h)+h/2+offsetTop,text_size);
        }
        this.ctx.stroke();
        // if(cursorStruct!==undefined){
        //     cursorStruct.addSpicchio(x,y,bucoSize,size,angleStart,angleEnd);
        // }
        // return cursorStruct;
    }

    reset(){
        this.ctx.beginPath();
        this.ctx.fillStyle =  this.bkColor;  
        this.ctx.fillRect(0,0,this.getCanvasW(),this.getCanvasH());
        this.ctx.stroke();
    }

    render(){      
        this.reset(); 
        this.ctx.beginPath();
        //-----------------------------------------------------------//welcome
        var str = 'Welcome to WebGLMiniArcade';
        var text_size = getreferedSize(this.getCanvasW(),80);
        const textSize = getreferedSize(this.getCanvasW(),100)/20; //pixel disponibili
        this.ctx.textAlign = "left";   
        this.ctx.font = textSize+'px Calibri';
        this.ctx.fillStyle = this.textColor; 
        this.ctx.fillText(str,20, getreferedSize(this.getCanvasH(),5),text_size);
        this.ctx.stroke();
        //-----------------------------------------------------------//fps counter
        var str = 'FPS: ' +this.fpscounter;
        this.ctx.font = textSize+'px Calibri';
        this.ctx.fillStyle = this.textColor;   
        this.ctx.fillText(str, getreferedSize(this.getCanvasW(),80), 20,text_size);
        this.ctx.stroke();
        //-----------------------------------------------------------//ctabellone punti
        var strPoint = 'Punti: ' +Game.score;
        this.ctx.font = 'bold  '+ textSize+'px Arial'; 
        this.ctx.fillStyle =  Game.score_color;  
        this.ctx.fillText(strPoint, 12, getreferedSize(this.getCanvasH(),10),text_size);
        this.ctx.stroke();
        var strPoint = 'Tempo: ' +Game.time;
        this.ctx.font = 'bold  '+textSize+'px Arial';
        this.ctx.fillStyle = Game.time_color;
        this.ctx.fillText(strPoint, 12, getreferedSize(this.getCanvasH(),15),text_size);
        this.ctx.stroke();
        this.ctx.fillStyle =  this.textColor; 
        //-----------------------------------------------------------//pulsantiera
        const count = this.pulsantiera.testiAttuali.length;
        for(var x=0;x<count;x++){
            this.drawPulsante(x,this.pulsantiera.testiAttuali[x],count);
        }

    }

    update(time){
        const frame_time = time-this.lastFrameTime;
        if(frame_time < this.FRAME_MIN_TIME){ //skip the frame if the call is too early
                window.requestAnimationFrame(this.update);
                return; // return as there is nothing to do
        }     
        this.lastFrameTime = time; 
        this.render();
        window.requestAnimationFrame(this.update); // get next frame
    }
  


}
