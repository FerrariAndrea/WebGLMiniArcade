//dall esercizio WebGL_codes4/cg_cube_bezier2D_frenet.html
function createPista3D(lines1, lines2){
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
    const position =[];
    const indices =[];
    const norm = []; //tutte verso z 
    var counter = 0;
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
    }
    //probabilmente mangano gli ultimi 2 triangoli della pista
    //console.log(counter);
    const arrays = {
        position: webglUtils.createAugmentedTypedArray(3, counter),
        normal: webglUtils.createAugmentedTypedArray(3, counter),
        indices: webglUtils.createAugmentedTypedArray(3, counter/3 , Uint16Array),
      };
      arrays.position.push(position);      
      arrays.indices.push(indices);         
      arrays.normal.push(norm);
      return arrays;
}
class Pista{
    constructor(){
        this.draw =this.draw.bind(this);
        this.getBufferInfo= this.getBufferInfo.bind(this);
        this.isReady=function(){
            //non deve caricare nessun file, quindi è già pronto
            return true;
        }
        this.bufferArrays=null;
        //Bezier Curve definition: curva chiusa
        const pistaZ= 0.9999;
        const larghezzaPista =2;
        this.bezierC_interna={
            deg: 8,                       // grado della curva
            cp: [
            5,pistaZ,0,
            5,pistaZ,5,
            -5,pistaZ,5,
            -5,pistaZ,5,
            -5,pistaZ,0,
            -5,pistaZ,-5,
            -5,pistaZ,-5,
            5,pistaZ,-5,
            5,pistaZ,0
            ],
            ab: [0,2],
        };
        this.bezierC_esterna=JSON.parse(JSON.stringify(this.bezierC_interna));//deep copy struttura
        //applico la larghezza alla curva
        for(var i=0;i<this.bezierC_esterna.cp.length;i+=3){
            this.bezierC_esterna.cp[i]*=larghezzaPista;//x            
            this.bezierC_esterna.cp[i+2]*=larghezzaPista;//y
            //salto la z (i+1)
        }
        //-----------------------------------------------------------(INTERNA)
        //Bezier Curve CP 
        var cpxyz=[];
        cpxyz=m4.flatten(this.bezierC_interna.cp);

        //Bezier Curve discretization points
        var t=[]//,xyz=[],dxyz=[],ddxyz=[];
        var np=101, nD=3;
        t=linspace(this.bezierC_interna.ab[0],this.bezierC_interna.ab[1],np);

        //valutazione punti curva con algoritmo 1
        // var cc=bezier_valder(this.bezierC_interna, 3, 2, t)
        // xyz=m4.flatten(cc.D0);
        // dxyz=m4.flatten(cc.D1);
        // ddxyz=m4.flatten(cc.D2);

        // //valutazione punti curva con algoritmo 2 (dunque fino alla seconda derivata)
        var v=decast_valder(this.bezierC_interna, nD, 2, t)
        this.xyz_interna=m4.flatten(v.D0);
        this.dxyz=m4.flatten(v.D1); //derivata
        this.ddxyz=m4.flatten(v.D2);//derivata seconda        
        //-----------------------------------------------------------
        //-----------------------------------------------------------(ESTERNA)
        //Bezier Curve CP 
        var cpxyz_esterna=[];
        cpxyz_esterna=m4.flatten(this.bezierC_esterna.cp);

        //Bezier Curve discretization points
        var t=[]//,xyz=[],dxyz=[],ddxyz=[];
        var np=101, nD=3;
        t=linspace(this.bezierC_esterna.ab[0],this.bezierC_esterna.ab[1],np);

        //valutazione punti curva con algoritmo 1
        // var cc=bezier_valder(this.bezierC_esterna, 3, 2, t)
        // xyz=m4.flatten(cc.D0);
        // dxyz=m4.flatten(cc.D1);
        // ddxyz=m4.flatten(cc.D2);

        // //valutazione punti curva con algoritmo 2 (dunque fino alla seconda derivata)
        var v_esterna=decast_valder(this.bezierC_esterna, nD, 2, t)
        this.xyz_esterna=m4.flatten(v_esterna.D0);
        this.dxyz_esterna=m4.flatten(v_esterna.D1); //derivata
        this.ddxyz_esterna=m4.flatten(v_esterna.D2);//derivata seconda        
        //-----------------------------------------------------------

        this.color=[1,0,1,1];

    }

    getBufferInfo(gl){

         if(this.bufferArrays===null){
             //non ha senso ricostruire gli array da capo tutte el volte            
             this.bufferArrays= webglUtils.createBufferInfoFromArrays(gl,createPista3D(this.xyz_interna,this.xyz_esterna));    
             
            console.log("this.bufferArrays",  this.bufferArrays);        
         }
         return this.bufferArrays;
      
     }
    
    draw(gl,programInfo,inverseRef){
        const uniforms = {
            u_colorMult: this.color,  
            u_color:  [1,1,1, 1],
            //u_texture: this.texture,
            u_world: m4.zRotate(m4.identity(),degToRad(180)),
            texture_enable: 0.0 //aggiunta allo shader
        };
          
        const objBufferInfo=this.getBufferInfo(gl);
       // console.log("PISTA_BufferInfo",objBufferInfo);     
        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, objBufferInfo);
        // Set the uniforms unique to the cube
        webglUtils.setUniforms(programInfo, uniforms);
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

}