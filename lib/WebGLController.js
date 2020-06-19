class WebGLController{

        constructor(canvas,ojbs,debug=false){   
                

                //----------------------------------binds
                this.render= this.render.bind(this);
                this.update=this.update.bind(this);
                this.init=this.init.bind(this);
                this.drawScene=this.drawScene.bind(this);
                //--------------------------------------------parametri privati
                var gl;
                if(debug){
                        function logGLCall(functionName, args) {   
                                console.log("gl." + functionName + "(" + 
                                   WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
                             } 
                        gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"),undefined, logGLCall);
                         
                }else{
                        gl = canvas.getContext('webgl');
                        if (!gl) {
                                return;
                        }
                        
                }
                const ext = gl.getExtension('WEBGL_depth_texture');
                if (!ext) {
                  return alert('need WEBGL_depth_texture');  // eslint-disable-line
                }
                this.getGL=function(){
                        return gl;
                }      
                this.getObjects=function(){
                        return ojbs;
                }
                this.getCanvasW=function(){
                        //return canvas.clientWidth;
                                return canvas.width;
                }
                this.getCanvasH=function(){
                        //return canvas.clientHeight;
                        return canvas.height;
                }
                this.frustum=false;
                var FPS=60;//.................limite
                this.FRAME_MIN_TIME = (1000/60) * (60 / FPS) - (1000/60) * 0.5;
                this.lastFrameTime=performance.now();
                //--------------------------------
                this.illuminazione=1.0 //cambio il rapporto di luce, attraverso le obre, in pratica aggiungo un ombra omogenea su tutti i px
                this.blur_shadow=700;
                //--------------------------------
                this.fpsCounterFunction= null;
             
        }
        init(){
                const gl = this.getGL();
                            // setup GLSL programs
                this.textureProgramInfo = webglUtils.createProgramInfo(gl, ['3d-vertex-shader', '3d-fragment-shader']);
                this.colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);
                
                // this.mMatrix_texture = gl.getUniformLocation(this.textureProgramInfo.program, "Mmatrix");
                // this.mMatrix_programInfo = gl.getUniformLocation(this.colorProgramInfo.program, "Mmatrix");

                // make a 8x8 checkerboard texture
                this.checkerboardTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.checkerboardTexture);
                gl.texImage2D(
                gl.TEXTURE_2D,
                0,                // mip level
                gl.LUMINANCE,     // internal format
                8,                // width
                8,                // height
                0,                // border
                gl.LUMINANCE,     // format
                gl.UNSIGNED_BYTE, // type
                new Uint8Array([  // data
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                ]));
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                //per ogni oggetto creo e alloco la texture (ANDREBBE POI DEALLOCATA ??)
                for(var i =0;i<this.getObjects().length;i++){
                        this.getObjects()[i].createTexture(gl);
                }

                this.depthTexture = gl.createTexture();
                this.depthTextureSize = 1024;
                gl.bindTexture(gl.TEXTURE_2D,  this.depthTexture);
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

                this.depthFramebuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);

                gl.framebufferTexture2D(
                gl.FRAMEBUFFER,       // target
                gl.DEPTH_ATTACHMENT,  // attachment point
                gl.TEXTURE_2D,        // texture target
                this.depthTexture,         // texture
                0);                   // mip level

                // create a color texture of the same size as the depth texture
                // see article why this is needed_
                const unusedTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
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
                unusedTexture,         // texture
                0);                    // mip level


                this.cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
                        position: [
                          -1, -1, -1,
                           1, -1, -1,
                          -1,  1, -1,
                           1,  1, -1,
                          -1, -1,  1,
                           1, -1,  1,
                          -1,  1,  1,
                           1,  1,  1,
                        ],
                        indices: [
                          0, 1,
                          1, 3,
                          3, 2,
                          2, 0,
                    
                          4, 5,
                          5, 7,
                          7, 6,
                          6, 4,
                    
                          0, 4,
                          1, 5,
                          3, 7,
                          2, 6,
                        ],
                      });
                    
                this.settings = {
                        cameraX: 10,
                        cameraY: 20,
                        posX: 10,
                        posY: 20,
                        posZ: 20,
                        targetX: 2.5,
                        targetY: 0,
                        targetZ: 10,
                        projWidth: 1,
                        projHeight: 1,
                        perspective: true,
                        fieldOfView: 1,
                        bias: -0.006,
                };
                this.settings = {
                        cameraX: 5,
                        cameraY: 5,
                        posX: 2.5,
                        posY: 4.8,
                        posZ: 4.3,
                        targetX: 2.5,
                        targetY: 0,
                        targetZ: 3.5,
                        projWidth: 2,
                        projHeight: 2,
                        perspective: true,
                        fieldOfView: 120,
                        bias: -0.003, //0.006   
                      };

        }

        drawScene(projectionMatrix,cameraMatrix,textureMatrix,lightWorldMatrix,programInfo,mMatrix=null) {
              // Make a view matrix from the camera matrix.
              const viewMatrix = m4.inverse(cameraMatrix);
              const gl = this.getGL();
              gl.useProgram(programInfo.program);
  
              // set uniforms that are the same for both the sphere and plane
              // note: any values with no corresponding uniform in the shader
              // are ignored.
          
              webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix,
                u_bias: this.settings.bias,
                u_textureMatrix: textureMatrix,
                u_projectedTexture:  this.depthTexture,
                u_shininess: 150,
                u_innerLimit: Math.cos(degToRad(this.settings.fieldOfView / 2 - 10)),
                u_outerLimit: Math.cos(degToRad(this.settings.fieldOfView / 2)),

                u_lightDirection: lightWorldMatrix.slice(8, 11).map(v => -v),

                u_lightWorldPosition:[this.settings.posX, this.settings.posY, this.settings.posZ],  


                u_viewWorldPosition: cameraMatrix.slice(12, 15),              
                illuminazione: this.illuminazione,                
                blur_shadow: this.blur_shadow
              });
              
              this.fieldOfViewRadians = degToRad(60);
          
              // ---------------------------------------------------------------------------------------------------------- Draw OBJ
              //---------------------------------------------------QUESTO PER OGNI OBJ
                  
                        for(var i =0;i<this.getObjects().length;i++){
                                var t0 = performance.now()
                                this.getObjects()[i].draw(gl,programInfo);
                                var t1 = performance.now()
                               // console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
                              
                        }
              
                // ---------------------------------------------------------------- Draw the plane --------
       

                const planeUniforms = {
                        u_colorMult: [1, 0.5, 0, 1],  // lightblue
                        u_color: [0, 0, 0, 1],
                        u_texture: this.checkerboardTexture,
                        u_world: m4.translation(-1, -1, -1),                        
                        texture_enable: 1.0 //aggiunta da me
                      };
                const planeBufferInfo = primitives.createPlaneBufferInfo(
                gl,
                20,  // width
                20,  // height
                1,   // subdivisions across
                1,   // subdivisions down
                );
                //console.log("planeBufferInfo",planeBufferInfo);
                // Setup all the needed attributes.
                webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);

                // Set the uniforms unique to the cube
                webglUtils.setUniforms(programInfo, planeUniforms);

                // calls gl.drawArrays or gl.drawElements
                webglUtils.drawBufferInfo(gl, planeBufferInfo);
        }

        render(){
                //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
                const gl = this.getGL();
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.DEPTH_TEST);
            
                // first draw from the POV of the light
                const lightWorldMatrix = m4.lookAt(
                    [this.settings.posX, this.settings.posY, this.settings.posZ],          // position
                    [this.settings.targetX, this.settings.targetY, this.settings.targetZ], // target
                    [0, 1, 0],                                              // up
                );
                const lightProjectionMatrix = this.settings.perspective
                    ? m4.perspective(
                        degToRad(this.settings.fieldOfView),
                        this.settings.projWidth / this.settings.projHeight,
                        0.5,  // near
                        10)   // far
                    : m4.orthographic(
                        -this.settings.projWidth / 2,   // left
                        this.settings.projWidth / 2,   // right
                        -this.settings.projHeight / 2,  // bottom
                        this.settings.projHeight / 2,  // top
                         0.5,                      // near
                         10);                      // far
            
                // draw to the depth texture
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
                gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
                this.drawScene(
                    lightProjectionMatrix,
                    lightWorldMatrix,
                    m4.identity(),
                    lightWorldMatrix,
                    this.colorProgramInfo);//,this.mMatrix_programInfo
            
                // now draw scene to the canvas projecting the depth texture into the scene
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
                let textureMatrix = m4.identity();
                textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
                textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
                textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
                // use the inverse of this world matrix to make
                // a matrix that will transform other positions
                // to be relative this this world space.
                textureMatrix = m4.multiply(
                    textureMatrix,
                    m4.inverse(lightWorldMatrix));
            
                // Compute the projection matrix
                const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                const projectionMatrix =
                 m4.perspective(this.fieldOfViewRadians, aspect, 1, 2000);
            
                // Compute the camera's matrix using look at.
                const cameraPosition = [this.settings.cameraX, this.settings.cameraY, 7];
                const target = [0, 0, 0];
                const up = [0, 1, 0];
                const cameraMatrix = m4.lookAt(cameraPosition, target, up);
            
                this.drawScene(
                    projectionMatrix,
                    cameraMatrix,
                    textureMatrix,
                    lightWorldMatrix,
                    this.textureProgramInfo);//,this.mMatrix_texture
            
                // ------ Draw the frustum ------
                if(this.frustum){
                        const viewMatrix = m4.inverse(cameraMatrix);
            
                        gl.useProgram(this.colorProgramInfo.program);
                  
                        // Setup all the needed attributes.
                        webglUtils.setBuffersAndAttributes(gl, this.colorProgramInfo, this.cubeLinesBufferInfo);
                  
                        // scale the cube in Z so it's really long
                        // to represent the texture is being projected to
                        // infinity
                        const mat = m4.multiply(lightWorldMatrix, m4.inverse(lightProjectionMatrix));
                  
                        // Set the uniforms we just computed
                        webglUtils.setUniforms(this.colorProgramInfo, {
                          u_color: [1, 0, 0, 1],
                          u_view: viewMatrix,
                          u_projection: projectionMatrix,
                          u_world: mat,
                        });
                  
                        // calls gl.drawArrays or gl.drawElements
                        webglUtils.drawBufferInfo(gl, this.cubeLinesBufferInfo, gl.LINES);
                }
                // if(this.requestAnimationEnabled){
                //         window.requestAnimationFrame(this.update); 
                // }
        }
        
        
        update(){
                var time = performance.now()
                const frame_time = time-this.lastFrameTime;
                if(frame_time < this.FRAME_MIN_TIME){ //skip the frame if the call is too early
                        //CarDoStep();
                        window.requestAnimationFrame(this.update);
                }else{
                        if(this.fpsCounterFunction!==null){
                                this.fpsCounterFunction(1000/frame_time );
                        }                   
                        this.lastFrameTime = time; // remember the time of the rendered frame
                        // render the frame
                        //console.log("not skipped");
                        this.render();
                        window.requestAnimationFrame(this.update); // get next frame
                }
   
        }
        

}
