
//----------------utility

function exstrapolateArrays(model){
    var ris ={};
    ris.indices=[];
    ris.texcoords=[];
    ris.normals=[];
    ris.vertices = model.vertices; //i vertici sono già ok
    //------------------------estraggo le normali e per comodità le ragruppo in (x,y,z)
    var tempNormal=[];
    if(model.normals!==null){
        for(var i=0;i<model.normals.length;i+=3){
            var temp = [];
            temp.push(model.normals[i]);
            temp.push(model.normals[i+1]);
            temp.push(model.normals[i+2]);
            tempNormal.push(temp);
        }
    }else{
        console.log("Warning: normals not found.");
    }
    //------------------------estraggo le coordinate delle texture e per comodità le ragruppo in (x,y)
    var tempTextCoord=[];  
    if(model.texcoords!==null){
        for(var i=0;i<model.texcoords.length;i++){
            var temp = [];
            temp.push(model.texcoords[i]);
            temp.push(model.texcoords[i+1]);
            tempTextCoord.push(temp);
        }
    } else{
        console.log("Warning: texcoords not found.");
    }
    //-----------------ora leggo ogni triangolo e costruisco gli array flatten
    for(var i=0;i<model.triangles.length;i++){
        var triang = model.triangles[i];
        if(model.normals!==null){            
            ris.normals.push(tempNormal[triang.nindices[0]][0]+1);
            ris.normals.push(tempNormal[triang.nindices[0]][1]+1);
            ris.normals.push(tempNormal[triang.nindices[0]][2]+1);

            // ris.normals.push(tempNormal[triang.nindices[1]][0]);
            // ris.normals.push(tempNormal[triang.nindices[1]][1]);
            // ris.normals.push(tempNormal[triang.nindices[1]][2]);

            // ris.normals.push(tempNormal[triang.nindices[2]][0]);
            // ris.normals.push(tempNormal[triang.nindices[2]][1]);
            // ris.normals.push(tempNormal[triang.nindices[2]][2]);
        }     

        if(model.texcoords!==null){
            //invece per le coordinate delle texture servono tutte e 3 (una per vertice del triangolo)
            ris.texcoords.push(tempTextCoord[triang.tindices[0]][0]);
            ris.texcoords.push(tempTextCoord[triang.tindices[0]][1]);
            ris.texcoords.push(tempTextCoord[triang.tindices[1]][0]);
            ris.texcoords.push(tempTextCoord[triang.tindices[1]][1]);
            ris.texcoords.push(tempTextCoord[triang.tindices[2]][0]);
            ris.texcoords.push(tempTextCoord[triang.tindices[2]][1]);
        }  
        //per gli idici del triancolo:
        ris.indices.push(triang.vindices[0]);        
        ris.indices.push(triang.vindices[1]);        
        ris.indices.push(triang.vindices[2]);
    }
    
    return ris;
}

function create3D(positions,texcoords,normals,indices,colors=null) {
    var c=colors;
    const numVerts = positions.length-1 / 3;

    if(c===null){
            var temp =[];           
            for(var x=0;x<numVerts;x++){
                temp.push(1);
                temp.push(1);
                temp.push(1);
            }
            c= expandRLEData(temp, [255]);
            //console.log("c",c);
    }
    
  
    const arrays = {
      position: webglUtils.createAugmentedTypedArray(3, numVerts),
      texcoord: webglUtils.createAugmentedTypedArray(2,  numVerts),
      normal: webglUtils.createAugmentedTypedArray(3, numVerts),
      color: webglUtils.createAugmentedTypedArray(4, numVerts, Uint8Array),
      indices: webglUtils.createAugmentedTypedArray(3, numVerts / 3, Uint16Array),
    };

    arrays.position.push(positions);
    if(texcoords!==null && texcoords!==undefined){
        arrays.texcoord.push(texcoords);
    }else{
        console.log("Warning texcoords not defined.");
    }
    console.log("normals",normals);
    arrays.normal.push(normals);
    arrays.color.push(c);
    arrays.indices=indices;
    // for (let ii = 0; ii < indices.length; ++ii) {
    //   arrays.indices.push(indices);
    // }

    return arrays;
  }


