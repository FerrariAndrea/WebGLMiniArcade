"use strict";
class Car{

    constructor(objs,x=0,y=-1.0,z=0,o=-90){
            //binds
            this.draw=this.draw.bind(this); 
            this.translate=this.translate.bind(this);
            this.rotate=this.rotate.bind(this);
            this.CarInit=this.CarInit.bind(this);
            this.CarDoStep=this.CarDoStep.bind(this);
            this.enableKeyboard=this.enableKeyboard.bind(this);
            this.doKeyUp=this.doKeyUp.bind(this);
            this.doKeyDown=this.doKeyDown.bind(this);
            this.createTexture=this.createTexture.bind(this);
            this.active=this.active.bind(this);
            this.touchstart=this.touchstart.bind(this);
            this.touchmove=this.touchmove.bind(this);
            this.handleEnd=this.handleEnd.bind(this);            
            this.enableThouch=this.enableThouch.bind(this);
            this.drawFrustum=this.drawFrustum.bind(this);      
            this.getLightProjectionMatrixs =this.getLightProjectionMatrixs.bind(this);            
            this.getLightWorldMatrixs =this.getLightWorldMatrixs.bind(this);
            this.getLightCount = this.getLightCount.bind(this);
            this.isReady=function(){
                //pronto quando sia la scocca che la ruota sono stae caricate (obj e texture)
                return objs.obj_car.isReady() && objs.obj_wheel.isReady();
            }     
            //------------------------------------------------geometria auto
            this.objCar = objs.obj_car;
            this.obj_real_wheel=objs.obj_wheel;
         
            //invece di generare 4 ruote distinte, clono la stessa ruota per riferimento, tenendo separati solo
            //la mMatrix e l'array di colore
            // this.obj_clone1_wheel=new Obj3DClone(obj_wheel);            
            // this.obj_clone2_wheel=new Obj3DClone(obj_wheel);
            // this.obj_clone3_wheel=new Obj3DClone(obj_wheel);

            //assegno i vari rapporti tra ruote e scocca
            this.raggioRuotaA = 0.3115;//0.25;
            this.raggioRuotaP = 0.3115;//0.30;
            this.posRel_ruote_ateriori={};
            this.posRel_ruote_posteriori={};
            this.posRel_ruote_ateriori.x=0.85;
            this.posRel_ruote_ateriori.y=0.35;
            this.posRel_ruote_ateriori.z=-1.151;
            this.posRel_ruote_posteriori.x=0.85;
            this.posRel_ruote_posteriori.y=0.35;
            this.posRel_ruote_posteriori.z=1.428;
            //rapporti tra scocca e luci
            this.fari_dest=[0.0,-2.0,-5.0];
            this.fari_sup_dest_anteriore = [0.0,0.46,-1.0];
            this.fari_sup_dest_posteriore = [0.0,0.46,+1.0];

            this.posRel_faro_ad={};
            this.posRel_faro_ad.x=0.664;
            this.posRel_faro_ad.y=0.666;
            this.posRel_faro_ad.z=-1.5;

            this.posRel_faro_as={};
            this.posRel_faro_as.x=-0.664;
            this.posRel_faro_as.y=0.666;
            this.posRel_faro_as.z=-1.5;

            
            this.posRel_faro_pd={};
            this.posRel_faro_pd.x=0.664;
            this.posRel_faro_pd.y=0.65;
            this.posRel_faro_pd.z=1.6;

            this.posRel_faro_ps={};
            this.posRel_faro_ps.x=-0.664;
            this.posRel_faro_ps.y=0.65;
            this.posRel_faro_ps.z=1.6;

            this.frenataOn= false;

            this.lightProjectionMatrix=undefined;
            this.lightWorldMatrix = {};
         
            //--------settaggi luci
            this.perspective=true;
            this.fieldOfView_A=50;
            this.projWidth=2;
            this.projHeight=2;
            // //controlli
            // this.key;
            this.CarInit(x,y,z,o);
            this.myInterval=null;
            this.touchStartPoint=null;
            this.tolleranceTouch=100;
            this.enableKeyboard(true); //attivo i comandi da tastiera dell'auto
            this.active(true); //attivo il doStep dell'auto
            //callback per cambiare la camera dell'auto
            //se null-->la camera è libera e guarda al centro del mondo
            //se no la camerà verrà aggiornata al doSetp dell'auto in modo che segua l'auto
            this.callbackCameraAuto=null;

            this.driftOn=true;


    }

