//dall esercizio WebGL_codes4/cg_cube_bezier2D_frenet.html
function createPista3D(lines1, lines2,aprossimazione=9){
    //grazie alla funzione decast_valder ottengo le mie linee guida da seguire per generare la pista
    //ogni linea guida ha lo stesso numero di punti è segurà la stessa traiettoria
    //una delle due è più piccola (linea interna alla pista)
    //per ogni punto j della lina interna:
    // mi collego al punto j della linea esterna
    // per poi collegarmi al punto j+1 sempre della linea esterna
    //e infine tornare al punto j della linea interna, tracciando così un triangolo
    //per poi eseguire la stessa operazione invertendo l'ordine tra linea interna ed esterna
    // in modo da disegnare il secondo triangolo
    //in sostanza triangolarizzo la pista per poterla disegnare piena e "interpolata" tra le due linee
    //in tutto il procedimento duplico i vertici
    //nel mentre riempo "func" con una funzione che restituisce true o folse
    //se un punto è all'interno della pista o meno, approssimando la pista in blocchi
    const arrOfFunc=[];    //array di blocchi

    const position =[];
    const indices =[];
    const norm = []; //tutte verso z 
    var counter = 0;
    var aCounter = 0; 
    var aLastX =0;
    for(var x=0;x<lines1.length-3;x+=3){
        //-----------------------primo triangolo
        //punto linea interna    
        position.push(lines1[x]);    
        position.push(lines1[x+1]);
        position.push(lines1[x+2]);
        norm.push(0);norm.push(-1);norm.push(0);        
        indices.push(counter);counter++;
        //punto linea esterna corrispondente         
        position.push(lines2[x]);    
        position.push(lines2[x+1]);
        position.push(lines2[x+2]);
        norm.push(0);norm.push(-1);norm.push(0);    
        indices.push(counter);counter++;
        //punto linea esterna successivo      
        position.push(lines2[x+3]);    
        position.push(lines2[x+4]);
        position.push(lines2[x+5]);          
        norm.push(0);norm.push(-1);norm.push(0);    
        indices.push(counter);counter++;
        //-----------------------secondo triangolo       
        //punto linea esterna successivo    
        position.push(lines2[x+3]);    
        position.push(lines2[x+4]);
        position.push(lines2[x+5]);          
        norm.push(0);norm.push(-1);norm.push(0);    
        indices.push(counter);counter++;  
        //punto linea interna successivo    
        position.push(lines1[x+3]);    
        position.push(lines1[x+4]);
        position.push(lines1[x+5]);          
        norm.push(0);norm.push(-1);norm.push(0);    
        indices.push(counter);counter++; 
        //punto linea interna    
        position.push(lines1[x]);    
        position.push(lines1[x+1]);
        position.push(lines1[x+2]);        
        norm.push(0);norm.push(-1);norm.push(0);    
        indices.push(counter);counter++;

        //approsimazione per costruire i vincoli sull'appartenenza o meno
        // di un punto (x,y) tra i due estremi della pista
        if(x/aprossimazione >=aCounter){
            aCounter++;
            if(aLastX-3>=0){
                aLastX-=3;//facico intersecare i rettangoli
            }
            const x1 = lines1[aLastX];
            const y1= lines1[aLastX+2];
            //per sta più sicuro, prendo due punti in più
            // in modo che i vari rettangoli dell'approsimazione
            // al più si intersecano nell'intorno dei loro estremi            
            var next =x+3*aprossimazione;
            if(next>=lines2.length){
                //sono arrivato a fine pista
                next = 0;
            } 
            aLastX=next;
            const x2 = lines2[next];
            const y2= lines2[next+2];
            const partialFunc = function(x,y){
                //controllo coordinata x
                const c1 =x1>=x2 && x>=x2 && x<=x1;
                const c2 = x1<=x2 && x>=x1 && x<=x2;
                if(c1 || c2){
                    //controllo coordinata y
                    const c3 =y1>=y2 && y>=y2 && y<=y1;
                    const c4 = y1<=y2 && y>=y1 && y<=y2;
                    return (c3 || c4);
                }
                return false;
            }
            arrOfFunc.push(partialFunc);
        }
    }
    //aggiungo un ultimo rettangolo
    const x1 = lines2[lines1.length-3*aprossimazione];
    const y1= lines2[lines1.length-aprossimazione];
    const x2 = lines1[0];
    const y2= lines1[2];
    const partialFunc = function(x,y){
        //controllo coordinata x
        const c1 =x1>=x2 && x>=x2 && x<=x1;
        const c2 = x1<=x2 && x>=x1 && x<=x2;
        if(c1 || c2){
            //controllo coordinata y
            const c3 =y1>=y2 && y>=y2 && y<=y1;
            const c4 = y1<=y2 && y>=y1 && y<=y2;
            return (c3 || c4);
        }
        return false;
    }
    arrOfFunc.push(partialFunc);
    //ora genero la funzione totale dall'array di funzioni
    const func=function(x,y){
       for(var i=0;i<arrOfFunc.length;i++){
            if(arrOfFunc[i](x,y)){
                //se trovo un rettangolo che contiene il punto x,y
                return true;
            }
       }
       //il punto xy non è all'interno di nessuno dei rettangoli che approssimano la pista
       return false;
    }

    //console.log(counter);
    const arrays = {
        position: webglUtils.createAugmentedTypedArray(3, counter),
        normal: webglUtils.createAugmentedTypedArray(3, counter),
        indices: webglUtils.createAugmentedTypedArray(3, counter/3 , Uint16Array),   
        texcoord: webglUtils.createAugmentedTypedArray(2,  counter),
        color:  webglUtils.createAugmentedTypedArray(4, counter, Uint8Array)
      };
      //console.log("arrays",arrays)
      arrays.position.push(position);      
      arrays.indices.push(indices);         
      arrays.normal.push(norm);

      const ris = {};
      ris.arrays=arrays;
      ris.func = func;
      return ris;
}




