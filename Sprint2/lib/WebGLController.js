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

               // Tell WebGL how to convert from clip space to pixels                
               gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

                // Turn on culling. By default backfacing triangles
                // will be culled.
                //gl.enable(gl.CULL_FACE);

               // Enable the depth buffer
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
 
                // var modelView = gl.getUniformLocation( program, "modelView" ); //DEPRECATO
                // var projection = gl.getUniformLocation( program, "projection" ); //DEPRECATO
                var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
                
                var projectionMatrix = m4.perspective(degToRad(this.fov), aspect, this.near, this.far);
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
                var viewMatrix = m4.inverse(cameraMatrix);
                var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    
                
                var mMatrix = gl.getUniformLocation(program, "Mmatrix");
                var lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");//----------------TEST
                var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
                // set the camera/view position
                gl.uniform3fv(viewWorldPositionLocation, eye);
                var worldLocation = gl.getUniformLocation(program, "u_world");
               
                
                var shininessLocation = gl.getUniformLocation(program, "u_shininess");
                // set the shininess
                var shininess = 150;
                gl.uniform1f(shininessLocation, shininess);
                
                var fRotationRadians = 0;
                var worldMatrix = m4.yRotation(fRotationRadians);                
                var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
                var worldInverseMatrix = m4.inverse(worldMatrix);
            
                var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);
                var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
                gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);        
                gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
                gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

                // set the light position
                gl.uniform3fv(lightWorldPositionLocation, [200, 300, 600]);

               

             

                // // Compute the projection matrix //DEPRECATO
                // var pMatrix = m4.perspective(degToRad(this.fov), aspect, this.near, this.far);
               
                //gl.uniformMatrix4fv( modelView, false, mvMatrix );
                //gl.uniformMatrix4fv( projection, false, pMatrix );    //DEPRECATO             
               
                
                 /* ------------------------------ BUFFER AND DRAW------------------------------------- */
               
                if(this.isDrawArray()){
                        const temp = this.getObjects();
                        for(var i =0;i<temp.length;i++){
                                this.buffers=this.buffers.concat(
                                        this.setBuffers(program, 
                                        temp[i].colorsArray_drawArrays, 
                                        temp[i].pointsArray_drawArrays,
                                        temp[i].indicesArray,
                                        temp[i].normals
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
                                        temp[i].indicesArray,
                                        temp[i].normals
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
        setBuffers(program, colors, points, indexes,normals=null) {
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

                if(normals!==null){
                        const normalLocation = gl.getAttribLocation(program, "a_normal");
                        // Turn on the normal attribute
                        gl.enableVertexAttribArray(normalLocation);
                        // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
                        var size = 3;          // 3 components per iteration
                        var type = gl.FLOAT;   // the data is 32bit floating point values
                        var normalize = false; // normalize the data (convert from 0-255 to 0-1)
                        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                        var offset = 0;        // start at the beginning of the buffer
                        gl.vertexAttribPointer( normalLocation, size, type, normalize, stride, offset);
        
                         /*------------------- BUFFER NORMALI ----------------- */
                        // Create a buffer to put normals in
                        var normalBuffer = gl.createBuffer();
                        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
                        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                        // Put normals data into buffer
                        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);                       
                }
             
                
                //----------------------------------------------------------
                buffers.push(index_buffer);
                //console.log("buffers_",buffers); //-----OK
                return buffers;	
        }

}
