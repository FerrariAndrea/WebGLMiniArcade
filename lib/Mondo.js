

class Mondo{
    constructor(texture_images=[]){
        this.draw =this.draw.bind(this);
        this.createTexture = this.createTexture.bind(this);        
        this.deleteTexture = this.deleteTexture.bind(this);            
        this.isReady = this.isReady.bind(this);            
        this.setReady = this.setReady.bind(this);
        this.ready=false;
      
        this.bufferArrays=null;
     
        this.sizeMondo = 100;
        this.images =[];
        this.textures=[];
        for(var x=0;x<texture_images.length;x++){
            this.images[x] = new Image();
            this.images[x].src = texture_images[x];
            var ready=this.setReady;
            this.images[x].addEventListener('load', function() {
                ready();
            });
        }
        if(texture_images.length<1){
            this.setReady();
        }
       

    }
    isReady(){
        return this.ready;
    }
    setReady(){
        this.ready=true;
    }
    createTexture(gl){
        if(this.images.length>0){
            for(var x=0;x<this.images.length;x++){
                this.textures[x] = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.textures[x]);     
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, this.images[x]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
        
        }
    }
    deleteTexture(gl){
        if(this.image!==null){       
            for(var x=0;x<this.images.length;x++){
                
                 gl.deleteTexture(this.textures[x]);
            }     
        }
    }

    draw(gl,programInfo,inverseRef){

        if(this.terrenoUniforms===undefined ){
            // make a 8x8 checkerboard texture
          
            this.terrenoUniforms = {
                u_colorMult:[1.0, 1.0, 1.0, 1],
                u_color: [0, 0,0, 1],
                u_texture: this.textures[0],
                u_world: m4.identity(),                        
                texture_enable: 1.0 //aggiunta da me
            };

            //i lati sono definiti in senzo anti orario 0,1,2,3
            this.latoUniforms_0 = {
                u_colorMult:[1.0, 1.0, 1.0, 1],
                u_color: [0, 0,0, 1],
                u_texture: this.textures[1],
                u_world:m4.xRotate(m4.translation(0,this.sizeMondo/2,-this.sizeMondo/2),degToRad(90)),                        
                texture_enable: 1.0 //aggiunta da me
            };

            this.latoUniforms_1 = {
                u_colorMult:[1.0, 1.0, 1.0, 1],
                u_color: [0, 0,0, 1],
                u_texture: this.textures[2],
                u_world: m4.zRotate(m4.translation(-this.sizeMondo/2,this.sizeMondo/2,0),degToRad(-90)),                        
                texture_enable: 1.0 //aggiunta da me
            };

            this.latoUniforms_2 = {
                u_colorMult:[1.0, 1.0, 1.0, 1],
                u_color: [0, 0,0, 1],
                u_texture: this.textures[3],
                u_world: m4.xRotate(m4.translation(0,this.sizeMondo/2,this.sizeMondo/2),degToRad(-90)),                       
                texture_enable: 1.0 //aggiunta da me
            };

           this.latoUniforms_3 = {
                u_colorMult:[1.0, 1.0, 1.0, 1],
                u_color: [0, 0,0, 1],
                u_texture: this.textures[4],
                u_world:  m4.zRotate(m4.translation(this.sizeMondo/2,this.sizeMondo/2,0),degToRad(90)),                                  
                texture_enable: 1.0 //aggiunta da me
            };

            
           this.cieloUniforms= {
                u_colorMult:[1.0, 1.0, 1.0, 1],
                u_color: [0, 0,0, 1],
                u_texture: this.textures[5],
                u_world:  m4.yRotate(m4.translation(0,this.sizeMondo,0),degToRad(-180)),                                  
                texture_enable: 1.0 //aggiunta da me
            };

            //--------------------------
         

            //non riuscendo in poco tempo a capire come sovrascrivere le coordinate delle textur di planeVertices_terreno
            //ho deciso di creare una textur per ogni faccia del cubo invece di usare la stessa cambiando le coordinate

            // planeVertices_terreno.texcoords= webglUtils.createAugmentedTypedArray(2, numVert),
            // planeVertices_terreno.texcoords.push([
            //     0,0,
            //     0,0.33,
            //     0.33,0,
            //     0.33,0,
            //     0.33,0.33,
            //     0,0.33
            // ]);

            this.bufferInfo = primitives.createPlaneBufferInfo(
                gl,
                this.sizeMondo,  // width
                this.sizeMondo,  // height
                1,   // subdivisions across
                1,   // subdivisions down
                ); 
        }
   

        //draw terreno
        webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
        webglUtils.setUniforms(programInfo, this.terrenoUniforms);
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
        //draw lato 0
        webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
        webglUtils.setUniforms(programInfo, this.latoUniforms_0);
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
        //draw lato 1
        webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
        webglUtils.setUniforms(programInfo, this.latoUniforms_1);
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
        //draw lato 2
        webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
        webglUtils.setUniforms(programInfo, this.latoUniforms_2);
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
        //draw lato 3
        webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
        webglUtils.setUniforms(programInfo, this.latoUniforms_3);
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
        //draw cielo
        webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
        webglUtils.setUniforms(programInfo, this.cieloUniforms);
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
    }

   

}