function distance(a, b) {	
    var distanza= Math.sqrt( Math.pow((a[0] - b[0]), 2) 
                        + Math.pow((a[1] - b[1]), 2) 
                        + Math.pow((a[2] - b[2]), 2));
    return distanza;
}

 //trova la diagonale di ogni faccia quad per poter costruire due triang tramite indici
 //restituisce un array di 4 indici così ordinati:
//[estremo_diagonale_1,estremo_diagonale_2,punto_restante,punto_restante]
 function findDiagonal(abcd,vertices){ 
    // var ris =[];
    // var actualBigger = -1;
    // for(var i =0;i<4;i++){
    //     for(var x =1;x<4;x++){
    //         if(i!==x){//se non sono lo stesso vertice della faccia quadrata
    //             //calcolo la distanza tra i due punti
    //             const temp=  distance(vertices[abcd[i]],vertices[abcd[x]]);
    //             if(actualBigger<temp){
    //                 var find=false;
    //                 if(actualBigger>-1){
    //                     find=true;
    //                 }
    //                 ris =[];//reset. nuova best solution
    //                 //riempo l'array con i 2 indici della diagonale
    //                 ris.push(abcd[i]);
    //                 ris.push(abcd[x]);
    //                 //riempo l'array con i rstanti 2 indici mancanti
    //                 for(var y =0;y<4;y++){
    //                     if(!ris.includes(abcd[y])){
    //                         ris.push(abcd[y]);
    //                     }
    //                 }
    //                 if(find){
    //                     return ris;
    //                 }
    //                 actualBigger=temp;
    //             }else if(actualBigger>temp){
    //                 return ris;
    //             }
    //         }
    //     }
    // }
    // return ris;
    var dist=[];
    const a=abcd[0];
    const b=abcd[1];
    const c=abcd[2];
    const d=abcd[3];
    var ind=[a,b,b,c,c,d,d,a,a,c,b,d];
        
    var res=[];
    var res1=-1, res2=-1;
    var max=0; 
    
    var res3, res4;
    var j=0;
    for (var i=0; i<ind.length-1; i=i+2){
        dist[j] = distance(vertices[ind[i]], vertices[ind[i+1]]);

        if(max<dist[j]){
            max=dist[j];
            res1=ind[i];
            res2=ind[i+1];	
        } 
        else if(max===dist[j]){
            res3=ind[i];
            res4=ind[i+1];	
        }
        j++;

    }
    res=[res1, res2, res3, res4];  	//res1, res2: indici della diagonale
                                    //res3, res4: angoli opposti
    return res;
    
}
// function fromQuad_ToTriang(adbc,vertices,ris=[]) {
//     var res = findDiagonal(adbc,vertices); //trovo indici nell'ordine corretto    
//     console.log("res",res);
//     //Primo triangolo
//     //var ris=[];
//     ris.push(res[0]); 
//     ris.push(res[1]); 
//     ris.push(res[2]); 
//     //Secondo triangolo
//     ris.push(res[0]);  
//     ris.push(res[1]); 
//     ris.push(res[3]); 