    draw(gl,programInfo,inverseRef=false){
        var inverse = 1;
        if(inverseRef){
            inverse = -1;
        }
        //sposto l'auto
        this.objCar.mMatrix=m4.identity(); 
        this.objCar.translate(this.px,this.py,this.pz);        
        this.objCar.rotate(this.facing,"y");
        //disegno corpo auto 
        this.objCar.draw(gl,programInfo);
        
        // ruota posteriore D
        this.obj_real_wheel.mMatrix=m4.copy(this.objCar.mMatrix);
        this.obj_real_wheel.translate(
            inverse*this.posRel_ruote_posteriori.x,
            this.posRel_ruote_posteriori.y,
            this.posRel_ruote_posteriori.z
            );
        this.obj_real_wheel.rotate(this.mozzoP,"x");
        this.obj_real_wheel.draw(gl,programInfo);

         // ruota posteriore S
         this.obj_real_wheel.mMatrix=m4.copy(this.objCar.mMatrix);
         this.obj_real_wheel.translate( 
             inverse*-this.posRel_ruote_posteriori.x,
             this.posRel_ruote_posteriori.y,
             this.posRel_ruote_posteriori.z
             );
         this.obj_real_wheel.rotate(180,"y");
         this.obj_real_wheel.rotate(-this.mozzoP,"x");
         this.obj_real_wheel.draw(gl,programInfo);

        // ruota anteriore D
        this.obj_real_wheel.mMatrix=m4.copy(this.objCar.mMatrix);
        this.obj_real_wheel.translate(inverse*this.posRel_ruote_ateriori.x,this.posRel_ruote_ateriori.y,this.posRel_ruote_ateriori.z);
        this.obj_real_wheel.rotate(this.sterzo,"y");
        this.obj_real_wheel.rotate(this.mozzoA,"x");
        this.obj_real_wheel.draw(gl,programInfo);

        // // ruota anteriore S
        this.obj_real_wheel.mMatrix=m4.copy(this.objCar.mMatrix);
        this.obj_real_wheel.translate( inverse*-this.posRel_ruote_ateriori.x,this.posRel_ruote_ateriori.y,this.posRel_ruote_ateriori.z);
        
        

        this.obj_real_wheel.rotate(180,"y");
        this.obj_real_wheel.rotate(this.sterzo,"y");
        this.obj_real_wheel.rotate(-this.mozzoA,"x");
        this.obj_real_wheel.draw(gl,programInfo);

        
        //----------------------------------------------------------------
     
        // faro anteriore destro (proiezione)
        var tempM_fari =  m4.copy(this.objCar.mMatrix);
        tempM_fari=m4.translate(tempM_fari,this.posRel_faro_ad.x,this.posRel_faro_ad.y,this.posRel_faro_ad.z);           
        this.lightWorldMatrix.src_ad=  transformVector3(tempM_fari,[0.0,0.0,0.0]);  
        var faro_dst = transformVector3(tempM_fari,this.fari_dest);
        this.lightWorldMatrix.ad = m4.lookAt(
            this.lightWorldMatrix.src_ad,          // position
            faro_dst, // target
            [0.0, 1.0, 0.0],             // up
        );
        // faro anteriore destro (faro superficie)
        //inverto dunque la luce proiettandola anche all'indietro
        faro_dst = transformVector3(tempM_fari,this.fari_sup_dest_anteriore);
        this.lightWorldMatrix.src_ad_sup=faro_dst;
        this.lightWorldMatrix.ad_sup = m4.lookAt(
            faro_dst,          // position
            this.lightWorldMatrix.src_ad, // target
            [0.0, 1.0, 0.0],             // up
        );

        // faro anteriore sinistro (proiezione)
        tempM_fari =  m4.copy(this.objCar.mMatrix);
        tempM_fari=m4.translate(tempM_fari,this.posRel_faro_as.x,this.posRel_faro_as.y,this.posRel_faro_as.z);   
        this.lightWorldMatrix.src_as=  transformVector3(tempM_fari,[0.0,0.0,0.0]); 
        faro_dst = transformVector3(tempM_fari,this.fari_dest); 
        this.lightWorldMatrix.as = m4.lookAt(
            this.lightWorldMatrix.src_as,          // position
            faro_dst, // target
            [0.0, 1.0, 0.0],             // up
        );            
        // faro anteriore sinistro (faro superficie)
        //inverto dunque la luce proiettandola anche all'indietro
        faro_dst = transformVector3(tempM_fari,this.fari_sup_dest_anteriore);
        this.lightWorldMatrix.src_as_sup=faro_dst;
        this.lightWorldMatrix.as_sup = m4.lookAt(
            faro_dst,          // position
            this.lightWorldMatrix.src_as, // target
            [0.0, 1.0, 0.0],             // up
        );

        // faro posteriore  destro (faro superficie)
        //inverto dunque la luce proiettandola anche all'indietro
        tempM_fari =  m4.copy(this.objCar.mMatrix);
        tempM_fari=m4.translate(tempM_fari,this.posRel_faro_pd.x,this.posRel_faro_pd.y,this.posRel_faro_pd.z);   
        this.lightWorldMatrix.src_pd=  transformVector3(tempM_fari,[0.0,0.0,0.0]); 
        faro_dst = transformVector3(tempM_fari,this.fari_sup_dest_posteriore);
        this.lightWorldMatrix.src_pd_sup=faro_dst;
        this.lightWorldMatrix.pd_sup = m4.lookAt(
            faro_dst,          // position
            this.lightWorldMatrix.src_pd, // target
            [0.0, 1.0, 0.0],             // up
        );

        // faro posteriore sinistro (faro superficie)
        //inverto dunque la luce proiettandola anche all'indietro
        tempM_fari =  m4.copy(this.objCar.mMatrix);
        tempM_fari=m4.translate(tempM_fari,this.posRel_faro_ps.x,this.posRel_faro_ps.y,this.posRel_faro_ps.z);   
        this.lightWorldMatrix.src_ps=  transformVector3(tempM_fari,[0.0,0.0,0.0]); 
        faro_dst = transformVector3(tempM_fari,this.fari_sup_dest_posteriore);
        this.lightWorldMatrix.src_ps_sup=faro_dst;
        this.lightWorldMatrix.ps_sup = m4.lookAt(
            faro_dst,          // position
            this.lightWorldMatrix.src_ps, // target
            [0.0, 1.0, 0.0],             // up
        );

        this.lightProjectionMatrix = this.perspective
        ? m4.perspective(
            degToRad(this.fieldOfView_A),
            this.projWidth / this.projHeight,
            0.5,  // near
            10)   // far
        : m4.orthographic(
            -this.projWidth / 2,   // left
            this.projWidth / 2,   // right
            -this.projHeight / 2,  // bottom
            this.projHeight / 2,  // top
             0.5,                      // near
             10);     
  
    }   
    
