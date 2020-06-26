
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
                this.setFreeCamera=this.setFreeCamera.bind(this);
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
                this.illuminazione=0.2; //luminosità generale 
                this.blur_shadow=0; //800;
                //--------------------------------
                this.fpsCounterFunction= null;             
                //----------------specchio
                this.specchio=false;
                //modalità gioco
                 //se true l'auto sbanda di più (meno aderenza) e il conteggio dei punti viene moltiplicato per l'angolo di sterzata
                 //se false, l'auto rimane stabile sul terreno, il conteggio è moltiplicato per valocità della macchina
                 //do per scontanto che il primo obj dell'array sia la macchina, dato che anche per la modalità dinamica della camera 
                 //serve che l'auto sia in posizione [0] dell'array
                this.setDriftOn=function(enable){
                        this.getObjects()[0].driftOn=enable;
                };
                this.setDriftOn=this.setDriftOn.bind(this);
                this.isDriftOn=function(){
                         return this.getObjects()[0].driftOn;
                }
                this.isDriftOn=this.isDriftOn.bind(this);
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
                OmbreStep1(gl,3); //3--> numero luci ombre del mondo
            
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

                this.freeCamera=true;
                this.luciMondo = [];
                this.luciMondo.push({ 
                         //luce mondo 1
                        posX: -25,
                        posY: 25,
                        posZ: -5,
                        luceTargetX: -20,
                        luceTargetY:0,
                        luceTargetZ: -5
                 });
                 this.luciMondo.push({ 
                        //luce mondo 2
                        posX: +24,
                        posY: 25,
                        posZ: -15,
                        luceTargetX: 25,
                        luceTargetY:0,
                        luceTargetZ: -25,
                });
                this.luciMondo.push({ 
                        //luce mondo 3
                        posX: 35,
                        posY: 25,
                        posZ: 5,
                        luceTargetX: 30,
                        luceTargetY:0,
                        luceTargetZ: 15,
                });
                this.settings = {
                        // per camera auto
                        cameraX: 5, 
                        cameraY: 5, 
                        cameraZ: 5,
                        // per camera mondo
                        radius: 40,           
                        phi:degToRad(45),             //su-giù
                        theta: degToRad(1),   
                        targetX: 3,
                        targetY:0,
                        targetZ: 2,
                        //luce mondo generale                 

                        projWidth: 1, //2
                        projHeight:1,//2
                        perspective: true,
                        fieldOfView: 60, //120
                        bias: -0.006, //0.006   
                        far: 40,
                        near: 5,
                        shininess: 200
                      };

                
           
        

        }
        setFreeCamera(enable){
                this.freeCamera=enable;
                if(this.freeCamera){
                        //disabilito la camerà dell'auto
                        this.getObjects()[0].callbackCameraAuto=null;
                        //imposto il default per la camera del mondo
                        this.settings.radius=40;
                        this.settings.phi=degToRad(45);  
                        this.settings.theta=degToRad(1); 
                }else{
                        //abilito la camerà dell'auto
                        var callback=function(posAutoX,posAutoY,posAutoZ,orientamento){
                               // console.log(orientamento)
                                const x =10*Math.cos(degToRad(-orientamento+90));
                                const y= 10*Math.sin(degToRad(-orientamento+90));
                                this.settings.cameraX=posAutoX+x;
                                this.settings.cameraY=posAutoY+5;  
                                this.settings.cameraZ=posAutoZ+y; 
                                this.settings.targetX=posAutoX;
                                this.settings.targetY=posAutoY+2;  
                                this.settings.targetZ=posAutoZ; 
                        }
                        callback=callback.bind(this);
                        this.getObjects()[0].callbackCameraAuto=callback;
                }
        }
   
        drawScene(projectionMatrix,cameraMatrix,textureMatrix,lightWorldMatrix,programInfo,specchioMatrix=null) {

        //console.log("lightWorldMatrix",lightWorldMatrix);
              // Make a view matrix from the camera matrix.
              const viewMatrix = m4.inverse(cameraMatrix);
              const gl = this.getGL();
              gl.useProgram(programInfo.program);
  
              // set uniforms that are the same for both the sphere and plane
              // note: any values with no corresponding uniform in the shader
              // are ignored.
              var  u_textureMatrix_m1;//luce mondo 
              var  u_textureMatrix_m2;//luce mondo 
              var  u_textureMatrix_m3;//luce mondo 
              var  u_textureMatrix_1;//luce auto per terra 1
              var  u_textureMatrix_2;//luce auto per terra 2
              var  u_textureMatrix_3;//luce auto faro 1
              var  u_textureMatrix_4;//luce auto faro 2             
              var  u_textureMatrix_5;//luce auto stop 1            
              var  u_textureMatrix_6;//luce auto stop 2
              if(textureMatrix===null){
                u_textureMatrix_m1= m4.identity();                
                u_textureMatrix_m2= m4.identity();                
                u_textureMatrix_m3= m4.identity();    
                u_textureMatrix_1= m4.identity();                
                u_textureMatrix_2= m4.identity();                
                u_textureMatrix_3= m4.identity();                
                u_textureMatrix_4= m4.identity();                              
                u_textureMatrix_5= m4.identity();                
                u_textureMatrix_6= m4.identity();
              }else{
                u_textureMatrix_m1= textureMatrix[0];                   
                u_textureMatrix_m2= textureMatrix[1];                   
                u_textureMatrix_m3= textureMatrix[2];            
                u_textureMatrix_1= textureMatrix[3];                   
                u_textureMatrix_2= textureMatrix[4];                   
                u_textureMatrix_3= textureMatrix[5];                   
                u_textureMatrix_4= textureMatrix[6];                                  
                u_textureMatrix_5= textureMatrix[7];                   
                u_textureMatrix_6= textureMatrix[8];   
              }
              //caso normale ( non specchiato )
              var projectionMatrix_ =projectionMatrix;         
              var inverseRef = true;     
              
              const illuminazioneTemp = (specchioMatrix===null ? this.illuminazione : -this.illuminazione);
              if(specchioMatrix===null){                      
                specchioMatrix = m4.identity();   
                inverseRef=false;
              }
              //la luce dentro lo specchio è più bassa    
              webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix_,
                u_bias: this.settings.bias,
                //luci mondo
                u_textureMatrix_m1: u_textureMatrix_m1,                    
                u_textureMatrix_m2: u_textureMatrix_m2, 
                u_textureMatrix_m3: u_textureMatrix_m3,  
                u_projectedTexture_m1:  this.depthTextures[0],   
                u_projectedTexture_m2:  this.depthTextures[1],  
                u_projectedTexture_m3:  this.depthTextures[2],       
                //luci auto                   
                u_textureMatrix_1: u_textureMatrix_1,                      
                u_textureMatrix_2: u_textureMatrix_2,                            
                u_textureMatrix_3: u_textureMatrix_3,
                u_textureMatrix_4: u_textureMatrix_4,                                         
                u_textureMatrix_5: u_textureMatrix_5,
                u_textureMatrix_6: u_textureMatrix_6,        
                u_projectedTexture_1:  this.depthTextures[3],                
                u_projectedTexture_2:  this.depthTextures[4],                
                u_projectedTexture_3:  this.depthTextures[5],                
                u_projectedTexture_4:  this.depthTextures[6],                              
                u_projectedTexture_5:  this.depthTextures[7],                
                u_projectedTexture_6:  this.depthTextures[8],   
                u_shininess: this.settings.shininess,
                u_innerLimit: Math.cos(degToRad(this.settings.fieldOfView / 2 - 10)),
                u_outerLimit: Math.cos(degToRad(this.settings.fieldOfView / 2)),
                u_lightDirection_m1: lightWorldMatrix[0].slice(8, 11).map(v => -v),//luce mondo 1
                u_lightDirection_m2: lightWorldMatrix[1].slice(8, 11).map(v => -v),//luce mondo 2
                u_lightDirection_m3: lightWorldMatrix[2].slice(8, 11).map(v => -v),//luce mondo 3
                u_lightWorldPosition_m1:[this.luciMondo[0].posX, this.luciMondo[0].posY, this.luciMondo[0].posZ],     //luce mondo 1            
                u_lightWorldPosition_m2:[this.luciMondo[1].posX, this.luciMondo[1].posY, this.luciMondo[1].posZ],   //luce mondo 2             
                u_lightWorldPosition_m3:[this.luciMondo[2].posX, this.luciMondo[2].posY, this.luciMondo[2].posZ], //luce mondo 3
                u_viewWorldPosition: cameraMatrix.slice(12, 15),              
                illuminazione: illuminazioneTemp,            
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
                // first draw from the POV of the light 
                //per ogni luce del mondo ( i fari da campo )
                var lightWorldMatrix = [];
                
                for(var x=0;x<this.luciMondo.length;x++){
                        const posX=this.luciMondo[x].posX;
                        const posY=this.luciMondo[x].posY;
                        const posZ=this.luciMondo[x].posZ;
                        const luceTargetX=this.luciMondo[x].luceTargetX;                        
                        const luceTargetY=this.luciMondo[x].luceTargetY;
                        const luceTargetZ=this.luciMondo[x].luceTargetZ;
                        lightWorldMatrix.push( 
                                m4.lookAt(
                                        [posX, posY, posZ],          // position
                                        [luceTargetX, luceTargetY, luceTargetZ], // target
                                        [0, 1, 0],                                              // up
                                )
                        );
                }

                //vale per tutte le luci del mondo ( i fari da campo )
                const lightProjectionMatrix = this.settings.perspective
                ? m4.perspective(
                        degToRad(this.settings.fieldOfView),
                        this.settings.projWidth / this.settings.projHeight,
                        this.settings.near,  // near
                        this.settings.far)   // far
                : m4.orthographic(
                        -this.settings.projWidth / 2,   // left
                        this.settings.projWidth / 2,   // right
                        -this.settings.projHeight / 2,  // bottom
                        this.settings.projHeight / 2,  // top
                        this.settings.near,                      // near
                        this.settings.far);       

      

                //non calcolo le ombre mentre disegno lo specchio, se no verrebbe resettato
                // il frame attuale al di fuori dello specchio  (dal comando gl.clearColor)
                //dunque avendole già le ombre  (textureMatrix) calcolate in precendeza per disegnare la parte fuori dallo specchio, riuso le stesse
                var textureMatrix=textureMatrixAlredyCalculated;          
                if(specchioMatrix===null){
                        //se invece è la draw fuori dallo specchio non avrò le ombre quindi le calcolo
                        // draw to the depth texture (solo se non è la draw nel mondo dentro lo specchio)
                        OmbreStep2(gl,lightWorldMatrix,lightProjectionMatrix);            
                        textureMatrix =OmbreStep3(lightWorldMatrix,lightProjectionMatrix);                
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
                var eye =[];
                var target=[];
                if(this.freeCamera){
                        const r = this.settings.radius;
                        var p = this.settings.phi;
                        var t = this.settings.theta;
                        eye = [ 
                                r*Math.sin(p)*Math.cos(t), 
                                r*Math.cos(p),                        
                                r*Math.sin(p)*Math.sin(t),
                            ];
                        target = [0, 0, 0];
                }else{                      
                        eye = [ 
                                this.settings.cameraX,
                                this.settings.cameraY,
                                this.settings.cameraZ,
                            ];
                        target = [
                                this.settings.targetX,
                                this.settings.targetY,
                                this.settings.targetZ,
                        ];
                        //console.log("eye",eye);
                }

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
                       
                                                
                        //spazio dello specchio (una faccia piana collocata nella stessa posizione del negozio)
                        // specchioMatrix=m4.translate(specchioMatrix,-10, 0, -20);
                        const planeBufferInfo = primitives.createPlaneBufferInfo(
                        gl,
                        5,  // width
                        3,  // height
                        1,   // subdivisions across
                        1,   // subdivisions down
                        );
                        const viewMatrix = m4.inverse(cameraMatrix);
                        webglUtils.setUniforms(this.stencilProgramInfo, {
                                u_view: viewMatrix,
                                u_projection: projectionMatrix,
                                u_world:m4.xRotate(m4.translation(4, 2.8, 0),degToRad(90))
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
          
                         if(this.frustum){
                                // ------ Draw the frustum ------        
                                this.drawFrustum(cameraMatrix,projectionMatrix);
                          }
                        //calcolo camera specchiata
                     
                        if(this.freeCamera){
                                const r = this.settings.radius;
                                var p = this.settings.phi;
                                var t = this.settings.theta;
                                t+=degToRad(180);
                                var eye = [ 
                                       r*Math.sin(p)*Math.cos(t), 
                                       r*Math.cos(p),                        
                                       r*Math.sin(p)*Math.sin(t),
                                   ];
                                target = [0, 0, 0];
                        }else{                      
                                eye = [ 
                                        -this.settings.cameraX,
                                        this.settings.cameraY,
                                        -this.settings.cameraZ,
                                ];
                                target = [
                                        -this.settings.targetX,
                                        this.settings.targetY,
                                        -this.settings.targetZ,
                                ];
                        }
                      
                        cameraMatrix = m4.lookAt(eye, target, up);
        
        
                         gl.stencilFunc( gl.EQUAL,0x1,0xff);
                         this.realRender(cameraMatrix,projectionMatrix,specchioMatrix,textureMatrix);
                         
                }else{
                        gl.disable( gl.STENCIL_TEST );
                        this.realRender(cameraMatrix,projectionMatrix);                        
                        if(this.frustum){
                                // ------ Draw the frustum ------        
                                this.drawFrustum(cameraMatrix,projectionMatrix);
                        }
                }
            
        


        }
        

        drawFrustum(cameraMatrix,projectionMatrix){
                const gl = this.getGL();
                //------------------------------------------------luci mondo
                for(var x=0;x<this.luciMondo.length;x++){
                        var lightWorldMatrix = m4.lookAt(
                                [this.luciMondo[x].posX, this.luciMondo[x].posY, this.luciMondo[x].posZ],          // position
                                [this.luciMondo[x].luceTargetX, this.luciMondo[x].luceTargetY, this.luciMondo[x].luceTargetZ], // target
                                [0, 1, 0],                                              // up
                        );
        
                        const lightProjectionMatrix = this.settings.perspective
                        ? m4.perspective(
                                degToRad(this.settings.fieldOfView),
                                this.settings.projWidth / this.settings.projHeight,
                                this.settings.near,  // near
                                this.settings.far)   // far
                        : m4.orthographic(
                                -this.settings.projWidth / 2,   // left
                                this.settings.projWidth / 2,   // right
                                -this.settings.projHeight / 2,  // bottom
                                this.settings.projHeight / 2,  // top
                                this.settings.near,                      // near
                                this.settings.far);      
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
                          u_world: mat
                        });                  
                        webglUtils.drawBufferInfo(gl, this.cubeLinesBufferInfo, gl.LINES);
                }
            
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
