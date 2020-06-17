
class Panel2D{

    constructor(canvas){                           
        //------------------------binds
        this.render= this.render.bind(this);
        this.reset=this.reset.bind(this);
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
        //------------------------------
        this.bkColor = "rgba(105, 130, 230, 1)";
        this.textColor = "white";

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
        //to manage text on canvas and webgl
        var str = 'Welcome to WebGLMiniArcade';
        var text_size = getreferedSize(this.getCanvasW(),80);
        this.ctx.font = '18pt Calibri';
        this.ctx.fillStyle = this.textColor; 
        //     console.log(text_size)            
        //     console.log( getreferedSize(this.getCanvasH(),10))
        this.ctx.fillText(str,20, getreferedSize(this.getCanvasH(),10),text_size);
        this.ctx.stroke();
        //console.log("miao")
        if(this.requestAnimationEnabled){
            window.requestAnimationFrame(this.render);
        }
    }

  


}
