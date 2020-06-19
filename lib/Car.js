class Car{

    constructor(obj_car,obj_wheel){
            //binds
            this.draw=this.draw.bind(this); 
            this.CarInit=this.CarInit.bind(this);
            this.CarDoStep=this.CarDoStep.bind(this);
            this.enableKeyboard=this.enableKeyboard.bind(this);
            this.doKeyUp=this.doKeyUp.bind(this);
            this.doKeyDown=this.doKeyDown.bind(this);
            this.createTexture=this.createTexture.bind(this);
            this.active=this.active.bind(this);
            this.isReady=function(){
                //pronto quando sia la scocca che la ruota sono stae caricate (obj e texture)
                return obj_car.isReady() && obj_wheel.isReady();
            }
            //------------------------------------------------geometria auto
            this.objCar = obj_car;
            this.obj_real_wheel=obj_wheel;
            
            //invece di generare 4 ruote distinte, clono la stessa ruota per riferimento, tenendo separati solo
            //la mMatrix e l'array di colore
            this.obj_clone1_wheel=new Obj3DClone(obj_wheel);            
            this.obj_clone2_wheel=new Obj3DClone(obj_wheel);
            this.obj_clone3_wheel=new Obj3DClone(obj_wheel);


            //---------------------------------------------------fisica auto
            // STATO DELLA MACCHINA
            // (DoStep fa evolvere queste variabili nel tempo)
            // this.px,this.py,this.pz,this.facing; // posizione e orientamento
            // this.mozzoA, this.mozzoP, this.sterzo; // stato interno
            // this.vx,this.vy,this.vz; // velocita' attuale

            // // queste di solito rimangono costanti
            // this.velSterzo, velRitornoSterzo, accMax, attrito,
            // raggioRuotaA, raggioRuotaP, grip,
            // attritoX, attritoY, attritoZ; // attriti

            // //controlli
            // this.key;
            this.CarInit();
            this.myInterval=null;
            this.enableKeyboard(true);
            this.active(true);

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


    draw(gl,programInfo){
        //sposto l'auto
        this.objCar.mMatrix=m4.identity(); 
        this.objCar.translate(this.px,this.py,this.pz);        
        this.objCar.rotate(this.facing,"y");
        //disegno corpo auto 
        this.objCar.draw(gl,programInfo);

    }

    
    CarInit(){
        // inizializzo lo stato della macchina
        this.px=0;
        this.py=0;
        this.pz=0;
        this.facing=0; // posizione e orientamento
        this.mozzoA=0;
        this.mozzoP=0;
        this.sterzo=0;   // stato
        this.vx=0;
        this.vy=0;
        this.vz=0;      // velocita' attuale
        // inizializzo la struttura di controllo
        this.key=[false,false,false,false];
       
        this.velSterzo=3.4;         // A
        //  velSterzo=2.26;       // A
        this.velRitornoSterzo=0.93; // B, sterzo massimo = A*B / (1-B)
        
        this.accMax = 0.0011;
        //accMax = 0.0055;
       
        // attriti: percentuale di velocita' che viene mantenuta
        // 1 = no attrito
        // <<1 = attrito grande
        this.attritoZ = 0.991;  // piccolo attrito sulla Z (nel senso di rotolamento delle ruote)
        this.attritoX = 0.8;  // grande attrito sulla X (per non fare slittare la macchina)
        this.attritoY = 1.0;  // attrito sulla y nullo
      
        // Nota: vel max = accMax*attritoZ / (1-attritoZ)
       
        this.raggioRuotaA = 0.25;
        this.raggioRuotaP = 0.30;
      
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
       
        if (this.key[0]) vzm-=this.accMax; // accelerazione in avanti
        if (this.key[2]) vzm+=this.accMax; // accelerazione indietro
       
        // attriti (semplificando)
        vxm*=this.attritoX; 
        vym*=this.attritoY;
        vzm*=this.attritoZ;
      
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
        }

}