class WebGLController{

        constructor(canvas,ojbs,draw_array=false){   
                //----------------------------------binds
                this.render= this.render.bind(this);
                this.setBuffers=this.setBuffers.bind(this);
                //--------------------------------------------parametri privati
                var gl = canvas.getContext('webgl');
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
                this.fovy 	= 40.0;  	// Field-of-view in Y direction angle (in degrees)              
           
                this.buffers = [];

                this.requestAnimationEnabled=false;

       

        }

        render(){
               var gl = this.getGL();
               if (!gl) {
                 alert( "WebGL isn't available" );
                 return;
               }   
               var canvasW =this.getCanvasW();
               var canvasH =this.getCanvasH();
               console.log("canvasH",canvasH);
               console.log("canvasW",canvasW);
               gl.viewport( 0, 0, canvasW,canvasH );
               var aspect =  canvasW/canvasH;
               gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
               gl.enable(gl.DEPTH_TEST);
               
                var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
                gl.useProgram( program );

               /* ------------------------------ SETTO I BUFFER ------------------------------------- */
               
               //---------CLEAR BUFFER
               for(var i=0;i<this.buffers.length;i++){
                        gl.deleteBuffer(this.buffers[i]);
               }
               this.buffers=[];    
	
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
                        }                   
                }
                console.log("buffers", this.buffers); //----------------OK
                /* ------------------------------ MATRICI PER LE TRASFORMAZIONI DI VISTA -------------- */
 
                var modelView = gl.getUniformLocation( program, "modelView" );
                var projection = gl.getUniformLocation( program, "projection" );

                // Tell WebGL how to convert from clip space to pixels
                gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

                var eye = [this.radius*Math.sin(this.phi)*Math.cos(this.theta), 
                        this.radius*Math.sin(this.phi)*Math.sin(this.theta), this.radius*Math.cos(this.phi)];
                // Compute the camera's matrix
                var at = [0.0, 0.0, 0.0];
                var up = [0.0, 0.0, 1.0];
                var cameraMatrix = m4.lookAt(eye, at, up);
                // Make a view matrix from the camera matrix.
                var mvMatrix = m4.inverse(cameraMatrix);

                // Compute the projection matrix
                var pMatrix = m4.perspective(degToRad(this.fov), aspect, this.near, this.far);

                gl.uniformMatrix4fv( modelView, false, mvMatrix );
                gl.uniformMatrix4fv( projection, false, pMatrix );
	
                if(this.isDrawArray()){
                        this.getObjects().forEach(element => {
                                gl.drawArrays( gl.TRIANGLES, 0, element.indicesArray.length *4 );
                        });
                      
                }else{
                        console.log("->",this.getObjects()[0].indicesArray.length);
                        gl.drawElements(gl.TRIANGLES, this.getObjects()[0].indicesArray.length, gl.UNSIGNED_SHORT, 0);
                        // this.getObjects().forEach(element => {
                        //         gl.drawElements(gl.TRIANGLES, element.indicesArray.length, gl.UNSIGNED_SHORT, 0);
                        // });
                }

                if(this.requestAnimationEnabled){
                        window.requestAnimationFrame(this.render);
                }
        }

        
        //funzione per settare i vari buffer da passare alla drawElement e alla drawArray
        setBuffers(program, colors, points, indexes) {
                const buffers=[];
                //console.log("points",points); //ok
                //console.log("colors",colors); //ok
                //console.log("indexes",indexes); //ok
                /* ------------------------------  BUFFER COLORI ------------------------------  */
                var gl = this.getGL();
                const cBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW );
                buffers.push(cBuffer);       
                
                const vColor = gl.getAttribLocation( program, "vColor" );
                gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vColor);
                buffers.push(vColor);  
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
