// discretizzazione dell'intervallo [a,b] in
// np punti equispaziati
// ritorna un array con i punti equispaziati
function linspace(a,b,np){
  var dst=[];
  var h=(b - a)/(np-1);
  for (var i=0; i<np; i++){
    dst[i]=a+i*h;
  }
  return dst;
}

//calcolo funzioni base di Bernstein di grado arbitrario n
function bernst_der(t,aa,bb,n,od){
//t --> valore parametri in cui valutare la base di Bernstein e le sue derivate
//aa,bb -->estremi intervallo di definizione
//n --> grado
//od --> ordine di derivazione: od<=n and od<=2)
//ritorna da una a tre matrici di dimensione (t.length)x(n+1)
//per esempio per una cubica (n=3) e derivata seconda (od=2) calcola tre
//matrici t.lengthx4 con nella prima matrice i valori, nella seconda 
//le derivate prime e nella terza le derivate seconde
var d1,d2,l;
var np1=n+1;
var b=[[],[],[]];
if (od>n)
  od=n;
if (od>2)
  od=2;
var bv=[], dbv=[], ddbv=[];
var h=bb-aa;
 for (var ii=0; ii<t.length; ii++){
  t[ii]=(t[ii]-aa)/h;
  bv[ii]=[];
  dbv[ii]=[];
  ddbv[ii]=[];
 }
 for (var ii=0; ii<t.length; ii++){
  l=np1;
  b[0][l-1]=1.0
  d1=t[ii];
  d2=1.0-t[ii];
  for (var i=1; i<=n; i++){

   for (var k=od; k>=1; k--){
       for (var j=l-2; j<=n; j++){
          if (j>l-2 && j<n){
            b[k][j]=i*(b[k-1][j]-b[k-1][j+1])/h;
          }
          else{
            if (j==l-2)
               b[k][j]=-i*b[k-1][j+1]/h;
            else
               b[k][j]=i*b[k-1][j]/h;
          }
       }
   }
   
   var temp=0.0;
   for (var j=l-1; j<=n; j++){
    b[0][j-1]=temp+d2*b[0][j];
    temp=d1*b[0][j];
   }
    b[0][n]=temp;

    l=l-1;
  }
 for (var j=0; j<=n; j++){
    bv[ii][j]=b[0][j];
    if (od>=1) dbv[ii][j]=b[1][j];
    if (od>=2) ddbv[ii][j]=b[2][j];
  }
 }

 if (od==0)
  return {D0: bv};
 if (od==1)
  return {D0: bv, D1: dbv};
 if (od==2)
  return {D0: bv, D1: dbv, D2: ddbv};  
}

//calcola tangente, binormale e normale in un
//punto di una curva di cui sono noti valore,
//derivata prima e seconda;
function frenet_frame(xyz,dxyz,ddxyz,i){
//xyz --> array di punti (x,y,z) di una curva 3D
//dxyz --> array valori di derivate prima (dx,dy,dz)
//ddxyz --> array valori di derivate seconda (ddx,ddy,ddz)
//i --> indice del punto dei vettori passati in input
//      su cui calcolare i vettori tangente, normale e binormale
//restituisce una matrice 4x4 con nelle colonne
//tangente, normale e binormale e nell'ultima
//il punto in cui vengono applicati/calcolati i
//vettori suddetti
var FF=[[]];
var Txyz=[];
var Bxyz=[];
var Nxyz=[];
var C0=[],C1=[],C2=[];
C0=[xyz[i],xyz[i+1],xyz[i+2]];
C1=[dxyz[i],dxyz[i+1],dxyz[i+2]];
C2=[ddxyz[i],ddxyz[i+1],ddxyz[i+2]];
//versore Tangente
Txyz=m4.normalize(C1);
//versore Binormale
Bxyz=m4.cross(C1,C2);
Bxyz=m4.normalize(Bxyz);
//versore Normale
Nxyz=m4.cross(Bxyz,Txyz);
//definizione matrice Frenet Frame
FF=[Txyz[0],Txyz[1],Txyz[2],0,
    Nxyz[0],Nxyz[1],Nxyz[2],0,
    Bxyz[0],Bxyz[1],Bxyz[2],0,
    C0[0],C0[1],C0[2],1];
// console.log(Txyz);
// console.log(Nxyz);
// console.log(Bxyz);
// console.log(C0);
 return FF;
}

