

class Specchio{
        constructor(gl){
            // this.init=this.init.bind(this);
            this.render=this.render.bind(this);
                  
            this.vertices =[ 
                0.0,0.0,0.0,
                2.0,0.0,0.0,
                0.0,0.0,2.0,

                2.0,0.0,0.0,
                0.0,0.0,2.0,
                2.0,0.0,2.0
                ]; 
            this.indices =[0,1,2,3,4,5];	

            this.normals=[
                0.0,1.0,0.0,
                0.0,1.0,0.0,
                0.0,1.0,0.0,

                0.0,1.0,0.0,
                0.0,1.0,0.0,
                0.0,1.0,0.0
            ];

            // this.vertices=[
            //     -1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1, -1,-1,1, 1,-1,1, 1,1,1, -1,1,1, -1,-1,-1, -1,1,-1, -1, 1,1, -1,-1,1,
            //     1,-1,-1, 1,1,-1, 1,1,1, 1,-1,1, -1,-1,-1, -1,-1,1, 1,-1,1, 1,-1,-1, -1,1,-1, -1,1,1, 1,1,1, 1,1,-1,];
           
    
            // this.indices = [
            //     0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23 ];

            this.buffer_linked = false;
            this.program = webglUtils.createProgramFromScripts(gl, ["stencil-vertex-shader", "stencil-fragment-shader"]);
        }

        // init(gl){
      
        
        //     if(this.buffer_linked)
        //     {
        //         gl.deleteBuffer(this.vBuffer);
        //         gl.deleteBuffer(this.index_buffer);
        //     }
   
            
        //     /* ------------------------------  BUFFER VERTICI ------------------------------  */
            
        //     this.vBuffer = gl.createBuffer();
        //     gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer  );
        //     gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW ); 
            
        //     const vPosition = gl.getAttribLocation( program, "vPosition" );
        //     gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
        //     gl.enableVertexAttribArray( vPosition );
        
        //     /* ------------------------------  BUFFER INDICI ------------------------------  */
            
        //     this.index_buffer = gl.createBuffer();
        //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        //     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);	
        
        //     this.buffer_linked=true;
            
        //     this.modelView = gl.getUniformLocation( program, "modelView" );
        //     this.projection = gl.getUniformLocation( program, "projection" );
            
        // }
        
        render(gl,cameraMatrix,pMatrix,settings){
            //   // Tell WebGL how to convert from clip space to pixels
            //   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
            //   gl.enable(gl.CULL_FACE);
            //   gl.enable(gl.DEPTH_TEST);
            //  // Make a view matrix from the camera matrix.
            //   var mvMatrix = m4.inverse(cameraMatrix) ;
          
            // //   // Compute the projection matrix
            // //   var pMatrix = m4.perspective(degToRad(fovy), aspect, near, far);
        
            // // var view_matrix=[1,0,0,0,
            // //     0,1,0,0,
            // //     0,0,1,0,
            // //     0,0,0,1];
             
            //   gl.uniformMatrix4fv(  this.modelView, false, mvMatrix );
            //   gl.uniformMatrix4fv(  this.projection, false, pMatrix );
              
           
            // //   gl.enable(gl.DEPTH_TEST);
            // //   // gl.depthFunc(gl.LEQUAL); 
            // //   gl.clearColor(0.75, 1.0, 0.75, 1); 
            // //   gl.clearDepth(1.0);
            // //   gl.viewport(0.0, 0.0, 1000,1000); 
            // //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

            // gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0); 
            // //gl.drawArrays( gl.TRIANGLES, 0, this.indices.length/3 );

    
         
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            const viewMatrix = m4.inverse(cameraMatrix);
            gl.useProgram( this.program );
            webglUtils.setUniforms(this.program, {
                modelView: viewMatrix,
                projection: pMatrix
            });


            // const planeUniforms = {
            //     u_colorMult: c,  // lightblue
            //     u_color: [0, 0,0, 1],
            //     u_texture: this.checkerboardTexture,
            //     u_world:u_word,                        
            //     texture_enable: 1.0 //aggiunta da me
            //   };
            const planeBufferInfo = primitives.createPlaneBufferInfo(
            gl,
            20,  // width
            20,  // height
            1,   // subdivisions across
            1,   // subdivisions down
            );

            webglUtils.setBuffersAndAttributes(gl, this.program, planeBufferInfo);
           // webglUtils.setUniforms(this.program, uniforms);
            webglUtils.drawBufferInfo(gl, planeBufferInfo);
        }
}