    active(enable,timeout=10){
        if(enable){
            this.myInterval=setInterval(this.CarDoStep ,timeout);
        }else{
            if(this.myInterval!==null){
                clearInterval(this.myInterval);                    
                this.myInterval=null;
            }
        }
    }
    createTexture(gl){
        this.objCar.createTexture(gl);
        this.obj_real_wheel.createTexture(gl);
    }


    CarInit(x=0,y=0,z=0,o=0){
        // inizializzo lo stato della macchina
        this.px=x;
        this.py=y;
        this.pz=z;
        this.facing=o; // posizione e orientamento
        this.mozzoA=0;
        this.mozzoP=0;
        this.sterzo=0;   // stato
        this.vx=0;
        this.vy=0;
        this.vz=0;      // velocita' attuale
        // inizializzo la struttura di controllo
        this.key=[false,false,false,false,false];
       
        this.velSterzo=2.1;         // A
        //  velSterzo=2.26;       // A
        this.velRitornoSterzo=0.93  ; // B, sterzo massimo = A*B / (1-B)
        
        this.accMax = 0.004;
        //accMax = 0.0055;
       
        // attriti: percentuale di velocita' che viene mantenuta
        // 1 = no attrito
        // <<1 = attrito grande
        this.attritoZ = 0.99;  // piccolo attrito sulla Z (nel senso di rotolamento delle ruote)
        this.attritoX = 0.84;  // grande attrito sulla X 0.8
        this.attritoY = 1.0;  // attrito sulla y nullo
        //attrito dopo il freno a mano
        this.driftX =this.attritoX;
        this.driftZ =this.attritoZ;
        // Nota: vel max = accMax*attritoZ / (1-attritoZ)       
     
      
        this.grip = 0.45; // quanto il facing macchina si adegua velocemente allo sterzo
    }