//calcola tangente alla ConS, normale alla Surf e normale 
//alla ConS in un punto della ConS di cui sono noti valore,
//derivata prima e seconda della Surf e derivata prima della Curv;
function frenet_frame_cons(xyz,du,dv,duvt,i){
//xyz --> array di punti (x,y,z) di una curva 3D su superficie/patch
//du  --> array valori di derivate prima in u (dux,duy,duz)
//dv  --> array valori di derivate prima in v (dvx,dvy,dvz)
//duvt--> derivata prima in t della curva 3D
//i --> indice del punto dei vettori passati in input
//      su cui calcolare i vettori tangente, normale Surf e normale Curv
//restituisce una matrice 4x4 con nelle colonne
//tangente, normale Surf e normale Curv e nell'ultima
//il punto in cui vengono applicati/calcolati i
//vettori suddetti
var FF=[[]];
var Txyz=[];
var Bxyz=[];
var Nxyz=[];
var C0=[],C1u=[],C1v=[],D=[],j=i*2/3;
C0=[xyz[i],xyz[i+1],xyz[i+2]];
C1u=[du[i],du[i+1],du[i+2]];
C1v=[dv[i],dv[i+1],dv[i+2]];
D=[duvt[j],duvt[j+1]]
//versore Tangente
Txyz[0]=C1u[0]*D[0]+C1v[0]*D[1];
Txyz[1]=C1u[1]*D[0]+C1v[1]*D[1];
Txyz[2]=C1u[2]*D[0]+C1v[2]*D[1];
Txyz=m4.normalize(Txyz);
//versore Normale alla superficie
Nxyz=m4.cross(C1u,C1v);
Nxyz=m4.normalize(Nxyz);
//versore Normale alla cons
Bxyz=m4.cross(Nxyz,Txyz);
//definizione matrice Frenet Frame
FF=[Txyz[0],Txyz[1],Txyz[2],0,
    Nxyz[0],Nxyz[1],Nxyz[2],0,
    Bxyz[0],Bxyz[1],Bxyz[2],0,
    C0[0],C0[1],C0[2],1];
// console.log(Txyz);
// console.log(Nxyz);
// console.log(Bxyz);
// console.log(C0);
 return FF;
}
//Calcola il valore e le derivate fino a ordine k<=2
//di una curva nD (n=1,2,3) di Bezier in bezier definita dai 
//punti di controllo bezier.cp nei punti t mediante le 
//funzioni base di Bernstein
function bezier_valder(bezC,nD,k,t){
//bezC--> struttura di una curva di Bezier:
//          bezC.deg --> grado della curva
//          bezC.cp  --> lista dei punti di controllo nx(g+1)
//          bezC.ab  --> intervallo di definizione
//nD  --> numero di coordinate
//k   --> ordine di derivazione; 0 valore, 1 derivata prima, 
//        2 derivata seconda
//t   --> lista dei punti in cui valutare
//restituisce tre array contenenti valori, derivata prima e seconda
//della curva nei parametri t;
//ogni array ha dimensione m x nD, dove m e' il numero di parametri in t
var xyz=[], dxyz=[], ddxyz=[];
var c=[],dc=[],ddc=[];
var stc;
var b=bernst_der(t,bezC.ab[0],bezC.ab[1],bezC.deg,k);

  if (k==0){
     for (var i=0; i<t.length; i++){
      for (var ii=0; ii<nD; ii++)
        c[ii]=0;
      for (var j=0; j<=bezC.deg; j++){
        stc=j*nD;
        for (var ii=0; ii<nD; ii++)
         c[ii]+=b.D0[i][j]*bezC.cp[stc+ii];
      }
      for (var ii=0; ii<nD; ii++)
         xyz.push(c[ii]);
     }
   }

  if (k==1){
     for (var i=0; i<t.length; i++){
      for (var ii=0; ii<nD; ii++){
        c[ii]=0;
        dc[ii]=0;
      }
      for (var j=0; j<=bezC.deg; j++){
        stc=j*nD;
        for (var ii=0; ii<nD; ii++){
         c[ii]+=b.D0[i][j]*bezC.cp[stc+ii];
         dc[ii]+=b.D1[i][j]*bezC.cp[stc+ii];
        }
      }
      for (var ii=0; ii<nD; ii++){
        xyz.push(c[ii]);
        dxyz.push(dc[ii]);
      }
     }
   }

  if (k==2){
     for (var i=0; i<t.length; i++){
      for (var ii=0; ii<nD; ii++){
        c[ii]=0;
        dc[ii]=0;
        ddc[ii]=0;
      }
      for (var j=0; j<=bezC.deg; j++){
        stc=j*nD;
        for (var ii=0; ii<nD; ii++){
         c[ii]+=b.D0[i][j]*bezC.cp[stc+ii];
         dc[ii]+=b.D1[i][j]*bezC.cp[stc+ii];
         ddc[ii]+=b.D2[i][j]*bezC.cp[stc+ii]; 
        }
      }
      for (var ii=0; ii<nD; ii++){
        xyz.push(c[ii]);
        dxyz.push(dc[ii]);
        ddxyz.push(ddc[ii]);
      }
     }
   }
 if (k==0)
  return {D0: xyz};
 if (k==1)
  return {D0: xyz, D1: dxyz};
 if (k==2)
  return {D0: xyz, D1: dxyz, D2: ddxyz};
}