//     console.log("ris",ris);
//     return ris;
// }
function fromQuad_ToTriang(adbc,ris=[]) {
    ris.push(adbc[0]);
    ris.push(adbc[1]);
    ris.push(adbc[2]);

    ris.push(adbc[0]);
    ris.push(adbc[2]);
    ris.push(adbc[3]);
}
 //estreaggo gli idici, considerando la rappresentazione triangolare o quadrangolare del file
 function extractFaceIndexes(face,quad) {
    var ris =[];  
    var count=0;
    for (var i in face) { 	//per ogni faccia
        if (count !== 0) { 		//non considero la faccia 0
            const temp=[];
            //prendo solo i primi 4 valori, gli altri sono tutti 0
            temp.push(face[i].vert[0]-1);
            temp.push(face[i].vert[1]-1);
            temp.push(face[i].vert[2]-1);
            if(quad){//quadrangolare o meno
                temp.push(face[i].vert[3]-1);
            }
            ris.push(temp);
        }
        count++;
    }
    if(quad){//triangolazione (ricerca diagonale ecc)
        var temp =[];
        for (var i=0; i<ris.length; i++) {          
            fromQuad_ToTriang(ris[i],temp)
        }
        return temp;
    }else{    
        var temp = [];
        for(var i=0;i<ris.length;i++){
            temp.push(ris[i][0]);            
            temp.push(ris[i][1]);            
            temp.push(ris[i][2]);
        }   
        //ris=m4.flatten(ris);  //non va bene dato che impone il tipo di array a Float32
        return temp;
    }
}
//estraggo vertici di ogni faccia della mesh
function extractVertices(vert){
    const ris =[];   
    for(var x=1;x<vert.length;x++){
        const temp = [];
        temp.push(vert[x].x);
        temp.push(vert[x].y);
        temp.push(vert[x].z);
        ris.push(temp);
    }
    return ris;
}
//-----------------------

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
        this.color=[1,1,0,1]
        this.texture=null;
        this.textureW= 0;
        this.textureH= 0;     
        this.textureArray = [];
        this.texcoord =[];
        this.ambient=0.5;
        this.diffuse =0.5;
        this.shininess=10;
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

           console.log("chiusura.mesh",chiusura.mesh);
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
            console.log("arr",arr)
            chiusura.points=arr.vertices;
            chiusura.texcoord=arr.texcoords;
            chiusura.normals=arr.normals;
            chiusura.indexes=arr.indices;
           //-------------------------OLD
            // //carico le normali
            // var tempNormal=[];
            // for(var i=0;i<chiusura.mesh.model.normals.length;i+=3){
            //     var temp = [];
            //     temp.push(chiusura.mesh.model.normals[i]);
            //     temp.push(chiusura.mesh.model.normals[i+1]);
            //     temp.push(chiusura.mesh.model.normals[i+2]);
            //     tempNormal.push(temp);
            // }
            // console.log("tempNormal",tempNormal);
            // chiusura.normals=[];
            // //ho una normale per ogni triangolo
            // //e una normale è composta da 3 oordinate
            // if(tempNormal!==null){
            //     for(var i=0;i<chiusura.mesh.model.triangles.length;i++){
            //         if(chiusura.mesh.model.triangles[i].nindices!==null){
            //             var indiceNormale = chiusura.mesh.model.triangles[i].nindices[0]-1;
            //             chiusura.normals.push(tempNormal[indiceNormale][0]);                
            //             chiusura.normals.push(tempNormal[indiceNormale][1]);                
            //             chiusura.normals.push(tempNormal[indiceNormale][2]);
            //             indiceNormale = chiusura.mesh.model.triangles[i].nindices[1]-1;
            //             chiusura.normals.push(tempNormal[indiceNormale][0]);                
            //             chiusura.normals.push(tempNormal[indiceNormale][1]);                
            //             chiusura.normals.push(tempNormal[indiceNormale][2]);
            //             indiceNormale = chiusura.mesh.model.triangles[i].nindices[2]-1;
            //             chiusura.normals.push(tempNormal[indiceNormale][0]);                
            //             chiusura.normals.push(tempNormal[indiceNormale][1]);                
            //             chiusura.normals.push(tempNormal[indiceNormale][2]);
            //         }else{
            //             console.log("warning .triangles[i].nindices null.");
            //         }
                  
            //     }
            // }else{
            //     console.log("warning model.normals null.");
            // }
       
            // //chiusura.mesh = LoadSubdivMesh(chiusura.mesh); 		//LoadSubdivMesh -> mesh_utils.js             
            // chiusura.points = extractVertices(chiusura.mesh.vert); //estraggo vertici 
            
            // // console.log("chiusura.points",chiusura.points);
            // chiusura.indexes = extractFaceIndexes(chiusura.mesh.face,chiusura.isQuadFaceType()); //estraggo indici
            // var temp = [];
            // for(var i=0;i<chiusura.points.length; i++){
            //     temp.push(chiusura.points[i][0]);
            //     temp.push(chiusura.points[i][1]);
            //     temp.push(chiusura.points[i][2]);
            // }
            // //chiusura.points=m4.flatten(chiusura.points);
            // chiusura.points=temp;
            // // console.log("chiusura.mesh",chiusura.mesh);
            // // console.log("flatten.points",chiusura.points);
            // // console.log("chiusura.indexes",chiusura.indexes);
            // // console.log("chiusura.normals",chiusura.normals);
           if(chiusuraTexturePath!==null){
            const iMready=function(bin){
                //leggo l'intestazione della bitmap
                //console.log("binario",bin);
                // read the 54-byte header
                //fread(info, sizeof(unsigned char), 54, f); 
                                // extract image height and width from header
                //  int width = *(int*)&info[18];
                //  int height = *(int*)&info[22];

                const intestazione1 =  [];
                const intestazione2 =[];
                intestazione1.push(bin[18]);
                intestazione1.push(bin[19]);
                intestazione1.push(bin[20]);
                intestazione1.push(bin[21]);

                intestazione2.push(bin[22]);
                intestazione2.push(bin[23]);
                intestazione2.push(bin[24]);
                intestazione2.push(bin[25]);
                var w = byteArrayToInt(bin,18);// readInt(intestazione1);
                var h = byteArrayToInt(bin,22);// readInt(intestazione2);

                var ris = [];
                for(var i=55;i<bin.length;i++){
                        ris.push(bin[i]);
                }
                
                chiusura.textureArray=new Uint8Array(ris);
             
                chiusura.textureW= w;
                chiusura.textureH= h;   

                // chiusura.textureArray=new Uint8Array([126,126,126,126,126,126,126,126,126,126,126,126,126,126,126,255]);
                // chiusura.textureW= 4;
                // chiusura.textureH= 4;               
                //console.log("w: "+ w+ " h: "+ h);                
                chiusura.setReady();
            }
            loadBin(chiusuraTexturePath,iMready);
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
        // console.log("this.textureArray",this.textureArray)
 
        // this.texture = gl.createTexture();
        // gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // gl.texImage2D(
        // gl.TEXTURE_2D,
        // 0,                // mip level
        // gl.LUMINANCE,     // internal format
        // this.textureW,                // width
        // this.textureH,                // height
        // 0,                // border
        // gl.LUMINANCE,     // format
        // gl.UNSIGNED_BYTE, // type
        // this.textureArray);
        // //The texture is a non-power-of-two texture.
        // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.generateMipmap(gl.TEXTURE_2D);

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
           // u_color:  [0,0, 0, 1],
           // u_texture: this.texture,
            u_world: this.mMatrix
          };
    }
    getBufferInfo(gl){

    //   console.log("ss", primitives.createCubeBufferInfo(
    //     gl,
    //     2,  // size
    // ));
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
       //return webglUtils.createBufferInfoFromArrays(gl,create3D(this.points, this.texcoord,this.normals,this.indexes));
        if(this.bufferArrays===null){
            //non ha senso ricostruire gli array da capo tutte el volte
            this.bufferArrays= webglUtils.createBufferInfoFromArrays(gl,create3D(this.points, this.texcoord,this.normals,this.indexes));
        }
        return this.bufferArrays;
     
    }





}
