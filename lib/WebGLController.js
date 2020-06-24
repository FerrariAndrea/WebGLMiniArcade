
"use strict";



class WebGLController{

        constructor(canvas,ojbs,debug=false){   
                
                //----------------------------------binds
                this.render= this.render.bind(this);
                this.update=this.update.bind(this);
                this.init=this.init.bind(this);
                this.drawScene=this.drawScene.bind(this);
                this.drawFrustum=this.drawFrustum.bind(this);
                this.realRender=this.realRender.bind(this);
                //--------------------------------------------parametri privati
                var gl;
                if(debug){
                        function logGLCall(functionName, args) {   
                                console.log("gl." + functionName + "(" + 
                                   WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
                             } 
                        gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl",{stencil: true}),undefined, logGLCall);
                         
                }else{
                        gl = canvas.getContext('webgl',{stencil: true});
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
                this.blur_shadow=0; //700 Se si attiva il blur delle ombre smetto di proiettare le ombre per le luci secondarie
                //--------------------------------
                this.fpsCounterFunction= null;
             
                //----------------specchio
                this.specchio=false;
        }
        init(){
                const gl = this.getGL();
                // setup GLSL programs
                this.textureProgramInfo = webglUtils.createProgramInfo(gl, ['3d-vertex-shader', '3d-fragment-shader']);
                this.colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);
                this.stencilProgramInfo =webglUtils.createProgramInfo(gl, ["stencil-vertex-shader", "stencil-fragment-shader"]);
                // this.mMatrix_texture = gl.getUniformLocation(this.textureProgramInfo.program, "Mmatrix");
                // this.mMatrix_programInfo = gl.getUniformLocation(this.colorProgramInfo.program, "Mmatrix");

               

                //per ogni oggetto creo e alloco la texture (ANDREBBE POI DEALLOCATA ??)
                for(var i =0;i<this.getObjects().length;i++){
                        //non tutti gli obj hanno le texture (ad esempio la Pista non ha il metodo createTexture)
                        if( this.getObjects()[i].createTexture!==undefined){                                
                                  this.getObjects()[i].createTexture(gl);
                        }
                }

               
                
                this.depthFramebuffers =[];                
                this.depthTextures =[];
                OmbreStep1 = OmbreStep1.bind(this);
                OmbreStep2 = OmbreStep2.bind(this);                
                OmbreStep3 = OmbreStep3.bind(this);
                OmbreStep1(gl);
            
                //usato per frustum
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
                        // cameraX: 5, //10 -10
                        // cameraY: 5, //1 20
                        // cameraZ: 5,

                        radius: 10,           
                        phi:degToRad(1),             //su-giù
                        theta: degToRad(1),   

                        posX: 2.5,
                        posY: 4.8,
                        posZ: 4.3,
                        targetX: 2.5,
                        targetY: 0,
                        targetZ: 3.5,
                        projWidth: 2,
                        projHeight: 2,
                        perspective: true,
                        fieldOfView: 1, //120
                        bias: -0.003, //0.006   
                      };

           
        

        }

   
        drawScene(projectionMatrix,cameraMatrix,textureMatrix,lightWorldMatrix,programInfo,specchioMatrix=null) {
              // Make a view matrix from the camera matrix.
              const viewMatrix = m4.inverse(cameraMatrix);
              const gl = this.getGL();
              gl.useProgram(programInfo.program);
  
              // set uniforms that are the same for both the sphere and plane
              // note: any values with no corresponding uniform in the shader
              // are ignored.
              var  u_textureMatrix;
              var  u_textureMatrix_1;
              var  u_textureMatrix_2;
              var  u_textureMatrix_3;              
              var  u_textureMatrix_4;              
              var  u_textureMatrix_5;              
              var  u_textureMatrix_6;
              if(textureMatrix===null){
                u_textureMatrix= m4.identity();
                u_textureMatrix_1= m4.identity();                
                u_textureMatrix_2= m4.identity();                
                u_textureMatrix_3= m4.identity();                
                u_textureMatrix_4= m4.identity();                              
                u_textureMatrix_5= m4.identity();                
                u_textureMatrix_6= m4.identity();
              }else{
                u_textureMatrix=textureMatrix[0];          
                u_textureMatrix_1= textureMatrix[1];                   
                u_textureMatrix_2= textureMatrix[2];                   
                u_textureMatrix_3= textureMatrix[3];                   
                u_textureMatrix_4= textureMatrix[4];                                  
                u_textureMatrix_5= textureMatrix[5];                   
                u_textureMatrix_6= textureMatrix[6];   
              }
              //caso normale ( non specchiato )
              var projectionMatrix_ =projectionMatrix;         
              var inverseRef = true;     
              if(specchioMatrix===null){                      
                specchioMatrix = m4.identity();   
                inverseRef=false;
              }
              webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix_,
                u_bias: this.settings.bias,
                u_textureMatrix:u_textureMatrix,                
                u_textureMatrix_1: u_textureMatrix_1,                      
                u_textureMatrix_2: u_textureMatrix_2,                            
                u_textureMatrix_3: u_textureMatrix_3,
                u_textureMatrix_4: u_textureMatrix_4,                                         
                u_textureMatrix_5: u_textureMatrix_5,
                u_textureMatrix_6: u_textureMatrix_6,
                u_projectedTexture:  this.depthTextures[0],                
                u_projectedTexture_1:  this.depthTextures[1],                
                u_projectedTexture_2:  this.depthTextures[2],                
                u_projectedTexture_3:  this.depthTextures[3],                
                u_projectedTexture_4:  this.depthTextures[4],                              
                u_projectedTexture_5:  this.depthTextures[5],                
                u_projectedTexture_6:  this.depthTextures[6],   
                u_shininess: 150,
                u_innerLimit: Math.cos(degToRad(this.settings.fieldOfView / 2 - 10)),
                u_outerLimit: Math.cos(degToRad(this.settings.fieldOfView / 2)),
                u_lightDirection: lightWorldMatrix.slice(8, 11).map(v => -v),
                u_lightWorldPosition:[this.settings.posX, this.settings.posY, this.settings.posZ], 
                u_viewWorldPosition: cameraMatrix.slice(12, 15),              
                illuminazione: this.illuminazione,                
                blur_shadow: this.blur_shadow,
                specchioMatrix: specchioMatrix
              });
              
             
              //--------------------------------------------------------------------------------------------------------------------
              //per ogni oggetto setto eventuali variabili d'ambiente che influiscono su tutti gli altri oggetti
              // (ad esempio le luci dell'auto, solo l'oggetto car possiede il metodo setLigths)
              for(var i =0;i<this.getObjects().length;i++){
                      if(this.getObjects()[i].setLigths!==undefined){
                        this.getObjects()[i].setLigths(programInfo);
                      }
              }
              // ---------------------------------------------------------------------------------------------------------- Draw OBJ
              //---------------------------------------------------QUESTO PER OGNI OBJ
                  
                for(var i =0;i<this.getObjects().length;i++){
                        this.getObjects()[i].draw(gl,programInfo,inverseRef);                              
                }
              
             
        }

        realRender(cameraMatrix,projectionMatrix,specchioMatrix=null,textureMatrixAlredyCalculated=null){
                const gl = this.getGL();
                // first draw from the POV of the light (luce mondo)
                var lightWorldMatrix = m4.lookAt(
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
                        10);       

                gl.enable(gl.CULL_FACE);
                gl.enable(gl.DEPTH_TEST);


                //in sostanza non posso calcolare le ombre mentre disegno lo specchio, se no verrebbe resettato (gl.clearColor)
                // il frame attuale al di fuori dello specchio
                //dunque avendole già le ombre  (textureMatrix) calcolate in precendeza per disegnare proprio fuori dallo specchio, riuso le stesse
                var textureMatrix=textureMatrixAlredyCalculated;          
                if(specchioMatrix===null){
                        // draw to the depth texture (solo se non è la draw nel mondo dentro lo specchio)
                        OmbreStep2(gl,lightWorldMatrix,lightProjectionMatrix,this.getObjects(),this);            
                        textureMatrix =OmbreStep3(lightWorldMatrix,lightProjectionMatrix,this.getObjects());                
                }



            
                this.drawScene(
                    projectionMatrix,
                    cameraMatrix,
                    textureMatrix,
                    lightWorldMatrix,
                    this.textureProgramInfo,specchioMatrix);

                return textureMatrix;
            
        }

        render(){
              
                const gl = this.getGL();
           
                gl.useProgram(this.stencilProgramInfo.program);
                     
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.DEPTH_TEST);
                // Compute the camera's matrix using look at.      
                const r = this.settings.radius;
                var p = this.settings.phi;
                var t = this.settings.theta;
                var eye = [ 
                        r*Math.sin(p)*Math.cos(t), 
                        r*Math.cos(p),                        
                        r*Math.sin(p)*Math.sin(t),
                    ];

                const target = [0, 0, 0];
                const up = [0,1,0];
                var cameraMatrix = m4.lookAt(eye, target, up);

                // // Compute the projection matrix
                const fieldOfViewRadians = degToRad(60);
              
                const aspect =  this.getCanvasW()/  this.getCanvasH();
                const projectionMatrix =m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
          

                if( this.specchio){
     
                        var specchioMatrix = [
                                -1,0,0,0,
                                0,1,0,0,
                                0,0,1,0,
                                0,0,0,1
                        ];
        
                        // //this.specchio.render(gl,cameraMatrix,projectionMatrix,this.settings);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        gl.enable( gl.STENCIL_TEST );
                        gl.stencilMask(0xff);
                        gl.stencilFunc( gl.ALWAYS, 0x1,0xff);
                        gl.stencilOp( gl.REPLACE, gl.REPLACE, gl.REPLACE );
                        // gl.colorMask(false,false, false, false, false);
                        // gl.depthMask(false);
                        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);              
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                       
                                                
                       
                        // specchioMatrix=m4.translate(specchioMatrix,-10, 0, -20);
                        const planeBufferInfo = primitives.createPlaneBufferInfo(
                        gl,
                        10,  // width
                        10,  // height
                        1,   // subdivisions across
                        1,   // subdivisions down
                        );
                        const viewMatrix = m4.inverse(cameraMatrix);
                        webglUtils.setUniforms(this.stencilProgramInfo, {
                                u_view: viewMatrix,
                                u_projection: projectionMatrix,
                                u_world:m4.xRotate(m4.translation(0, 5, 0),degToRad(90))
                        });
                        //console.log("planeBufferInfo,planeBufferInfo",planeBufferInfo)
                        webglUtils.setBuffersAndAttributes(gl,  this.stencilProgramInfo, planeBufferInfo);
                        webglUtils.drawBufferInfo(gl, planeBufferInfo);
        
            
                        // /*
                        // gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     
                        // */
        
                         gl.stencilMask(0.0);
                         gl.stencilOp( gl.KEEP, gl.KEEP, gl.KEEP );              
               
        
                      
                         gl.stencilFunc( gl.NOTEQUAL,0x1,0xff);
                         const textureMatrix= this.realRender(cameraMatrix,projectionMatrix);
          
        
                        t+=degToRad(180);
                         var eye = [ 
                                r*Math.sin(p)*Math.cos(t), 
                                r*Math.cos(p),                        
                                r*Math.sin(p)*Math.sin(t),
                            ];
                        cameraMatrix = m4.lookAt(eye, target, up);
        
        
                         gl.stencilFunc( gl.EQUAL,0x1,0xff);
                         this.realRender(cameraMatrix,projectionMatrix,specchioMatrix,textureMatrix);
                }else{
                        this.realRender(cameraMatrix,projectionMatrix);
                }
            
        


                if(this.frustum){
                        // ------ Draw the frustum ------        
                        this.drawFrustum(cameraMatrix,projectionMatrix);
                }
        }
        

        drawFrustum(cameraMatrix,projectionMatrix){
                const gl = this.getGL();
                //------------------------------------------------luce principale
                var lightWorldMatrix = m4.lookAt(
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
                        10);      
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
                webglUtils.drawBufferInfo(gl, this.cubeLinesBufferInfo, gl.LINES);
                //---------------------------------------------------QUESTO PER OGNI OBJ CHE POSSIEDE il drawFrustum                        
                for(var i =0;i<this.getObjects().length;i++){
                        if(this.getObjects()[i].drawFrustum!==undefined){
                                this.getObjects()[i].drawFrustum(gl,cameraMatrix,this.colorProgramInfo,projectionMatrix,this.cubeLinesBufferInfo);
                        }                      
                }
        }
        
        update(){
                var time = performance.now(); 
                const frame_time = time-this.lastFrameTime;
                if(frame_time < this.FRAME_MIN_TIME){ 
                        //skip the frame if the call is too early
                        window.requestAnimationFrame(this.update);
                }else{
                        if(this.fpsCounterFunction!==null){
                                //callback per segnare gli fps attuali al canvas del pannello 2D
                                this.fpsCounterFunction(1000/frame_time);
                        }                   
                        this.lastFrameTime = time; // remember the time of the rendered frame
                        // render the frame
                        //console.log("not skipped");
                        this.render();
                        // get next frame
                        window.requestAnimationFrame(this.update); 
                }
   
        }
        

}