//Calcola il valore e le derivate fino a ordine k<=2
//di una curva nD (n=1,2,3) di Bezier definita dai punti di 
//controllo bezier.cp nei punti t mediante l'algoritmo di de Casteljau
function decast_valder(bezC,nD,k,t){
//bezC--> struttura di una curva di Bezier:
//          bezC.deg --> grado della curva
//          bezC.cp  --> lista dei punti di controllo nx(g+1)
//          bezC.ab  --> intervallo di definizione
//nD  --> numero di coordinate
//k   --> ordine di derivazione; 0 valore, 1 derivata prima, 
//        2 derivata seconda
//t   --> lista dei punti in cui valutare
//restituisce tre array contenenti valori, derivata prima e seconda
//della curva nei parametri t;
//ogni array ha dimensione m x nD, dove m e' il numero di parametri in t
var left=[];
var right=[];
var d1,d2,st;
var xyz=[], dxyz=[], ddxyz=[];

if (k>bezC.deg)
  k=bezC.deg;
if (k>2)
  k=2;

//cambio di variabile [a,b]-->[0,1]
var bma=bezC.ab[1]-bezC.ab[0];
//var bma=1.0;
for (kk=0; kk<t.length; kk++)
  t[kk]=(t[kk]-bezC.ab[0])/bma;

//algoritmo di de Casteljau
for (var kk=0; kk<t.length; kk++){
  for (var ii=0; ii<nD; ii++)
    left[ii]=bezC.cp[ii];
  right=Array.from(bezC.cp);
  d1=t[kk];
  d2=1.0-t[kk];
  for (var j=1; j<=bezC.deg; j++){
   for (var i=0; i<=bezC.deg-j; i++){
    st=i*nD;
    for (var ii=0; ii<nD; ii++)
     right[st+ii]=d1*right[st+nD+ii]+d2*right[st+ii];
   }
   st=j*nD;
   for (var ii=0; ii<nD; ii++)
   left[st+ii]=right[ii];
  }
/*nei vettori left e right ci sono i punti di controllo delle curve nella
%base di Bernstein in [0,tt(ii)] e [t(ii),1], allora
%p(t(ii)) =left(g+1)=right(1)
%p'(t(ii))=grado*(left(g+1)-left(g))/(d1*(b-a))=grado*(right(2)-right(1))/(d2*(b-a))
%ecc.
%valutazione derivate con opportuna scalatura
%d2 e d1 sono moltiplicati ad ogni passo per bma
%in quanto si deve tener conto che abbiamo inizialmente
%operato un cambio di variabile da [a,b]-->[0,1]
*/
  if (d1<d2){
   d2=d2*bma;
   for (var j=1; j<=k; j++){
    for (var i=k; i>=j; i--){
      st=i*nD;
      for (var ii=0; ii<nD; ii++)
       right[st+ii]=(bezC.deg+1-j)*(right[st+ii]-right[st-nD+ii])/d2;
    }
   }
   if (k>=0) 
     for (var ii=0; ii<nD; ii++) xyz.push(right[ii]);
   if (k>=1) 
     for (var ii=0; ii<nD; ii++) dxyz.push(right[3+ii]);
   if (k>=2)
     for (var ii=0; ii<nD; ii++) ddxyz.push(right[6+ii]);
  }
  else{
   d1=d1*bma;
   for (var j=1; j<=k; j++){
    for (var i=bezC.deg-k; i<=bezC.deg-j; i++){
      st=i*nD;
      for (var ii=0; ii<nD; ii++)
        left[st+ii]=(bezC.deg+1-j)*(left[st+nD+ii]-left[st+ii])/d1;
    }
   }
   if (k>=0)
     for (var ii=0; ii<nD; ii++) xyz.push(left[bezC.deg*nD+ii]);
   if (k>=1) 
     for (var ii=0; ii<nD; ii++) dxyz.push(left[(bezC.deg-1)*nD+ii]);
   if (k>=2) 
     for (var ii=0; ii<nD; ii++) ddxyz.push(left[(bezC.deg-2)*nD+ii]);
  }
 }
 if (k==0)
  return {D0: xyz};
 if (k==1)
  return {D0: xyz, D1: D2xyz};
 if (k==2)
  return {D0: xyz, D1: dxyz, D2: ddxyz};
}

