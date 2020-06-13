class Obj3D{

    constructor(file,needToBeTriangulated=false,draw_array=false){
        //-----------------------------------------------binds
        this.distance=this.distance.bind(this);
        this.findDiagonal=this.findDiagonal.bind(this);        
        this.extractVertices=this.extractVertices.bind(this);        
        this.extractFaceIndexes=this.extractFaceIndexes.bind(this);        
        this.meshTriangulation=this.meshTriangulation.bind(this);           
        this.meshAlreadyTriangLoad=this.meshAlreadyTriangLoad.bind(this);
        this.fromQuad_ToTriang=this.fromQuad_ToTriang.bind(this);
        this.changeColor=this.changeColor.bind(this);       
        
        this.isDrawArray=function(){
            return draw_array;
        }


        //----------------------------------------------------------------
        this.mesh = new subd_mesh();
        this.vertices = []; //vertici mesh con facce quad
        this.numTriangFaces = 0;        
        this.indicesArray = [];

        /* --- Array per i Buffer per la drawArray --- */

        this.pointsArray_drawArrays = [];
        this.colorsArray_drawArrays = [];

        /* --- Array per i Buffer per la drawElements --- */

        this.pointsArray_drawElements = [];
        this.colorsArray_drawElements = [];
    

        //------------------------------- LETTURA FILE OBJ      
    
        /* ---------- ESTRAGGO DATI DA NUOVO .OBJ CARICATO ----------- */    
        var reader = new FileReader();
        var chiusura =this;
        reader.onload = function(){
          
            
          
        }            
       // reader.readAsText(file);
       const reader = new FileReader();
       reader.addEventListener('load', (event) => {
         const response = event.target.result;
         chiusura.mesh = ReadOBJ(response,chiusura.mesh);		//ReadOBJ -> glm_light.js
         chiusura.mesh = LoadSubdivMesh(chiusura.mesh); 		//LoadSubdivMesh -> mesh_utils.js
         chiusura.vertices = extractVertices(chiusura.mesh); 	//estraggo vertici facce quad
         chiusura.pointsArray_drawElements = chiusura.vertices; //drawElement vuole vertici facce quad
         chiusura.indexes = extractFaceIndexes(chiusura.mesh);	//estraggo indici facce quad
         //init();
         if(chiusura.needToBeTriangulated){
             chiusura.meshTriangulation(chiusura.indexes); //triangolarizzo le facce quad e costruisco array indici      
         }else{
             chiusura.meshAlreadyTriangLoad(chiusura.indexes);
         }    
         //console.log("indexes",chiusura.indexes);
         if(chiusura.isDrawArray()){
                 //Per la drawArray
                 pointsArray_drawArrays=m4.flatten(pointsArray_drawArrays);
                 colorsArray_drawArrays=m4.flatten(colorsArray_drawArrays);
                 indicesArray=m4.flatten(indicesArray);//questo forse va commentato (da provare)
         }else{
                 //Per la drawElement
                 pointsArray_drawElements=m4.flatten(pointsArray_drawElements);      
                 indicesArray=m4.flatten(indicesArray);             
                 colorsArray_drawElements=m4.flatten(colorsArray_drawElements);
         }     
    
       });
     
       reader.addEventListener('progress', (event) => {
         if (event.loaded && event.total) {
           const percent = (event.loaded / event.total) * 100;
           console.log(`Progress: ${Math.round(percent)}`);
         }
       });
       reader.readAsDataURL(file);
     
    }

    changeColor(c=[0.0, 1.0, 1.0]){
        if(this.isDrawArray()){
            this.colorsArray_drawArrays=[];      
            for(var i=0; i<this.numTriangFaces*3; i++){	
                this.colorsArray_drawArrays.push(c); 
            }  
        }else{
            this.colorsArray_drawElements=[];
            for(var i=0; i<this.indicesArray.length; i++){	
                this.colorsArray_drawElements.push(c); 
            }		
        }
    }
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
                this.indicesArray.push([indexes[i][0],indexes[i][1],indexes[i][2]]);          
            }        
        }        
        this.numTriangFaces=this.indexes.length-1;
    }

    //rendo la mia mesh triangolare: con solo faccette triangolari.
    //serve alla drawArray perché vuole le facce triangolarizzate
    //serve anche alla drawElement per gli indici delle facce triang
    meshTriangulation () {
        for (var i=0; i<this.indexes.length; i++) {
            fromQuad_ToTriang(	
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
