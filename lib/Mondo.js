
class Mondo{
    constructor(){
        this.draw =this.draw.bind(this);
        this.isReady=function(){
            //non deve caricare nessun file, quindi è già pronto
            return true;
        }
        this.bufferArrays=null;
     
        this.sizeMondo = 60;
        this.color=[0,0,1,1];


    }

    draw(gl,programInfo,inverseRef){

        if(this.uniforms===undefined ||    this.bufferInfo ===undefined){
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
            this.terrenoUniforms = {
                u_colorMult: [0, 1.0, 0.0, 1],  
                u_color: [0, 0,0, 1],
                u_texture: this.checkerboardTexture,
                u_world:  m4.identity(),                        
                texture_enable: 1.0 //aggiunta da me
            };

            //i lati sono definiti in senzo anti orario 0,1,2,3
            this.latoUniforms_0 = {
                u_colorMult: [0, 0.0, 1.0, 1],  
                u_color: [0, 0,0, 1],
                u_texture: this.checkerboardTexture,
                u_world:m4.xRotate(m4.translation(0,this.sizeMondo/2,-this.sizeMondo/2),degToRad(90)),                        
                texture_enable: 1.0 //aggiunta da me
            };

            this.latoUniforms_1 = {
                u_colorMult: [0.2, 0.2, 1.0, 1],  
                u_color: [0, 0,0, 1],
                u_texture: this.checkerboardTexture,
                u_world: m4.zRotate(m4.translation(-this.sizeMondo/2,this.sizeMondo/2,0),degToRad(-90)),                        
                texture_enable: 1.0 //aggiunta da me
            };

            this.latoUniforms_2 = {
                u_colorMult: [0.4, 0.4, 1.0, 1],  
                u_color: [0, 0,0, 1],
                u_texture: this.checkerboardTexture,
                u_world: m4.xRotate(m4.translation(0,this.sizeMondo/2,this.sizeMondo/2),degToRad(-90)),                       
                texture_enable: 1.0 //aggiunta da me
            };

           this.latoUniforms_3 = {
                u_colorMult: [0.6, 0.6, 1.0, 1],  
                u_color: [0, 0,0, 1],
                u_texture: this.checkerboardTexture,
                u_world:  m4.zRotate(m4.translation(this.sizeMondo/2,this.sizeMondo/2,0),degToRad(90)),                                  
                texture_enable: 1.0 //aggiunta da me
            };

            
           this.cieloUniforms= {
                u_colorMult: [1, 0, 0, 1],  
                u_color: [0, 0,0, 1],
                u_texture: this.checkerboardTexture,
                u_world:  m4.yRotate(m4.translation(0,this.sizeMondo,0),degToRad(-180)),                                  
                texture_enable: 1.0 //aggiunta da me
            };

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