//calcola il valore di un patch di Bezier prodotto tensoriale
//definita dai CP e dai gradi mediante l'algoritmo sulle funzioni base.
function bezier_val2_der(nD,bezP,tu,tv,kuv){
// nD --> numero delle coordinate
// bezP --> struttura di un patch di Bezier:
//          bezP.deg[] --> gradi del patch
//          bezP.cp[]  --> lista dei punti di controllo nD(deg[0]+1)(deg[1]+1)
//          bezP.ab[]  --> intervallo di definizione in u
//          bezP.cd[]  --> intervallo di definizione in v
// tu, tv --> vettore dei punti nelle dir. u e v
// kuv --> indice di derivazione: 0 valore, 1 derivate prime parziali, 
//         2 derivate seconde parziali
var nu=tu.length;
var nv=tv.length;
//console.log(bezP.deg[0]+1,bezP.deg[1]+1);
//console.log(bezP.cp.length);
var Bu=bernst_der(tu,bezP.ab[0],bezP.ab[1],bezP.deg[0],kuv);
var Bv=bernst_der(tv,bezP.cd[0],bezP.cd[1],bezP.deg[1],kuv);
//estrazione dall'array bezP.cp delle matrici delle singole
// nD componenti; matrice delle ascisse, ordinate e quote
var BvT=math.transpose(Bv.D0);
if (kuv>=1) var BvTD1=math.transpose(Bv.D1);
if (kuv>=2) var BvTD2=math.transpose(Bv.D2);
 var k=0;
 if (k<nD){
  var temp=[];
  for (var i=0; i<(bezP.deg[0]+1)*(bezP.deg[1]+1); i++)
    temp.push(bezP.cp[i*nD+k]);
  var cpx=math.transpose(math.reshape(temp,[bezP.deg[1]+1,bezP.deg[0]+1]));
  var xval=math.multiply(Bu.D0,cpx);
  xval=math.multiply(xval,BvT);
  if (kuv>=1){
    var xval1u=math.multiply(Bu.D1,cpx);
    xval1u=math.multiply(xval1u,BvT);
    var xval1v=math.multiply(Bu.D0,cpx);
    xval1v=math.multiply(xval1v,BvTD1);
  }
  if (kuv>=2){
    var xval2u=math.multiply(Bu.D2,cpx);
    xval2u=math.multiply(xval2u,BvT);
    var xval2v=math.multiply(Bu.D0,cpx);
    xval2v=math.multiply(xval2v,BvTD2);
  }
 }
 k=1;
 if (k<nD){
  var temp=[];
  for (var i=0; i<(bezP.deg[0]+1)*(bezP.deg[1]+1); i++)
    temp.push(bezP.cp[i*nD+k]);
  var cpy=math.transpose(math.reshape(temp,[bezP.deg[1]+1,bezP.deg[0]+1]));
  var yval=math.multiply(math.multiply(Bu.D0,cpy),BvT);
  if (kuv>=1){
    var yval1u=math.multiply(Bu.D1,cpy);
    yval1u=math.multiply(yval1u,BvT);
    var yval1v=math.multiply(Bu.D0,cpy);
    yval1v=math.multiply(yval1v,BvTD1);
  }
  if (kuv>=2){
    var yval2u=math.multiply(Bu.D2,cpy);
    yval2u=math.multiply(yval2u,BvT);
    var yval2v=math.multiply(Bu.D0,cpy);
    yval2v=math.multiply(yval2v,BvTD2);
  }
 }
 k=2;
 if (k<nD){
  var temp=[];
  for (var i=0; i<(bezP.deg[0]+1)*(bezP.deg[1]+1); i++)
    temp.push(bezP.cp[i*nD+k]);
  var cpz=math.transpose(math.reshape(temp,[bezP.deg[1]+1,bezP.deg[0]+1]));
  var zval=math.multiply(math.multiply(Bu.D0,cpz),BvT);
  if (kuv>=1){
    var zval1u=math.multiply(Bu.D1,cpz);
    zval1u=math.multiply(zval1u,BvT);
    var zval1v=math.multiply(Bu.D0,cpz);
    zval1v=math.multiply(zval1v,BvTD1);
  }
  if (kuv>=2){
    var zval2u=math.multiply(Bu.D2,cpz);
    zval2u=math.multiply(zval2u,BvT);
    var zval2v=math.multiply(Bu.D0,cpz);
    zval2v=math.multiply(zval2v,BvTD2);
  }
 }

 if (kuv==0){
 var val=[];
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
      if (nD>=1) val.push(xval[i][j]);
      if (nD>=2) val.push(yval[i][j]);
      if (nD>=3) val.push(zval[i][j]);
    }
 return {D0: val};
 }
 if (kuv==1){
  var val=[], val1u=[], val1v=[];
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
      if (nD>=1) {
        val.push(xval[i][j]);
        val1u.push(xval1u[i][j]);
        val1v.push(xval1v[i][j]);
      }
      if (nD>=2){
        val.push(yval[i][j]);
        val1u.push(yval1u[i][j]);
        val1v.push(yval1v[i][j]);
      }
      if (nD>=3){
        val.push(zval[i][j]);
        val1u.push(zval1u[i][j]);
        val1v.push(zval1v[i][j]);
      }
    }
 return {D0: val, D1u: val1u, D1v: val1v};
 }
 if (kuv==2){
  var val=[], val1u=[], val1v=[], val2u=[], val2v=[];
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
      if (nD>=1) {
        val.push(xval[i][j]);
        val1u.push(xval1u[i][j]);
        val1v.push(xval1v[i][j]);
        val2u.push(xval2u[i][j]);
        val2v.push(xval2v[i][j]);
      }
      if (nD>=2){
        val.push(yval[i][j]);
        val1u.push(yval1u[i][j]);
        val1v.push(yval1v[i][j]);
        val2u.push(yval2u[i][j]);
        val2v.push(yval2v[i][j]);
      }
      if (nD>=3){
        val.push(zval[i][j]);
        val1u.push(zval1u[i][j]);
        val1v.push(zval1v[i][j]);
        val2u.push(zval2u[i][j]);
        val2v.push(zval2v[i][j]);
      }
     }
 return {D0: val, D1u: val1u, D1v: val1v, D2u: val2u, D2v: val2v};
 }

}

