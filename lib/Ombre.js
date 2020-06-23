

function generateUnusedTexture(gl){
      // create a color texture of the same size as the depth texture
            // see article why this is needed_ (per la compatibilità con safari)
            this.unusedTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
                gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                this.depthTextureSize,
                this.depthTextureSize,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null,
                );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // attach it to the framebuffer
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,        // target
                gl.COLOR_ATTACHMENT0,  // attachment point
                gl.TEXTURE_2D,         // texture target
                this.unusedTexture,         // texture
                0);                    // mip lev

}

function OmbreStep1(gl){
    var indexTexture =0;
    this.depthTextures[indexTexture] = gl.createTexture();
            this.depthTextureSize = 1024;
            gl.bindTexture(gl.TEXTURE_2D,  this.depthTextures[indexTexture]);
            gl.texImage2D(
                gl.TEXTURE_2D,      // target
                0,                  // mip level
                gl.DEPTH_COMPONENT, // internal format
                this.depthTextureSize,   // width
                this.depthTextureSize,   // height
                0,                  // border
                gl.DEPTH_COMPONENT, // format
                gl.UNSIGNED_INT,    // type
                null);              // data
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                this.depthFramebuffers[indexTexture] = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffers[indexTexture]);

                gl.framebufferTexture2D(
                gl.FRAMEBUFFER,       // target
                gl.DEPTH_ATTACHMENT,  // attachment point
                gl.TEXTURE_2D,        // texture target
                this.depthTextures[indexTexture],         // texture
                0);                   // mip level
            
                
             generateUnusedTexture= generateUnusedTexture.bind(this);
             generateUnusedTexture(gl);

            //----------------------genero una texture per le ombre per ogni luce restante

            for(var i =0;i<this.getObjects().length;i++){
                if(this.getObjects()[i].getLightCount!==undefined){
                    for(var x =0;x<this.getObjects()[i].getLightCount();x++){
                            //per ogni fonte di luce presente in ogni obj
                            //creo una texture per le ombre diversa
                            indexTexture++;
                            this.depthTextures[indexTexture] = gl.createTexture();
                            this.depthTextureSize = 1024;
                            gl.bindTexture(gl.TEXTURE_2D,  this.depthTextures[indexTexture]);
                            gl.texImage2D(
                                gl.TEXTURE_2D,      // target
                                0,                  // mip level
                                gl.DEPTH_COMPONENT, // internal format
                                this.depthTextureSize,   // width
                                this.depthTextureSize,   // height
                                0,                  // border
                                gl.DEPTH_COMPONENT, // format
                                gl.UNSIGNED_INT,    // type
                                null);              // data
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
                            this.depthFramebuffers[indexTexture] = gl.createFramebuffer();
                            gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffers[indexTexture]);
            
                            gl.framebufferTexture2D(
                                gl.FRAMEBUFFER,       // target
                                gl.DEPTH_ATTACHMENT,  // attachment point
                                gl.TEXTURE_2D,        // texture target
                                this.depthTextures[indexTexture],         // texture
                                0);                   // mip level
                    }
                }
            }
}




function OmbreStep2(gl,lightWorldMatrix,lightProjectionMatrix,objs){
   
    var indexTexture =0;
    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffers[indexTexture]);
    gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //per le ombre (luce mondo)
    this.drawScene(
        lightProjectionMatrix,
        lightWorldMatrix,
        null,
        lightWorldMatrix,
        this.colorProgramInfo);


    //-------------

     //per tutte le altre luci (come i fari)
     for (var x=0;x<objs.length;x++){
             if(objs[x].setLigths!==undefined){
                 const lightProjectionMatrixs=objs[x].getLightProjectionMatrixs();
                 const lightWorldMatrixs= objs[x].getLightWorldMatrixs();
                 for(var i=0;i<lightProjectionMatrixs.length;i++){
                     //console.log(i);
                     indexTexture ++;
                     // draw to the depth texture
                     gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffers[indexTexture]);
                     gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
                     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                 
                     //per le ombre (luce mondo)
                     this.drawScene(
                         lightProjectionMatrixs[i],
                         lightWorldMatrixs[i],
                         null,
                         lightWorldMatrixs[i],
                         this.colorProgramInfo);
                        
               
                 }
             }
     }
      // now draw scene to the canvas projecting the depth texture into the scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


function OmbreStep3(lightWorldMatrix,lightProjectionMatrix,objs){
 


    const textureMatrix=[];
    textureMatrix[0]= m4.identity();
    textureMatrix[0] = m4.translate(textureMatrix[0], 0.5, 0.5, 0.5);
    textureMatrix[0] = m4.scale(textureMatrix[0], 0.5, 0.5, 0.5);

    //textureMatrix= OmbreStep3(textureMatrix,lightWorldMatrix,lightProjectionMatrix,this.getObjects())
    textureMatrix[0] = m4.multiply(textureMatrix[0], lightProjectionMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this this world space.
    textureMatrix[0] = m4.multiply( textureMatrix[0], m4.inverse(lightWorldMatrix));


 

    // textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    // // use the inverse of this world matrix to make
    // // a matrix that will transform other positions
    // // to be relative this this world space.
    // textureMatrix = m4.multiply(
    //     textureMatrix,
    //     m4.inverse(lightWorldMatrix));


//      //per tutte le altre luci (come i fari)
    var indexTexture =0;
     for (var x=0;x<objs.length;x++){
         if(objs[x].setLigths!==undefined){
             const lightProjectionMatrixs=objs[x].getLightProjectionMatrixs();
             const lightWorldMatrixs= objs[x].getLightWorldMatrixs();
             for(var i=0;i<lightProjectionMatrixs.length;i++){
                 //console.log(i);
                 indexTexture ++;
                 textureMatrix[indexTexture]= m4.identity();
                 textureMatrix[indexTexture] = m4.translate(textureMatrix[indexTexture], 0.5, 0.5, 0.5);
                 textureMatrix[indexTexture] = m4.scale(textureMatrix[indexTexture], 0.5, 0.5, 0.5);
                 textureMatrix[indexTexture] = m4.multiply(textureMatrix[indexTexture], lightProjectionMatrixs[i]);
                 textureMatrix[indexTexture] = m4.multiply( textureMatrix[indexTexture], m4.inverse(lightWorldMatrixs[i]));
             }
         }
     }
    return textureMatrix;
}