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
                this.dr 		= 5.0 * Math.PI/180.0;                
                this.fovy 	= 40.0;  	// Field-of-view in Y direction angle (in degrees)              
                this.mvMatrix;
                this.cameraMatrix;
                this.pMatrix;
                this.modelView;
                this.projection;

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
               gl.viewport( 0, 0, canvasW,canvasH );
               var aspect =  canvasW/canvasH;
               gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
               gl.enable(gl.DEPTH_TEST);
               
                var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
                gl.useProgram( program );

               /* ------------------------------ SETTO I BUFFER ------------------------------------- */
                    //---------------------------------CLEAR BUFFER
                    gl.deleteBuffer(cBuffer);
                    gl.deleteBuffer(vBuffer);
                    gl.deleteBuffer(index_buffer);      
	
                if(this.isDrawArray()){
                        this.getObjects().forEach(element => {  
                                this.setBuffers(program, 
                                        element.colorsArray_drawArrays, 
                                        element.pointsArray_drawArrays,
                                        element.indicesArray);
                        });
                       
                }else{
                        this.getObjects().forEach(element => {
                                this.setBuffers(
                                        program, 
                                        element.colorsArray_drawElements, 
                                        element.pointsArray_drawElements, 
                                        element.indicesArray);
                        });                     
                }
                /* ------------------------------ MATRICI PER LE TRASFORMAZIONI DI VISTA -------------- */
 
                modelView = gl.getUniformLocation( program, "modelView" );
                projection = gl.getUniformLocation( program, "projection" );

                // Tell WebGL how to convert from clip space to pixels
                gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

                var eye = [radius*Math.sin(phi)*Math.cos(theta), 
                        radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi)];
                // Compute the camera's matrix
                var cameraMatrix = m4.lookAt(eye, at, up);
                // Make a view matrix from the camera matrix.
                var mvMatrix = m4.inverse(cameraMatrix);

                // Compute the projection matrix
                var pMatrix = m4.perspective(degToRad(fovy), aspect, near, far);

                gl.uniformMatrix4fv( modelView, false, mvMatrix );
                gl.uniformMatrix4fv( projection, false, pMatrix );
	
                if(this.isDrawArray()){
                        gl.drawArrays( gl.TRIANGLES, 0, pointsArray_drawArrays.length *4 );
                }else{
                        gl.drawElements(gl.TRIANGLES, indicesArray_drawElements.length, gl.UNSIGNED_SHORT, 0);
                }

                if(this.requestAnimationEnabled){
                        window.requestAnimationFrame(this.render);
                }
        }

        
        //funzione per settare i vari buffer da passare alla drawElement e alla drawArray
        setBuffers(program, colors, points, indexes) {
                var ris ={};
                /* ------------------------------  BUFFER COLORI ------------------------------  */
                var gl = this.getGL();
                ris.cBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, ris.cBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW );
                        
                ris.vColor = gl.getAttribLocation( ris.program, "vColor" );
                gl.vertexAttribPointer( ris.vColor, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( ris.vColor);
                
                /* ------------------------------  BUFFER VERTICI ------------------------------  */
                
                ris.vBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, ris.vBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW ); 
                        
                var vPosition = gl.getAttribLocation( program, "vPosition" );
                gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vPosition );

                /* ------------------------------  BUFFER INDICI ------------------------------  */
                
                ris.index_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ris.index_buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
                return ris;	
        }

}