    // DoStep: facciamo un passo di fisica (a delta-t costante)
    //
    // Indipendente dal rendering.
    CarDoStep(){
        // computiamo l'evolversi della macchina
       
        var vxm, vym, vzm; // velocita' in spazio macchina
       
        // da vel frame mondo a vel frame macchina
        var cosf = Math.cos(this.facing*Math.PI/180.0);
        var sinf = Math.sin(this.facing*Math.PI/180.0);
        vxm = +cosf*this.vx - sinf*this.vz;
        vym = this.vy;
        vzm = +sinf*this.vx + cosf*this.vz;
       
        // gestione dello sterzo
        if (this.key[1]) this.sterzo+=this.velSterzo;
        if (this.key[3]) this.sterzo-=this.velSterzo;
        this.sterzo*=this.velRitornoSterzo; // ritorno a volante fermo
       
        if (this.key[0])vzm-=this.accMax; // accelerazione in avanti
        if (this.key[2])vzm+=this.accMax;// accelerazione indietro        
        this.frenataOn=this.key[2] || this.key[4];//luce frenata

        var inverti =1;
        //attriti
        if(this.key[4]){
            //diminuisco l'attrito, dato che l'auto perde aderenza
            this.driftX+=0.0008;
            this.driftZ+=0.0003;
            //rallento anche un pò l'auto se sto andando in avanti
            vzm+=3*this.accMax/2;
            if(vzm>0){ 
                vzm=0;
                inverti=-1;
            }
        }else{
              //l'attrito aumenta di nuovo 
              this.driftX-=0.01;
              this.driftZ-=0.002;            
        }
        //val massimi
        if(this.driftX>this.attritoX+0.02){
            this.driftX=this.attritoX+0.02;
        } 
        if(this.driftZ>this.attritoZ+0.005){
            this.driftZ=this.attritoZ+0.005;
        }
        if(this.driftX<this.attritoX){
            this.driftX=this.attritoX;
          } 
         if(this.driftZ<this.attritoZ){ 
            this.driftZ=this.attritoZ;
          }
        const attrito_mod = (this.driftOn ? (this.attritoX +0.1): this.attritoX)
        this.velSterzo= (this.driftOn ? (2.1): 1.3)
        vxm*=attrito_mod+inverti*this.driftX*Math.abs(this.sterzo)/1800; 
        vym*=this.attritoY;
        vzm*=this.driftZ;
      
        // l'orientamento della macchina segue quello dello sterzo
        // (a seconda della velocita' sulla z)
        this.facing = this.facing - (vzm*this.grip)*this.sterzo;
       
        // rotazione mozzo ruote (a seconda della velocita' sulla z)
        var da ; //delta angolo
        da=(180.0*vzm)/(Math.PI*this.raggioRuotaA);
        this.mozzoA+=da;
        da=(180.0*vzm)/(Math.PI*this.raggioRuotaP);
        this.mozzoP+=da;
       
        // ritorno a vel coord mondo
        this.vx = +cosf*vxm + sinf*vzm;
        this.vy = vym;
        this.vz = -sinf*vxm + cosf*vzm;
       
        // posizione = posizione + velocita * delta t (ma e' delta t costante)
        this.px+=this.vx;
        this.py+=this.vy;
        this.pz+=this.vz;

        //controllo se la modalità della camera è quella del mondo o quella sull'auto
        if(this.callbackCameraAuto!==null){
            this.callbackCameraAuto(this.px,this.py,this.pz,this.facing);
        }

      }
  
