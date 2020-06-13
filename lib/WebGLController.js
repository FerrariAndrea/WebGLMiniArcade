class WebGLController{

        constructor(canvas){   
                //----------------------------------binds
                this.render= this.render.bind(this);

                //--------------------------------------------parametri privati
                var gl = canvas.getContext('webgl');
                this.getGL=function(){
                        return gl;
                }             
                //------------------------------------------parametri pubblici
                this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                this.zmin = 1;
                this.zmax = 100;
                this.fov = 40;                
                this.phi=degToRad(30);
                this.theta=degToRad(50);
                this.D = 7;
                this.target = [0, 0, 0];
                this.up = [0, 1, 0];
                this.mo_matrix;
                
                this.requestAnimationEnabled=false;

       

        }

        render(){
                //set projection matrix
                var proj_matrix = m4.perspective(degToRad(this.fov), this.aspect, this.zmin, this.zmax);
                //set view matrix
                var camera = [this.D*Math.sin(this.phi)*Math.cos(this.theta),
                        this.D*Math.sin(this.phi)*Math.sin(this.theta),
                                this.D*Math.cos(this.phi)];
                var view_matrix = m4.inverse(m4.lookAt(camera, this.target, this.up));        
                gl.enable(gl.DEPTH_TEST);
                // gl.depthFunc(gl.LEQUAL); 
                gl.clearColor(1.0, 1.0, 1.0, 1); 
                /*to manage text on canvas and webgl */
                // Clear the 2D canvas
                //to manage text on canvas and webgl
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                gl.clearDepth(1.0);
                gl.viewport(0.0, 0.0, canvas.width, canvas.height); 
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix); 
                gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
                //set model matrix to I4
                mo_matrix=m4.identity(); 
                gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);

              
                mo_matrix=m4.scale(mo_matrix,0.5,0.5,0.5);
                drawFloor(); // disegna il suolo
                CarRender();

                //to manage text on canvas and webgl
                ctx.font = '18pt Calibri';
                ctx.fillStyle = 'green'; 
                ctx.fillText('Welcome to CAR Project', 90, 50);
                if(this.requestAnimationEnabled){
                        window.requestAnimationFrame(this.render);
                }
        }

        

}
