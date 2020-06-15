class WebGLController{

        constructor(canvas,ojbs,debug=false,draw_array=false){   
                //----------------------------------binds
                this.render= this.render.bind(this);
                this.setBuffers=this.setBuffers.bind(this);
                this.update=this.update.bind(this);
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
                }
             
                this.getGL=function(){
                        return gl;
                }             
                this.isDrawArray=function(){
                        return draw_array;
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
        
                //------------------------------------------parametri pubblici
                // this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                // this.zmin = 1;
                // this.zmax = 100;
                // this.fov = 40;                
                // this.phi=degToRad(30);
                // this.theta=degToRad(50);
                // this.D = 7;
                // this.target = [0, 0, 0];
                // this.up = [0, 1, 0];
                // this.mo_matrix;
                
                this.near 	= 1.0;
                this.far 	= 100.0;
                this.radius 	= 5.0;
                this.theta  	= 20.0;
                this.phi    	= 20.0;
                this.dr 	= 5.0 * Math.PI/180.0;                
                this.fov 	= 40.0;  	// Field-of-view in Y direction angle (in degrees)              
           
                this.buffers = [];
                
                this.FPS=30;
                this.lastFrameTime;
                this.requestAnimationEnabled=false;

       

        }

        render(){
               const gl = this.getGL();
               if (!gl) {
                 alert( "WebGL isn't available" );
                 return;
               }   
               var canvasW =this.getCanvasW();
               var canvasH =this.getCanvasH();
        //        console.log("canvasH",canvasH);
        //        console.log("canvasW",canvasW);
               gl.viewport( 0, 0, canvasW,canvasH );
               var aspect =  canvasW/canvasH;
               gl.clearColor( 1.0, 0.0, 1.0, 1.0 );
               gl.enable(gl.DEPTH_TEST);
               
                var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
                gl.useProgram( program );

              
               //---------CLEAR BUFFER
               for(var i=0;i<this.buffers.length;i++){
                        gl.deleteBuffer(this.buffers[i]);
               }
               this.buffers=[];    
	
                
                //console.log("buffers", this.buffers); //----------------OK
                /* ------------------------------ MATRICI PER LE TRASFORMAZIONI DI VISTA -------------- */
 
                var modelView = gl.getUniformLocation( program, "modelView" );
                var projection = gl.getUniformLocation( program, "projection" );                 
                var mMatrix = gl.getUniformLocation(program, "Mmatrix");//----------------TEST

                // Tell WebGL how to convert from clip space to pixels
                gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

                var eye = [
                        this.radius*Math.sin(this.phi)*Math.cos(this.theta), 
                        this.radius*Math.sin(this.phi)*Math.sin(this.theta),
                        this.radius*Math.cos(this.phi)
                        ];
                // Compute the camera's matrix
                var at = [0.0, 0.0, 0.0];
                var up = [0.0, 0.0, 1.0];
                var cameraMatrix = m4.lookAt(eye, at, up);
                //console.log("cameraMatrix",cameraMatrix); //ok
                // Make a view matrix from the camera matrix.
                var mvMatrix = m4.inverse(cameraMatrix);

                // Compute the projection matrix
                var pMatrix = m4.perspective(degToRad(this.fov), aspect, this.near, this.far);
               
                gl.uniformMatrix4fv( modelView, false, mvMatrix );
                gl.uniformMatrix4fv( projection, false, pMatrix );                
               
                
                 /* ------------------------------ BUFFER AND DRAW------------------------------------- */
               
                if(this.isDrawArray()){
                        const temp = this.getObjects();
                        for(var i =0;i<temp.length;i++){
                                this.buffers=this.buffers.concat(
                                        this.setBuffers(program, 
                                        temp[i].colorsArray_drawArrays, 
                                        temp[i].pointsArray_drawArrays,
                                        temp[i].indicesArray
                                       )
                                       );
                                //transformzioni geometriche
                                gl.uniformMatrix4fv(mMatrix, false, temp[i].mMatrix);
                                //draw
                                gl.drawArrays( gl.TRIANGLES, 0, temp[i].indicesArray.length *4 );
                        }
                      
                }else{
                        const temp = this.getObjects();                   
                        for(var i =0;i<temp.length;i++){
                                const tempBuffers =  this.setBuffers(
                                        program, 
                                        temp[i].colorsArray_drawElements, 
                                        temp[i].pointsArray_drawElements, 
                                        temp[i].indicesArray
                                        );                               
                                this.buffers=this.buffers.concat(tempBuffers);
                                //transformzioni geometriche
                                gl.uniformMatrix4fv(mMatrix, false, temp[i].mMatrix);
                                //draw
                                gl.drawElements(gl.TRIANGLES, temp[i].indicesArray.length, gl.UNSIGNED_SHORT, 0);
                        }  
                }

                if(this.requestAnimationEnabled){
                        window.requestAnimationFrame(this.update); 
                }
        }

        update(time){
                const FRAME_MIN_TIME = (1000/60) * (60 / this.FPS) - (1000/60) * 0.5;
                //console.log(FRAME_MIN_TIME)
                if(time-this.lastFrameTime < FRAME_MIN_TIME){ //skip the frame if the call is too early
                        //CarDoStep();
                        window.requestAnimationFrame(this.update);
                        //console.log("skipped");
                        return; // return as there is nothing to do
                }
                this.lastFrameTime = time; // remember the time of the rendered frame
                // render the frame
                //console.log("not skipped");
                this.render();
                window.requestAnimationFrame(this.update); // get next frame
        }
        //funzione per settare i vari buffer da passare alla drawElement e alla drawArray
        setBuffers(program, colors, points, indexes) {
                const buffers=[];
                //console.log("program",program);
                //console.log("points",points); //ok
                //console.log("colors",colors); //ok
                //console.log("indexes",indexes); //ok
                /* ------------------------------  BUFFER COLORI ------------------------------  */
                const gl = this.getGL();
                const cBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW );
                buffers.push(cBuffer);       
                
                const vColor = gl.getAttribLocation( program, "vColor" );
                gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vColor);
                //buffers.push(vColor);  
                /* ------------------------------  BUFFER VERTICI ------------------------------  */
                
                const vBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW ); 
                buffers.push(vBuffer);       
                
                const vPosition = gl.getAttribLocation( program, "vPosition" );
                gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vPosition );

                /* ------------------------------  BUFFER INDICI ------------------------------  */
                
                const index_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

                buffers.push(index_buffer);
                //console.log("buffers_",buffers); //-----OK
                return buffers;	
        }

}
