class Obj3D{

    constructor(file,needBeTriangulated=false,draw_array=false){
        //-----------------------------------------------binds
        this.distance=this.distance.bind(this);
        this.findDiagonal=this.findDiagonal.bind(this);        
        this.extractVertices=this.extractVertices.bind(this);        
        this.extractFaceIndexes=this.extractFaceIndexes.bind(this);        
        this.meshTriangulation=this.meshTriangulation.bind(this);           
        this.meshAlreadyTriangLoad=this.meshAlreadyTriangLoad.bind(this);
        this.fromQuad_ToTriang=this.fromQuad_ToTriang.bind(this);
        this.changeColor=this.changeColor.bind(this);       
        this.translate=this.translate.bind(this);
        this.rotate=this.rotate.bind(this);
        this.scale=this.scale.bind(this);

        this.isDrawArray=function(){
            return draw_array;
        }
        this.needToBeTriangulated=function(){
            return needBeTriangulated;
        }

        var ready=false;
        this.isReady=function(){
              return ready;
        }
        this.setReady=function(){
            ready=true;
        }
        //----------------------------------------------------------------
        this.mesh = new subd_mesh();
        this.vertices = []; //vertici mesh con facce quad
        this.numTriangFaces = 0;        
        this.indicesArray = [];
        this.mMatrix =m4.identity();//per le trasformazioni geometriche
        /* --- Array per i Buffer per la drawArray --- */

        this.pointsArray_drawArrays = [];
        this.colorsArray_drawArrays = [];

        /* --- Array per i Buffer per la drawElements --- */

        this.pointsArray_drawElements = [];
        this.colorsArray_drawElements = [];
        
        //----------------normali
        this.normals=null;//new Float32Array([]);

        //------------------------------- LETTURA FILE OBJ      
    
        /* ---------- ESTRAGGO DATI DA NUOVO .OBJ CARICATO ----------- */    
        //const reader = new FileReader();
        var chiusura =this;
      
        var onload = function(response){
            //console.log("---------onload");
            //const response = event.target.result;
            chiusura.mesh = ReadOBJ(response,chiusura.mesh);		//ReadOBJ -> glm_light.js
            if(chiusura.mesh.normals!==undefined && chiusura.mesh.normals!==null && chiusura.mesh.normals.length>1){
                chiusura.normals=chiusura.mesh.normals;
            }
            chiusura.mesh = LoadSubdivMesh(chiusura.mesh); 		//LoadSubdivMesh -> mesh_utils.js
            chiusura.vertices = chiusura.extractVertices(chiusura.mesh); 	//estraggo vertici facce quad
            //console.log("vertices",chiusura.vertices); //ok
            chiusura.pointsArray_drawElements = chiusura.vertices; //drawElement vuole vertici facce quad
            chiusura.indexes =  chiusura.extractFaceIndexes(chiusura.mesh);	//estraggo indici facce quad
            //init();
            if(chiusura.needToBeTriangulated()){
                chiusura.meshTriangulation(chiusura.indexes); //triangolarizzo le facce quad e costruisco array indici      
            }else{
                chiusura.meshAlreadyTriangLoad(chiusura.indexes);
            }    
            chiusura.changeColor([0,1,1],false);
            //console.log("indexes",chiusura.indexes);
            if(chiusura.isDrawArray()){
                    //Per la drawArray
                    chiusura.pointsArray_drawArrays=m4.flatten(chiusura.pointsArray_drawArrays);
                    chiusura.colorsArray_drawArrays=m4.flatten(chiusura.colorsArray_drawArrays);
                    chiusura.indicesArray=m4.flatten(chiusura.indicesArray);//questo forse va commentato (da provare)
            }else{
                    //Per la drawElement
                    chiusura.pointsArray_drawElements=m4.flatten(chiusura.pointsArray_drawElements);      
                    chiusura.indicesArray=m4.flatten(chiusura.indicesArray);          
                    chiusura.colorsArray_drawElements=m4.flatten(chiusura.colorsArray_drawElements);
            }     
            chiusura.setReady();
        }          
        loadFile(file,onload);
        //reader.readAsDataURL(dataURItoBlob(file)); 
       //reader.readAsDataURL(file);
     
    }