//calcola il valore di un patch di Bezier prodotto tensoriale
//definita dai CP e dai gradi mediante l'algoritmo sulle funzioni base.
function bezier2_val2_der(nD,bezP,Bu,Bv,kuv){
// nD --> numero delle coordinate
// bezP --> struttura di un patch di Bezier:
//          bezP.deg[] --> gradi del patch
//          bezP.cp[]  --> lista dei punti di controllo nD(deg[0]+1)(deg[1]+1)
//          bezP.ab[]  --> intervallo di definizione in u
//          bezP.cd[]  --> intervallo di definizione in v
// kuv --> indice di derivazione: 0 valore, 1 derivate prime parziali, 
//         2 derivate seconde parziali
var sizt=[], nu, nv;
sizt = math.size(Bu.D0);
nu = sizt[0];
sizt = math.size(Bv.D0);
nv = sizt[0];
//estrazione dall'array bezP.cp delle matrici delle singole
// nD componenti; matrice delle ascisse, ordinate e quote
var BvT=math.transpose(Bv.D0);
if (kuv>=1) var BvTD1=math.transpose(Bv.D1);
if (kuv>=2) var BvTD2=math.transpose(Bv.D2);
 var k=0;
 if (k<nD){
  var temp=[];
  for (var i=0; i<(bezP.deg[0]+1)*(bezP.deg[1]+1); i++)
    temp.push(bezP.cp[i*nD+k]);
  var cpx=math.transpose(math.reshape(temp,[bezP.deg[1]+1,bezP.deg[0]+1]));
  var xval=math.multiply(Bu.D0,cpx);
  xval=math.multiply(xval,BvT);
  if (kuv>=1){
    var xval1u=math.multiply(Bu.D1,cpx);
    xval1u=math.multiply(xval1u,BvT);
    var xval1v=math.multiply(Bu.D0,cpx);
    xval1v=math.multiply(xval1v,BvTD1);
  }
  if (kuv>=2){
    var xval2u=math.multiply(Bu.D2,cpx);
    xval2u=math.multiply(xval2u,BvT);
    var xval2v=math.multiply(Bu.D0,cpx);
    xval2v=math.multiply(xval2v,BvTD2);
  }
 }
 k=1;
 if (k<nD){
  var temp=[];
  for (var i=0; i<(bezP.deg[0]+1)*(bezP.deg[1]+1); i++)
    temp.push(bezP.cp[i*nD+k]);
  var cpy=math.transpose(math.reshape(temp,[bezP.deg[1]+1,bezP.deg[0]+1]));
  var yval=math.multiply(math.multiply(Bu.D0,cpy),BvT);
  if (kuv>=1){
    var yval1u=math.multiply(Bu.D1,cpy);
    yval1u=math.multiply(yval1u,BvT);
    var yval1v=math.multiply(Bu.D0,cpy);
    yval1v=math.multiply(yval1v,BvTD1);
  }
  if (kuv>=2){
    var yval2u=math.multiply(Bu.D2,cpy);
    yval2u=math.multiply(yval2u,BvT);
    var yval2v=math.multiply(Bu.D0,cpy);
    yval2v=math.multiply(yval2v,BvTD2);
  }
 }
 k=2;
 if (k<nD){
  var temp=[];
  for (var i=0; i<(bezP.deg[0]+1)*(bezP.deg[1]+1); i++)
    temp.push(bezP.cp[i*nD+k]);
  var cpz=math.transpose(math.reshape(temp,[bezP.deg[1]+1,bezP.deg[0]+1]));
  var zval=math.multiply(math.multiply(Bu.D0,cpz),BvT);
  if (kuv>=1){
    var zval1u=math.multiply(Bu.D1,cpz);
    zval1u=math.multiply(zval1u,BvT);
    var zval1v=math.multiply(Bu.D0,cpz);
    zval1v=math.multiply(zval1v,BvTD1);
  }
  if (kuv>=2){
    var zval2u=math.multiply(Bu.D2,cpz);
    zval2u=math.multiply(zval2u,BvT);
    var zval2v=math.multiply(Bu.D0,cpz);
    zval2v=math.multiply(zval2v,BvTD2);
  }
 }

 if (kuv==0){
 var val=[];
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
      if (nD>=1) val.push(xval[i][j]);
      if (nD>=2) val.push(yval[i][j]);
      if (nD>=3) val.push(zval[i][j]);
    }
 return {D0: val};
 }
 if (kuv==1){
  var val=[], val1u=[], val1v=[];
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
      if (nD>=1) {
        val.push(xval[i][j]);
        val1u.push(xval1u[i][j]);
        val1v.push(xval1v[i][j]);
      }
      if (nD>=2){
        val.push(yval[i][j]);
        val1u.push(yval1u[i][j]);
        val1v.push(yval1v[i][j]);
      }
      if (nD>=3){
        val.push(zval[i][j]);
        val1u.push(zval1u[i][j]);
        val1v.push(zval1v[i][j]);
      }
    }
 return {D0: val, D1u: val1u, D1v: val1v};
 }
 if (kuv==2){
  var val=[], val1u=[], val1v=[], val2u=[], val2v=[];
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
      if (nD>=1) {
        val.push(xval[i][j]);
        val1u.push(xval1u[i][j]);
        val1v.push(xval1v[i][j]);
        val2u.push(xval2u[i][j]);
        val2v.push(xval2v[i][j]);
      }
      if (nD>=2){
        val.push(yval[i][j]);
        val1u.push(yval1u[i][j]);
        val1v.push(yval1v[i][j]);
        val2u.push(yval2u[i][j]);
        val2v.push(yval2v[i][j]);
      }
      if (nD>=3){
        val.push(zval[i][j]);
        val1u.push(zval1u[i][j]);
        val1v.push(zval1v[i][j]);
        val2u.push(zval2u[i][j]);
        val2v.push(zval2v[i][j]);
      }
     }
 return {D0: val, D1u: val1u, D1v: val1v, D2u: val2u, D2v: val2v};
 }

}

