//provare a cambiare draw element con la draw array
//attenzione agli obj perché quelli del prof sono customizzati

var canvas;
var gl;

var mesh = new subd_mesh();
var   x=[],y=[],z=[]; 
var   edge=new Array();                       /* lista lati */
var   nvert,nedge,nface; 
var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];
var newIndexes = [];

var indexes = [];
var vertices = [];


var near = 1.0;
var far = 100.0;
var radius = 5.0;
var theta  = 20.0;
var phi    = 20.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 40.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, cameraMatrix, pMatrix;
var modelView, projection;
var eye;
var at = [0.0, 0.0, 0.0];
var up = [0.0, 0.0, 1.0];

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]); 
    colorsArray.push([0.0, 1.0, 0.0]); 
	
    pointsArray.push(vertices[b]); 
    colorsArray.push([0.0, 1.0, 0.0]); 
    
	pointsArray.push(vertices[c]); 
    colorsArray.push([0.0, 1.0, 0.0]); 
    
	pointsArray.push(vertices[a]); 
    colorsArray.push([0.0, 1.0, 0.0]); 
    
	pointsArray.push(vertices[c]); 
    colorsArray.push([0.0, 1.0, 0.0]); 
    
	pointsArray.push(vertices[d]); 
    colorsArray.push([0.0, 1.0, 0.0]); 
}

//dall'oggetto JSON "mesh", estraiamo i vertici di ogni faccia
function convertVertices(obj){
    const ris =[];   
    for(var x=1;x<obj.vert.length;x++){
        const temp = [];
        temp.push(obj.vert[x].x);
        temp.push(obj.vert[x].y);
        temp.push(obj.vert[x].z);
        //temp.push(1);
        ris.push(temp);
    }
	console.log("vertices", ris);
    return ris;
}

//dall'oggetto JSON "mesh", estraiamo gli indici di faccia
function extractFaceIndexes (obj) {
	const ris =[];  
	var count=0;
	for (var i in obj.face) { //per ogni faccia
		if (count !== 0) { //non considero la faccia 0
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
	console.log("indexes", ris);
	return ris;
}

//qui richiamo la quad per ogni indice di faccia
function drawObject (indexes) {
	for (var i=0; i<indexes.length; i++) {
		quad(	indexes[i][0], 
				indexes[i][1], 
				indexes[i][2], 
				indexes[i][3]);
	}
}

//quando carico un file, parte questa funzione
function gc_openFile(event) {
     event.preventDefault();
     var input = event.target;
     var reader = new FileReader();
     reader.onload = function(){
        var response = reader.result;
        mesh = ReadOBJ(response,mesh); //ReadOBJ nella glm_light.js
		//console.log("mesh readobj:", mesh);
		mesh = LoadSubdivMesh(mesh);
        console.log("mesh loadsubdiv:", mesh);
        vertices = convertVertices(mesh);
		indexes = extractFaceIndexes(mesh);
        init();
  }
  reader.readAsText(input.files[0]);
}

function init() {

    canvas = document.getElementById( "gl-canvas" );
 
    gl = canvas.getContext("webgl");
    if (!gl) {
      alert( "WebGL isn't available" );
      return;
    }   

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
    gl.useProgram( program );
    
    //colorCube();
	drawObject(indexes); //disegna vertici con relativi colori
    //console.log("pointArray: ", pointsArray);

    // console.log(pointsArray.length);
    // var temp=webglUtils.createAugmentedTypedArray(4, 36);
    // for (var i=0; i<pointsArray.length; i++){
    //     temp.push(pointsArray[i]);
    // }
    // pointsArray=temp;

	// console.log("PointsArray: ", pointsArray);
	// console.log("ColorsArray: ", colorsArray);

    pointsArray=m4.flatten(pointsArray);
    colorsArray=m4.flatten(colorsArray);
    indexes=m4.flatten(indexes);

    console.log("PointsArray: ", pointsArray);
    console.log("ColorsArray: ", colorsArray);
    console.log("indexes: ", indexes);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, colorsArray, gl.STATIC_DRAW );
    

    //-------------------------per drawElement
   
    // for(var x=0;x<indexes.length;x+=3){
    //     indexes[x]= indexes[x]+(indexes[x]/3)
    //     newIndexes.push(indexes[x]);
    //     newIndexes.push(indexes[x+1]);
    //     newIndexes.push(indexes[x+2]);
    //     newIndexes.push(1);
    // }
    var index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    //-------------------------------------------


    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );

	// buttons for viewing parameters
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1; render()};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9; render()};
    document.getElementById("Button3").onclick = function(){radius *= 1.1; render()};
    document.getElementById("Button4").onclick = function(){radius *= 0.9; render()};
    document.getElementById("Button5").onclick = function(){theta += dr; render()};
    document.getElementById("Button6").onclick = function(){theta -= dr; render()};
    document.getElementById("Button7").onclick = function(){phi += dr; render()};
    document.getElementById("Button8").onclick = function(){phi -= dr; render()};
    
	console.log(pointsArray.length);
	NumVertices = pointsArray.length *4;
	console.log(NumVertices);   
	   
    render(); 
}

function degToRad(d) {
   return d * Math.PI / 180;
}

var render = function(){
    // Tell WebGL how to convert from clip space to pixels
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    eye = [radius*Math.sin(phi)*Math.cos(theta), 
        radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi)];
    // Compute the camera's matrix
    var cameraMatrix = m4.lookAt(eye, at, up);
   // Make a view matrix from the camera matrix.
    var mvMatrix = m4.inverse(cameraMatrix);

    // Compute the projection matrix
    var pMatrix = m4.perspective(degToRad(fovy), aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, mvMatrix );
    gl.uniformMatrix4fv( projection, false, pMatrix );
    gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
