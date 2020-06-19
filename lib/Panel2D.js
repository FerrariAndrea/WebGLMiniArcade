
class Panel2D{

    constructor(canvas){                           
        //------------------------binds
        this.render= this.render.bind(this);
        this.reset=this.reset.bind(this);
        this.update=this.update.bind(this);
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
        //-------------------------------
        this.fpscounter = 0;

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
        this.ctx.font = '18pt Calibri';
        this.ctx.fillStyle = this.textColor; 
        //     console.log(text_size)            
        //     console.log( getreferedSize(this.getCanvasH(),10))
        this.ctx.fillText(str,20, getreferedSize(this.getCanvasH(),10),text_size);
        this.ctx.stroke();
        //-----------------------------------------------------------//fps counter
        var str = 'FPS: ' +this.fpscounter;
        this.ctx.font = '14pt Calibri';
        this.ctx.fillStyle = this.textColor; 
        //     console.log(text_size)            
        //     console.log( getreferedSize(this.getCanvasH(),10))
        this.ctx.fillText(str,2, 20,100);
        this.ctx.stroke();

        // if(this.requestAnimationEnabled){
        //     window.requestAnimationFrame(this.update);
        // }
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