//definisce gli indici, per un disegno WireFrame, della
//griglia di controllo di un patch di Bezier
function lineCP(bezP){
var indices=[],k;
//dobbiamo costruire l'array indices in base a deg[0] e deg[1]
for (var j=0; j<=bezP.deg[1]; j++)
  for (var i=0; i<bezP.deg[0]; i++){
    k=i+j*(bezP.deg[0]+1);
    indices.push(k);
    indices.push(k+1);
  }
for (var i=0; i<=bezP.deg[0]; i++)
  for (var j=0; j<bezP.deg[1]; j++){
    k=i+j*(bezP.deg[0]+1);
    indices.push(k);
    indices.push(k+bezP.deg[0]+1);
  }
return indices;
}

//definisce gli indici, per un disegno WireFrame, di
//una discretizzazione nuxnv di un patch di Bezier
function lineSurf(nu,nv){
var indices=[],k;
//dobbiamo costruire l'array indices in base a nu ed nv
for (var j=0; j<nv; j++)
  for (var i=0; i<nu-1; i++){
    k=i+j*nu;
    indices.push(k);
    indices.push(k+1);
  }
for (var i=0; i<nu; i++)
  for (var j=0; j<nv-1; j++){
    k=i+j*nu;
    indices.push(k);
    indices.push(k+nu);
  }
  return indices;
}

