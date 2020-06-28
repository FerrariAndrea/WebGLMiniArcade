
class GameBehavior{

    constructor(car){

        //binds
        this.updateGameStatus=this.updateGameStatus.bind(this);
        this.forceReset =this.forceReset.bind(this);

        //il tempo di una partita
        this.max_time = 60*2;
        //tempo attuale
        this.time= 60*2;
        //il punteggio attuale
        this.score=0;

        //colori per il pannello grafico del punteggio e del tempo
        this.score_color="DarkRed";
        this.time_color ="Green";

        //l'oggetto 3D dell'auto con tutti i suoi controlli e la sua fisica
        this.car = car;
        
        this.intervall = setInterval(this.updateGameStatus,1000); //ogni secondo

        
    }

    updateGameStatus(){
        if(this.car.isGameStarted){
            //se il gioco è partito, è in corso

            //decremento il tempo
            this.time--;
            if(this.time<=0){
                this.time=0;
                //fermo il gioco visualizzando un alert con il punteggio
                alert("Complimenti :) \n Il tuo punteggio: "+ this.score);
                //resetto l'auto, il punteggio e il tempo
                this.time= this.max_time;
                this.score=0;
                this.car.CarInit();
            }else{
                //aggiorno il punteggio in base alla modalità race (velocità) o drift (grado di inclinazione dell'auto)
                //il punteggio viene calcolato dal doStep della macchina
                this.score = Math.round(this.car.punteggio);                
            }
            //colori tabellone
            if(this.time>60){
                this.time_color ="Green";
            }else if(this.time>30){
                this.time_color ="DarkOrange";
            }else{
                this.time_color ="DarkRed";
            }
            if(this.score>2000){
                this.score_color ="Green";
            }else if(this.score>500){
                this.score_color ="DarkOrange";
            }else{
                this.score_color ="DarkRed";
            }

        }
    }

    forceReset(){
        //serve se durante una partita l'utente cambia modalità di gioco 
        var testo = "Race";
        if(this.car.driftOn){
            testo="Drift";
        }
        alert("Hai cambiato il tipo di sfida in: "+testo );
        this.time= this.max_time;
        this.score=0;
        this.score_color="DarkRed";
        this.time_color ="Green";
        this.car.CarInit();
    }

}