    //chiamabile in ogni momenti per cambiare la posizione
    translate(x,y,z){
        this.mMatrix=m4.translate(this.mMatrix,x,y,z); 
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
    changeColor(c=[0.0, 1.0, 1.0],needFlat=true){
        if(this.isDrawArray()){
            this.colorsArray_drawArrays=[];      
            for(var i=0; i<this.numTriangFaces*3; i++){	
                this.colorsArray_drawArrays.push(c); 
            }  
            if(needFlat){
                chiusura.colorsArray_drawArrays=m4.flatten(chiusura.colorsArray_drawArrays);
            }
        }else{
            this.colorsArray_drawElements=[];
            for(var i=0; i<this.indicesArray.length; i++){	
                this.colorsArray_drawElements.push(c); 
            }		
            if(needFlat){
                chiusura.colorsArray_drawElements=m4.flatten(chiusura.colorsArray_drawElements);
            }
        }
       
    }














    //------------------------------------------------------------------------LOAD OBJ---------------------
    //da faccia quadrilatera estrae due facce triangolari
    fromQuad_ToTriang(a, b, c, d) {
        var res = this.findDiagonal(a,b,c,d); //trovo indici nell'ordine corretto        
        if(this.isDrawArray()){
                //Primo triangolo
                this.pointsArray_drawArrays.push(this.vertices[res[0]]); 
                this.pointsArray_drawArrays.push(this.vertices[res[1]]); 
                this.pointsArray_drawArrays.push(this.vertices[res[2]]); 
                //Secondo triangolo
                this.pointsArray_drawArrays.push(this.vertices[res[0]]);  
                this.pointsArray_drawArrays.push(this.vertices[res[1]]); 
                this.pointsArray_drawArrays.push(this.vertices[res[3]]); 
        }else{
                //Primo triangolo
                this.indicesArray.push([res[0],res[1],res[2]]);
                //Secondo triangolo
                this.indicesArray.push([res[0],res[1],res[3]]);                
        }
        this.numTriangFaces+=2;
    }

    meshAlreadyTriangLoad() {
        this.numTriangFaces=0;
        for (var i=0; i<this.indexes.length; i++) {
            if(this.isDrawArray()){
                this.pointsArray_drawArrays.push(indexes[i][0]);  
                this.pointsArray_drawArrays.push(indexes[i][1]); 
                this.pointsArray_drawArrays.push(indexes[i][2]); 
            }else{
                this.indicesArray.push([this.indexes[i][0],this.indexes[i][1],this.indexes[i][2]]);          
            }        
        }        
        this.numTriangFaces=this.indexes.length-1;
        //console.log(this.numTriangFaces);  //-----OK
    }

    //rendo la mia mesh triangolare: con solo faccette triangolari.
    //serve alla drawArray perché vuole le facce triangolarizzate
    //serve anche alla drawElement per gli indici delle facce triang
    meshTriangulation () {
        for (var i=0; i<this.indexes.length; i++) {
            this.fromQuad_ToTriang(	
                    this.indexes[i][0], 
                    this.indexes[i][1], 
                    this.indexes[i][2], 
                    this.indexes[i][3]);
        }
    }

    distance(a, b) {	
        var distanza= Math.sqrt( Math.pow((this.vertices[a][0] - this.vertices[b][0]), 2) 
                            + Math.pow((this.vertices[a][1] - this.vertices[b][1]), 2) 
                            + Math.pow((this.vertices[a][2] - this.vertices[b][2]), 2));
        return distanza;
    }

    //trova la diagonale di ogni faccia quad per poter costruire due triang tramite indici
    findDiagonal(a, b, c, d){ 

        var dist=[];
        var ind=[a,b,b,c,c,d,d,a,a,c,b,d];
            
        var res=[];
        var res1=-1, res2=-1;
        var max=0; 
        
        var res3, res4
        var j=0;
        for (var i=0; i<ind.length-1; i=i+2){
            dist[j] = this.distance(ind[i], ind[i+1]);

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
    //estraggo vertici di ogni faccia quadrangolare della mesh
    extractVertices(obj){
        const ris =[];   
        for(var x=1;x<obj.vert.length;x++){
            const temp = [];
            temp.push(obj.vert[x].x);
            temp.push(obj.vert[x].y);
            temp.push(obj.vert[x].z);
            ris.push(temp);
        }
        return ris;
    }

    //estraggo indici di faccia quadrangolare della mesh
    extractFaceIndexes(obj) {
        const ris =[];  
        var count=0;
        for (var i in obj.face) { 	//per ogni faccia
            if (count !== 0) { 		//non considero la faccia 0
                const temp=[];
                //prendo solo i primi 4 valori, gli altri sono tutti 0
                temp.push(obj.face[i].vert[0]-1);
                temp.push(obj.face[i].vert[1]-1);
                temp.push(obj.face[i].vert[2]-1);
                temp.push(obj.face[i].vert[3]-1);
                ris.push(temp);
            }
            count++;
        }
        return ris;
    }


}