      enableKeyboard(enable){
            if(enable){
                window.addEventListener('keydown', this.doKeyDown, true);
                window.addEventListener('keyup', this.doKeyUp, true);
            }else{
                window.removeEventListener('keydown', this.doKeyDown);
                window.removeEventListener('keyup', this.doKeyUp);
            }
      }
       doKeyDown(e){
                //====================
                // THE W KEY
                //====================
                if (e.keyCode == 87) this.key[0]=true;
                //====================
                // THE S KEY
                //====================
                if (e.keyCode == 83) this.key[2]=true;
                //====================
                // THE A KEY
                //====================
                if (e.keyCode == 65) this.key[1]=true;
                //====================
                // THE D KEY
                //====================
                if (e.keyCode == 68) this.key[3]=true;
                // THE SPACE KEY
                //====================
                if (e.keyCode == 32) this.key[4]=true;
                

        }
        doKeyUp(e){
            
                //====================
                // THE W KEY
                //====================
                if (e.keyCode == 87) this.key[0]=false;
                //====================
                // THE S KEY
                //====================
                if (e.keyCode == 83) this.key[2]=false;
                //====================
                // THE A KEY
                //====================
                if (e.keyCode == 65) this.key[1]=false;
                //====================
                // THE D KEY
                //====================
                if (e.keyCode == 68) this.key[3]=false;
                // THE SPACE KEY
                //====================
                if (e.keyCode == 32) this.key[4]=false;
        }


        enableThouch(enable, canvas){
            if(enable){
                canvas.addEventListener("touchstart", this.touchstart);         
                canvas.addEventListener("touchmove", this.touchmove);                
                canvas.addEventListener("touchend", this.handleEnd);
            }else{
                canvas.removeEventListener('touchstart', this.touchstart);
                canvas.removeEventListener('touchmove', this.touchmove);                              
                canvas.removeEventListener("touchend", this.handleEnd);
            }
         }
        handleEnd(e){            
            e.preventDefault();
            this.touchStartPoint=null;
            this.key[1]=false;
            this.key[3]=false;
            this.key[0]=false;
            this.key[2]=false;            
            this.key[4]=false;
        }
        touchstart(e){            
            e.preventDefault();
            this.touchStartPoint={};
            this.touchStartPoint.x=e.changedTouches[0].pageX;
            this.touchStartPoint.y=e.changedTouches[0].pageY;
        }
        touchmove(e){              
            if(this.touchStartPoint!==null){                
                e.preventDefault();
                const x=e.changedTouches[0].pageX;
                const y=e.changedTouches[0].pageY;
                const w_s = this.touchStartPoint.y-y;                
                const a_d = this.touchStartPoint.x-x;
                //------------------------------
                // //====================
                // // THE W KEY
                // this.key[0];
                // //====================
                // // THE S KEY
                // this.key[2];
                // //====================
                // // THE A KEY
                // this.key[1];
                // //====================
                // // THE D KEY
                // this.key[3]; 
                // //====================
                // // THE SPACE KEY
                // this.key[4];
                //------------------------------
                if (e.keyCode == 68) this.key[3]=true;
                if(Math.abs(w_s)>this.tolleranceTouch){
                    if(w_s>0){
                        this.key[0]=true;
                        this.key[2]=false;
                    }else{
                        this.key[0]=false;
                        this.key[2]=true;
                    }
                }else{
                    this.key[0]=false;
                    this.key[2]=false;
                }
                if(Math.abs(a_d)>this.tolleranceTouch){
                    if(a_d>0){
                        this.key[1]=true;
                        this.key[3]=false;
                    }else{
                        this.key[1]=false;
                        this.key[3]=true;
                    }
                }else{
                    this.key[1]=false;
                    this.key[3]=false;
                }
            }  
           
        }



