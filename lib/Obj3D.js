
//----------------utility


function exstrapolateArrays(model){
    var ris ={};

    // chiusura.points=arr.vertices;
    // chiusura.texcoord=arr.texcoords;
    // chiusura.normals=arr.normals;
    // chiusura.indexes=arr.indices;
    ris.normals=[];
    ris.indices=[];
    ris.vertices=[];
    ris.texcoords=[];
    //model.normals
    //model.vertices
    var normali = [];
    for(var i=0;i<model.normals.length;i+=3){
        normali.push([
            model.normals[i],
            model.normals[i+1],
            model.normals[i+2]
        ]);
    }
    var vertici = [];
    for(var i=0;i<model.vertices.length;i+=3){
        vertici.push([
            model.vertices[i],
            model.vertices[i+1],
            model.vertices[i+2]
        ]);
    }  
    var textc = [];
    for(var i=0;i<model.texcoords.length;i+=2){
        textc.push([
            model.texcoords[i],
            model.texcoords[i+1]
        ]);
    }
    for(var i=0;i<model.triangles.length;i++){
        const actualT = model.triangles[i];
        
        //prima normale x,y,z
        ris.normals.push(normali[actualT.nindices[0]][0]); 
        ris.normals.push(normali[actualT.nindices[0]][1]);
        ris.normals.push(normali[actualT.nindices[0]][2]);
        //seconda normale x,y,z
        ris.normals.push(normali[actualT.nindices[1]][0]); 
        ris.normals.push(normali[actualT.nindices[1]][1]);
        ris.normals.push(normali[actualT.nindices[1]][2]);
        //terza normale x,y,z
        ris.normals.push(normali[actualT.nindices[2]][0]); 
        ris.normals.push(normali[actualT.nindices[2]][1]);
        ris.normals.push(normali[actualT.nindices[2]][2]);

        //vertici        
        ris.vertices.push(vertici[actualT.vindices[0]][0]);
        ris.vertices.push(vertici[actualT.vindices[0]][1]);
        ris.vertices.push(vertici[actualT.vindices[0]][2]);
        
        ris.vertices.push(vertici[actualT.vindices[1]][0]);
        ris.vertices.push(vertici[actualT.vindices[1]][1]);
        ris.vertices.push(vertici[actualT.vindices[1]][2]);
                
        ris.vertices.push(vertici[actualT.vindices[2]][0]);
        ris.vertices.push(vertici[actualT.vindices[2]][1]);
        ris.vertices.push(vertici[actualT.vindices[2]][2]);

        if(textc.length>0){
                //texture        
                ris.texcoords.push(textc[actualT.tindices[0]][0]);
                ris.texcoords.push(textc[actualT.tindices[0]][1]);
                
                ris.texcoords.push(textc[actualT.tindices[1]][0]);
                ris.texcoords.push(textc[actualT.tindices[1]][1]);

                ris.texcoords.push(textc[actualT.tindices[2]][0]);
                ris.texcoords.push(textc[actualT.tindices[2]][1]);
        }
  

        //indici dei 3 vertici
        ris.indices.push(i*3);
        ris.indices.push(i*3+1);        
        ris.indices.push(i*3+2);

    }
    // console.log( 1024*ris.texcoords[0]+ " "+ 1024*ris.texcoords[1]);
    // console.log( 1024*ris.texcoords[2]+ " "+ 1024*ris.texcoords[3]);
    // console.log( 1024*ris.texcoords[4]+ " "+ 1024*ris.texcoords[5]);
     console.log("ris",ris);
    
    return ris;
}