//definisce gli indici, per un disegno a triangoli, di
//una discretizzazione nuxnv di un patch di Bezier
function triangSurf(nu,nv){
var indices=[],k;
//dobbiamo costruire l'array indices in base a nu ed nv
for (var j=0; j<nv-1; j++)
  for (var i=0; i<nu-1; i++){
    k=i+j*nu;
    indices.push(k);
    indices.push(k+1);
    indices.push(k+nu);
    indices.push(k+1);
    indices.push(k+nu+1);
    indices.push(k+nu);
  }
  return indices;
}

//definisce le coordinate texture di un patch di Bezier
//come i valori parametrici (u,v) del patch stesso
function SetTexcoordsSurf(nu,nv,u,v){
var coords=[];
//dobbiamo costruire l'array coords in base ad nu ed nv
for (var j=0; j<nv; j++)
  for (var i=0; i<nu; i++){
    coords.push(u[i]);
    coords.push(v[j]);
  }
  return coords;
}

//calcola le normali di un patch di Bezier
//in corrispondenza della discretizzazioe u,v
function bezier_normals(nu,nv,du,dv){
//nu,nv --> numero di punti della discretizzazione in u e in v
//du,dv --> array delle derivate parziali prime in u e in v
//restituisce array (x,y,z) delle normali
var normals=[], temp=[];
var k=0;
  for (var j=0; j<nv; j++)
    for (var i=0; i<nu; i++){
        temp = m4.cross([du[k],du[k+1],du[k+2]],[dv[k],dv[k+1],dv[k+2]]);
        temp =  m4.normalize(temp);
        normals.push(temp[0]);
        normals.push(temp[1]);
        normals.push(temp[2]);
        k=k+3;
    }
  return normals;
}