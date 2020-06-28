

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

function OmbreStep1(gl,n_luci_mondo){
    
 this.depthTextureSize_secondarie = 256;//ombre luci veicolo
 this.depthTextureSize = 1024;//ombre luci mondo
  var indexTexture =0;
  
  generateUnusedTexture= generateUnusedTexture.bind(this);
    //----------------------genero una texture per le ombre per ogni luce del mondo
    for(var x=0;x<n_luci_mondo;x++){
        this.depthTextures[indexTexture] = gl.createTexture();
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
        
            indexTexture++;
       // generateUnusedTexture(gl); //per safari
    }
        

          //----------------------genero una texture per le ombre per ogni luce restante

          for(var i =0;i<this.getObjects().length;i++){
              if(this.getObjects()[i].getLightCount!==undefined){
                  for(var x =0;x<this.getObjects()[i].getLightCount();x++){
                          //per ogni fonte di luce presente in ogni obj
                          //creo una texture per le ombre diversa
                          this.depthTextures[indexTexture] = gl.createTexture();
                          gl.bindTexture(gl.TEXTURE_2D,  this.depthTextures[indexTexture]);
                          gl.texImage2D(
                              gl.TEXTURE_2D,      // target
                              0,                  // mip level
                              gl.DEPTH_COMPONENT, // internal format
                              this.depthTextureSize_secondarie,   // width
                              this.depthTextureSize_secondarie,   // height
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

                              indexTexture++;
                      //  generateUnusedTexture(gl); //per safari
                  }
              }
          }
}




function OmbreStep2(gl,lightWorldMatrix,lightProjectionMatrix){
 
  var indexTexture =0;
 

  // (luce mondo 3 fari da campo)
    for(var x=0;x<lightWorldMatrix.length;x++){
         // draw to the depth texture
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffers[indexTexture]);
        gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //per le ombre
        this.drawScene(
            lightProjectionMatrix,
            lightWorldMatrix[x],
            null,
            lightWorldMatrix,
            this.colorProgramInfo);
      indexTexture ++;
    }

  //-------------

   //per tutte le altre luci (come i fari)
   for (var x=0;x<this.getObjects().length;x++){
           if(this.getObjects()[x].setLigths!==undefined){
               const lightProjectionMatrixs=this.getObjects()[x].getLightProjectionMatrixs();
               const lightWorldMatrixs= this.getObjects()[x].getLightWorldMatrixs();
               for(var i=0;i<lightProjectionMatrixs.length;i++){
                   //console.log(i);
               
                   // draw to the depth texture
                   gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffers[indexTexture]);
                   gl.viewport(0, 0,  this.depthTextureSize_secondarie,  this.depthTextureSize_secondarie);
                   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
               
                   //per le ombre 
                   this.drawScene(
                       lightProjectionMatrixs[i],
                       lightWorldMatrixs[i],
                       null,
                       lightWorldMatrix,
                       this.colorProgramInfo);

                    indexTexture ++;
             
               }
           }
   }
    // now draw scene to the canvas projecting the depth texture into the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


function OmbreStep3(lightWorldMatrix,lightProjectionMatrix){

    var indexTexture =0;

  const textureMatrix=[];

   //per le luci del mondo

   for(var x=0;x<lightWorldMatrix.length;x++){
    textureMatrix[indexTexture]= m4.identity();
    textureMatrix[indexTexture] = m4.translate(textureMatrix[indexTexture], 0.5, 0.5, 0.5);
    textureMatrix[indexTexture] = m4.scale(textureMatrix[indexTexture], 0.5, 0.5, 0.5);  
    textureMatrix[indexTexture] = m4.multiply(textureMatrix[indexTexture], lightProjectionMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this this world space.
    textureMatrix[indexTexture] = m4.multiply( textureMatrix[indexTexture], m4.inverse(lightWorldMatrix[indexTexture]));
  
    indexTexture ++;
  
   }



   //per tutte le altre luci (come i fari)

   for (var x=0;x<this.getObjects().length;x++){
       if(this.getObjects()[x].setLigths!==undefined){
           const lightProjectionMatrixs=this.getObjects()[x].getLightProjectionMatrixs();
           const lightWorldMatrixs= this.getObjects()[x].getLightWorldMatrixs();
           for(var i=0;i<lightProjectionMatrixs.length;i++){
               //console.log(i);
               textureMatrix[indexTexture]= m4.identity();
               textureMatrix[indexTexture] = m4.translate(textureMatrix[indexTexture], 0.5, 0.5, 0.5);
               textureMatrix[indexTexture] = m4.scale(textureMatrix[indexTexture], 0.5, 0.5, 0.5);
               textureMatrix[indexTexture] = m4.multiply(textureMatrix[indexTexture], lightProjectionMatrixs[i]);
               textureMatrix[indexTexture] = m4.multiply( textureMatrix[indexTexture], m4.inverse(lightWorldMatrixs[i]));
               
               indexTexture ++;
           }
       }
   }
  return textureMatrix;
}