class Pista{
    constructor(){
        this.draw =this.draw.bind(this);
        this.getBufferInfo= this.getBufferInfo.bind(this);        
        this.addPartialBezier=this.addPartialBezier.bind(this);
        this.getFuncAppartieneAllaPista=this.getFuncAppartieneAllaPista.bind(this);
        this.isReady=function(){
            //non deve caricare nessun file, quindi è già pronto
            return true;
        }
        this.bufferArrays=null;
        this.arraysForBuffers=null;
        //Bezier Curve definition: curva chiusa
        const pistaZ=-0.001;
        const larghezzaPista =1.1;
        //insieme dei vertici (x,y,z) delle due linee che compongono la pista (interna ed esterna)
        this.xyz_esterna=[];        
        this.xyz_interna=[];
        this.uniforms = {
            u_world:  m4.zRotate(m4.identity(),degToRad(180)),
            u_colorMult: [0.9,1.0,0.99,1],  
            texture_enable: 0.0 //aggiunta allo shader
        };
          
        //--------------------------segmento (A)   
        const bezierC_interna_A={
            deg:3 ,               
            cp:  [
                -20,pistaZ,0,
                -20,pistaZ,20,              
                20,pistaZ,20,
                20,pistaZ,0, 
                ],
            ab: [0,2]
        };
        const bezierC_esterna_A={
            deg:3,                    
            cp:  [
                -10,pistaZ,0,
                -10,pistaZ,10,              
                10,pistaZ,10,
                10,pistaZ,0,                            
                ],
            ab: [0,2]
        };
        this.addPartialBezier(bezierC_interna_A,bezierC_esterna_A);
                
        //--------------------------segmento (B)   
        const bezierC_interna_B={
            deg:3 ,               
            cp:  [
                20,pistaZ,0,               
                20,pistaZ,-30, 
                30,pistaZ,-30, 
                30,pistaZ,0, 
                ],
            ab: [0,2]
        };
        const bezierC_esterna_B={
            deg:3,                    
            cp:  [
                10,pistaZ,0,               
                10,pistaZ,-40, 
                40,pistaZ,-40, 
                40,pistaZ,0,             
                ],
            ab: [0,2]
        };
        this.addPartialBezier(bezierC_interna_B,bezierC_esterna_B);
        //--------------------------segmento (C)   
        const bezierC_interna_C={
            deg:3 ,               
            cp:  [
                30,pistaZ,0,
                30,pistaZ,15,                
                26,pistaZ,35,                            
                0,pistaZ,35, 
                ],
            ab: [0,2]
        };
        const bezierC_esterna_C={
            deg:3,                    
            cp:  [
                40,pistaZ,0,
                40,pistaZ,20,                
                40,pistaZ,45,                            
                0,pistaZ,45,              
                ],
            ab: [0,2]
        };
        this.addPartialBezier(bezierC_interna_C,bezierC_esterna_C);
           //--------------------------segmento (D)   
           const bezierC_interna_D={
            deg:3 ,               
            cp:  [                           
                0,pistaZ,35, 
                -40,pistaZ,35,            
                -40,pistaZ,20,           
                -30,pistaZ,20, 
                ],
            ab: [0,2]
        };
        const bezierC_esterna_D={
            deg:3,                    
            cp:  [
                0,pistaZ,45,
                -50,pistaZ,45,            
                -50,pistaZ,10,           
                -40,pistaZ,10,          
                ],
            ab: [0,2]
        };
        this.addPartialBezier(bezierC_interna_D,bezierC_esterna_D);
        //--------------------------segmento (E)   
        const bezierC_interna_E={
            deg:3 ,               
            cp:  [                      
                -30,pistaZ,20, 
                -15,pistaZ,20,              
                -25,pistaZ,0,        
                -25,pistaZ,-20, 
                ],
            ab: [0,2]
        };
        const bezierC_esterna_E={
            deg:3,                    
            cp:  [
                -40,pistaZ,10, 
                -20,pistaZ,10,              
                -40,pistaZ,0,        
                -40,pistaZ,-20,           
                ],
            ab: [0,2]
        };
        this.addPartialBezier(bezierC_interna_E,bezierC_esterna_E);
        //--------------------------segmento (F)   
        const bezierC_interna_F={
            deg:3 ,               
            cp:  [                      
                -25,pistaZ,-20, 
                -25,pistaZ,-30,           
                -20,pistaZ,-30, 
                -20,pistaZ,0,	
                ],
            ab: [0,2]
        };
        const bezierC_esterna_F={
            deg:3,                    
            cp:  [
                -40,pistaZ,-20, 
                -40,pistaZ,-60,           
                -10,pistaZ,-60, 
                -10,pistaZ,0,	       
                ],
            ab: [0,2]
        };
        this.addPartialBezier(bezierC_interna_F,bezierC_esterna_F);
     

    }