        setLigths(programInfo){
            
            var red_frenata = 0.3;
            if(this.frenataOn){
                red_frenata=1.0;
            }
            if(this.lightWorldMatrix.ad===undefined || this.lightWorldMatrix.as===undefined){
                webglUtils.setUniforms(programInfo, {
                    u_lightWorldPosition_AD:this.lightWorldMatrix.src_ad,                  
                    u_lightWorldPosition_AS:this.lightWorldMatrix.src_as,   
                    u_lightWorldPosition_AD_sup:this.lightWorldMatrix.src_ad_sup,                
                    u_lightWorldPosition_AS_sup:this.lightWorldMatrix.src_as_sup,                     
                    u_lightWorldPosition_PD_sup:this.lightWorldMatrix.src_pd_sup,                
                    u_lightWorldPosition_PS_sup:this.lightWorldMatrix.src_ps_sup, 
                    u_shininess_A:150,
                    u_lightColor_A: [0.2, 0.2, 0.2, 1.0],                    
                    u_lightColor_P: [0.5, 0.2, 0.2, 1.0],
                    u_specularColor_A : [red_frenata, 1.0, 1.0],
                    u_lightDirection_AD:this.lightWorldMatrix.src_ad,                
                    u_lightDirection_AS:this.lightWorldMatrix.src_as,
                    u_lightDirection_AD_sup:this.lightWorldMatrix.src_ad_sup,                
                    u_lightDirection_AS_sup:this.lightWorldMatrix.src_as_sup,                    
                    u_lightDirection_PD_sup:this.lightWorldMatrix.src_pd_sup,                
                    u_lightDirection_PS_sup:this.lightWorldMatrix.src_ps_sup,
                    u_innerLimit_A: Math.cos(degToRad(this.fieldOfView_A / 2 - 10)),
                    u_outerLimit_A: Math.cos(degToRad(this.fieldOfView_A / 2))
                  });       
            }else{
                webglUtils.setUniforms(programInfo, {
                    u_lightWorldPosition_AD:this.lightWorldMatrix.src_ad,                  
                    u_lightWorldPosition_AS:this.lightWorldMatrix.src_as,  
                    u_lightWorldPosition_AD_sup:this.lightWorldMatrix.src_ad_sup,                
                    u_lightWorldPosition_AS_sup:this.lightWorldMatrix.src_as_sup,                                     
                    u_lightWorldPosition_PD_sup:this.lightWorldMatrix.src_pd_sup,                
                    u_lightWorldPosition_PS_sup:this.lightWorldMatrix.src_ps_sup, 
                    u_shininess_A:50,
                    u_lightColor_A: [1.0, 1.0, 1.0, 1.0],
                    u_specularColor_A : [0.1, 0.1, 0.1],                                 
                    u_lightColor_P: [red_frenata, 0.0, 0.0, 1.0],
                    u_lightDirection_AD:this.lightWorldMatrix.ad.slice(8, 11).map(v => -v),                
                    u_lightDirection_AS:this.lightWorldMatrix.as.slice(8, 11).map(v => -v),
                    u_lightDirection_AD_sup:this.lightWorldMatrix.ad_sup.slice(8, 11).map(v => -v),                
                    u_lightDirection_AS_sup:this.lightWorldMatrix.as_sup.slice(8, 11).map(v => -v),                    
                    u_lightDirection_PD_sup:this.lightWorldMatrix.pd_sup.slice(8, 11).map(v => -v),                
                    u_lightDirection_PS_sup:this.lightWorldMatrix.ps_sup.slice(8, 11).map(v => -v),
                    u_innerLimit_A: Math.cos(degToRad(this.fieldOfView_A / 2 - 10)),
                    u_outerLimit_A: Math.cos(degToRad(this.fieldOfView_A / 2))
                  });
            }
       
        }