function create3D(positions,texcoords,normals,indices,colors=null) {
    
    const numVerts = indices.length / 3;
    //console.log("numVerts",numVerts);
    // var c=colors;
    // if(c===null){
    //         var temp =[];           
    //         for(var x=0;x<numVerts;x++){
    //             temp.push(1);
    //             temp.push(1);
    //             temp.push(1);
    //         }
    //         c= expandRLEData(temp, [255]);
    //         //console.log("c",c);
    // }
    
  
    const arrays = {
      position: webglUtils.createAugmentedTypedArray(3, positions.length),
      texcoord: webglUtils.createAugmentedTypedArray(2,  texcoords.length/2),
      normal: webglUtils.createAugmentedTypedArray(3, numVerts*3),
      color: webglUtils.createAugmentedTypedArray(4, numVerts, Uint8Array),
      indices: webglUtils.createAugmentedTypedArray(3, numVerts , Uint16Array),
    };

    arrays.position.push(positions);
    if(texcoords!==null && texcoords!==undefined){
        arrays.texcoord.push(texcoords);
    }else{
        console.log("Warning texcoords not defined.");
    }
    //console.log("normals",normals);
    arrays.normal.push(normals);
    //console.log("arrays.normal",arrays.normal.numElements) //ok
    if(colors!==null){
     arrays.color.push(colors);        
    }
    arrays.indices=indices;
    // for (let ii = 0; ii < indices.length; ++ii) {
    //   arrays.indices.push(indices);
    // }

    return arrays;
  }

class Obj3D{

    constructor(file,isQuad=false,texturePath=null){
        //-----------------------------------------------binds
        this.changeColor=this.changeColor.bind(this);       
        this.translate=this.translate.bind(this);
        this.rotate=this.rotate.bind(this);
        this.scale=this.scale.bind(this);
        this.getBufferInfo=this.getBufferInfo.bind(this);
        this.getUniforms=this.getUniforms.bind(this);    
        this.createTexture=this.createTexture.bind(this);
        this.deleteTexture=this.deleteTexture.bind(this);
        var ready=false;
        this.isReady=function(){
              return ready;
        }
        this.setReady=function(){
            ready=true;
        }
        this.isQuadFaceType=function(){
            return isQuad;
        }
        //----------------------------------------------------------------
        this.mesh = new subd_mesh();   
        this.mMatrix =m4.identity();//per le trasformazioni geometriche
        this.indexes=[];
        this.points=[];
        this.normals=[];
        this.color=[1,0,1,1]
        this.texture=null;
        this.textureW= 0;
        this.textureH= 0;     
        this.textureArray = [];
        this.image=null;
        this.texcoord =[];
        this.ambient=1;
        this.diffuse =1;
        this.shininess=180;
        this.bufferArrays = null;
        //------------------------------- LETTURA FILE OBJ      
    
        /* ---------- ESTRAGGO DATI DA NUOVO .OBJ CARICATO ----------- */    
        //const reader = new FileReader();
        var chiusura =this;    
        const chiusuraTexturePath=texturePath;  
        var onload = function(response){
            //console.log("---------onload");
            //const response = event.target.result;
            
           //chiusura.texcoord=readTextCoord(response);
           chiusura.mesh = ReadOBJ(response,chiusura.mesh);		//ReadOBJ -> glm_light.js
           //chiusura.texcoord=  chiusura.mesh.model.texcoords;
           // console.log("model",chiusura.mesh.model);
           //leggo i parametri di ambiente per la luce
           if(chiusura.mesh.model.material.ambient!==undefined){
            chiusura.ambient=chiusura.mesh.model.material.ambient;            
           }
           if(chiusura.mesh.model.material.shininess!==undefined){
            chiusura.shininess=chiusura.mesh.model.material.shininess;            
           }
           if(chiusura.mesh.model.material.diffuse!==undefined){
            chiusura.diffuse=chiusura.mesh.model.material.diffuse;            
           }

            const arr = exstrapolateArrays(chiusura.mesh.model);
            //console.log("arr",arr)
            chiusura.points=arr.vertices;
            chiusura.texcoord=arr.texcoords;
            chiusura.normals=arr.normals;
            chiusura.indexes=arr.indices;

            
            // chiusura.mesh = ReadOBJ(response,chiusura.mesh);		//ReadOBJ -> glm_light.js
         
           if(chiusuraTexturePath!==null){
            const iMready=function(bin){
                //leggo l'intestazione della bitmap
                // const intestazione1 =  [];
                // const intestazione2 =[];
                // intestazione1.push(bin[18]);
                // intestazione1.push(bin[19]);
                // intestazione1.push(bin[20]);
                // intestazione1.push(bin[21]);

                // intestazione2.push(bin[22]);
                // intestazione2.push(bin[23]);
                // intestazione2.push(bin[24]);
                // intestazione2.push(bin[25]);
                // var w = byteArrayToInt(bin,18);// readInt(intestazione1);
                // var h = byteArrayToInt(bin,22);// readInt(intestazione2);

                // var ris = [];
                // for(var i=55;i<bin.length;i++){
                //         ris.push(bin[i]);
                // }
                
                // chiusura.textureArray=new Uint8Array(ris);
             
                // chiusura.textureW= w;
                // chiusura.textureH= h;   
                    
              
            }
            chiusura.image = new Image();
            chiusura.image.src = chiusuraTexturePath;
            chiusura.image.addEventListener('load', function() {
                chiusura.setReady();
            });
            //loadBin(chiusuraTexturePath,iMready);
           }else{
                chiusura.setReady();
           }
          

        }          
        loadFile(file,onload);
     
    }