    getFuncAppartieneAllaPista(){        
        //"func" è la funzione uscente che permette di capire se l'auto sta uscendo dalla pista         
        const temp = createPista3D(this.xyz_interna,this.xyz_esterna);
        this.arraysForBuffers =temp.arrays;
        return temp.func;
    }

    getBufferInfo(gl){

         if(this.bufferArrays===null){
             //non ha senso ricostruire gli array da capo tutte el volte         
             if(this.arraysForBuffers===null){
                this.getFuncAppartieneAllaPista();
             }                
             this.bufferArrays= webglUtils.createBufferInfoFromArrays(gl,this.arraysForBuffers);   
         }
         return this.bufferArrays;
      
     }
    
    draw(gl,programInfo,inverseRef){
        const objBufferInfo=this.getBufferInfo(gl);
       // console.log("PISTA_BufferInfo",objBufferInfo);     
        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, objBufferInfo);
        // Set the uniforms unique to the cube
        webglUtils.setUniforms(programInfo, this.uniforms);
        // calls gl.drawArrays or gl.drawElements
       webglUtils.drawBufferInfo(gl, objBufferInfo);


        //.-......................................SPUNTO dal file originale
        // // disegna i CP della curva di Bezier
        // function drawCPBezier(){
        //     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer5);
        //     gl.vertexAttribPointer(_position, nD, gl.FLOAT, false,0,0); 
        //     gl.enableVertexAttribArray(_position);
        //     gl.drawArrays(gl.LINE_STRIP, 0, bezierC.deg+1); 
        // }
            
        // // disegna la curva di Bezier
        // function drawBezier(){
        //     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer4);
        //     gl.vertexAttribPointer(_position, nD, gl.FLOAT, false,0,0); 
        //     gl.enableVertexAttribArray(_position);
        //     gl.drawArrays(gl.LINE_STRIP, 0, np); 
        //     //gl.drawArrays(gl.POINTS, 0, np);
        // }
    }

     //funzione per facilitare la creazione di una curva complessa ( più curve di bezier di grado 3)
     addPartialBezier(bezierC_interna,bezierC_esterna){
        //-----------------------------------------------------------(INTERNA)    
        //Bezier Curve discretization points
        var t=[]//,xyz=[],dxyz=[],ddxyz=[];
        var np=101;
        t=linspace(bezierC_interna.ab[0],bezierC_interna.ab[1],np);
        //valutazione punti curva con algoritmo 0, in questo caso non uso le derivate,
        // sono solo interessato ai punti della curca
        var cc=bezier_valder(bezierC_interna, 3, 0, t);
        var xyz=m4.flatten(cc.D0);
        for(var i =0;i<xyz.length;i++){
                this.xyz_interna.push(xyz[i]);
        }               
        //-----------------------------------------------------------(ESTERNA)
        //Bezier Curve discretization points
        var t=[]//,xyz=[],dxyz=[],ddxyz=[];
        var np=101;
        t=linspace(bezierC_esterna.ab[0],bezierC_esterna.ab[1],np);
        //valutazione punti curva con algoritmo 0, in questo caso non uso le derivate,
        // sono solo interessato ai punti della curca
        var cc=bezier_valder(bezierC_esterna, 3, 0, t)
         xyz=m4.flatten(cc.D0);
        for(var i =0;i<xyz.length;i++){
            this.xyz_esterna.push(xyz[i]);
        }
    }        
}