        drawFrustum(gl,cameraMatrix,colorProgramInfo,projectionMatrix,cubeLinesBufferInfo){
             //----------------------------------------------SOLO DELLE PROIEZIONI SUL TERRENO DEI FARI DAVANTI
            
            const viewMatrix = m4.inverse(cameraMatrix); 
            //--------------------------FARO DESTRA        
            gl.useProgram(colorProgramInfo.program);                  
            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);                  
            // scale the cube in Z so it's really long
            // to represent the texture is being projected to
            // infinity
            const mat_d = m4.multiply(this.lightWorldMatrix.ad, m4.inverse( this.lightProjectionMatrix));        
            // Set the uniforms we just computed
            webglUtils.setUniforms(colorProgramInfo, {
              u_color: [0, 0, 1, 1],
              u_view: viewMatrix,
              u_projection: projectionMatrix,
              u_world: mat_d,
            });                  
            // calls gl.drawArrays or gl.drawElements
            webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
             //--------------------------FARO SINISTRA 
   
             gl.useProgram(colorProgramInfo.program);                  
             webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);           
             const mat_s = m4.multiply(this.lightWorldMatrix.as, m4.inverse( this.lightProjectionMatrix));      
             webglUtils.setUniforms(colorProgramInfo, {
               u_color: [0, 0, 1, 1],
               u_view: viewMatrix,
               u_projection: projectionMatrix,
               u_world: mat_s
             });                  
             webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
             webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
        }


        getLightProjectionMatrixs(){
            if(this.lightWorldMatrix.ad===undefined || this.lightWorldMatrix.as===undefined ||  this.lightProjectionMatrix===undefined){
                return [];
            }
            const ris = [];
            ris.push(this.lightProjectionMatrix);            
            ris.push(this.lightProjectionMatrix);
            ris.push(this.lightProjectionMatrix);            
            ris.push(this.lightProjectionMatrix);            
            ris.push(this.lightProjectionMatrix);            
            ris.push(this.lightProjectionMatrix);
            return ris;
        }           
        getLightWorldMatrixs(){
            if(this.lightWorldMatrix.ad===undefined || this.lightWorldMatrix.as===undefined ||  this.lightProjectionMatrix===undefined){
                return [];
            }            
            const ris = [];
            ris.push(this.lightWorldMatrix.ad);            
            ris.push(this.lightWorldMatrix.as);
            ris.push(this.lightWorldMatrix.ad_sup);            
            ris.push(this.lightWorldMatrix.as_sup);            
            ris.push(this.lightWorldMatrix.pd_sup);            
            ris.push(this.lightWorldMatrix.ps_sup);
            return ris;
        }
        getLightCount(){
           return 6; //2 proiezioni sulle superifici e 4 contro l'auto per illuminare i fari
        }


        //chiamabile in ogni momenti per la rotazione
        rotate(y){
           this.facing=y;
        }


        translate(x,y,z){
            this.px=x;
            this.py=y;
            this.pz=z;
        }

}