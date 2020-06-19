//questo oggetto serve per clonare un altro oggetto senza generare tutti i buffer e gli array da capi
//i buffer e gli array sono gli stessi per riferimento, mentre la mMatrix cambia 

class Obj3DClone{
    constructor(obj){
            this.obj=obj;   //ref
            this.myMmatrix = m4.copy(this.obj.mMatrix);
            //JSON.parse(JSON.stringify(this.obj.mMatrix));//deep copy
            this.color = JSON.parse(JSON.stringify(this.obj.color));//deep copy
            //-----binds
            this.getBufferInfo=this.getBufferInfo.bind(this);
            this.getUniforms=this.getUniforms.bind(this);
            this.changeColor=this.changeColor.bind(this);       
            this.translate=this.translate.bind(this);
            this.rotate=this.rotate.bind(this);
            this.scale=this.scale.bind(this);
            this.draw=this.draw.bind(this);
            this.isReady=function(){
                return true; //non ha texture ne obj da caricare quidni è sempre pronto
            }
    }



    getUniforms(){
        //questo metodo è quello che cambia la mMatrix del nostro vero oggetto, temporaneamente
        //ottengo la struttura originale
        //in questo modo preservo anceh le texture
        this.myUniform =JSON.parse(JSON.stringify(this.obj.getUniforms()));//deep copy
        //cambio la struttura originale 
        this.myUniform.u_world=this.myMmatrix;
        this.myUniform.u_color=this.color;
        return this.myUniform;

    }


    rotate(grad,x_y_z="x"){
        if(x_y_z==="x"){
            this.mMatrix=m4.xRotate(this.mMatrix, degToRad(grad));
        }else if(x_y_z==="y"){
            this.mMatrix=m4.yRotate(this.mMatrix, degToRad(grad));
        }else{
            this.mMatrix=m4.zRotate(this.mMatrix, degToRad(grad));
        }
    }

    //chiamabile in ogni momenti per scalare
    scale(sx, sy, sz,){
        this.mMatrix=m4.scale(this.mMatrix,sx, sy, sz);         
    }

    //chiamabile in ogni momenti per cambiare la posizione
    translate(x,y,z){
        this.mMatrix=m4.translate(this.mMatrix,x,y,z); 
    }

    //chiamabile in ogni momenti per cambiare il colore
    changeColor(c=[0.0, 1.0, 1.0]){
        this.color=c;
    }

    getBufferInfo(gl){
        return this.obj.getBufferInfo(gl);
    }

    draw(gl,programInfo){
        const uniforms = this.getUniforms();
        const objBufferInfo=this.getBufferInfo(gl);
        //console.log("objBufferInfo",objBufferInfo);             
        //console.log("objBufferInfo",objBufferInfo);
        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, objBufferInfo);
        // Set the uniforms unique to the cube
        webglUtils.setUniforms(programInfo, uniforms);
        // calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, objBufferInfo);
    }
  
}