    //chiamabile in ogni momenti per cambiare la posizione
    translate(x,y,z){
        this.mMatrix=m4.translate(this.mMatrix,x,y,z); 
    }
    
    createTexture(gl){
 
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
//LUMINANCE
        // gl.texImage2D(
        //     gl.TEXTURE_2D,
        //     0,                // mip level
        //     gl.RGBA,     // internal format
        //     this.textureW,                // width
        //     this.textureH,                // height
        //     0,                // border
        //     gl.LUMINANCE,     // format
        //     gl.UNSIGNED_BYTE, // type
        //     this.textureArray);
 
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, this.image);
      
        //The texture is a non-power-of-two texture.
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);

    }
    deleteTexture(gl){
        gl.deleteTexture(this.texture);
    }
    //chiamabile in ogni momenti per la rotazione
    rotate(grad,x_y_z="x"){
        if(x_y_z==="x"){
            this.mMatrix=m4.xRotate(this.mMatrix, degToRad(grad));
        }else if(x_y_z==="y"){
            this.mMatrix=m4.yRotate(this.mMatrix, degToRad(grad));
        }else{
            this.mMatrix=m4.zRotate(this.mMatrix, degToRad(grad));
        }
    }

    //chiamabile in ogni momenti per scalare
    scale(sx, sy, sz,){
        this.mMatrix=m4.scale(this.mMatrix,sx, sy, sz);         
    }

    //chiamabile in ogni momenti per cambiare la posizione
    translate(x,y,z){
        this.mMatrix=m4.translate(this.mMatrix,x,y,z); 
    }
    //chiamabile in ogni momenti per cambiare il colore
    changeColor(c=[0.0, 1.0, 1.0]){
        this.color=c;
    }

    getUniforms(){
        return {
            u_colorMult: this.color,  
            u_color:  [1,1,1, 1],
            u_texture: this.texture,
            u_world: this.mMatrix
          };
    }
    getBufferInfo(gl){

    
    // return   primitives.createCubeBufferInfo(
    //     gl,
    //     2,  // size
    // );


        // return primitives.createSphereBufferInfo(
        //     gl,
        //     1,  // radius
        //     32, // subdivisions around
        //     24, // subdivisions down
        // );
        
       // 
        
       //return webglUtils.createBufferInfoFromArrays(gl,create3D(this.points, this.texcoord,this.normals,this.indexes));
        if(this.bufferArrays===null){
            //non ha senso ricostruire gli array da capo tutte el volte
            this.bufferArrays= webglUtils.createBufferInfoFromArrays(gl,create3D(this.points, this.texcoord,this.normals,this.indexes));
            // console.log("ss",primitives.createCubeVertices(2));
            // console.log("ss1",create3D(this.points, this.texcoord,this.normals,this.indexes));
        }
    //     var temp = primitives.createCubeVertices(2);
    //    return webglUtils.createBufferInfoFromArrays(gl,temp);
        return this.bufferArrays;
     
    }





}
