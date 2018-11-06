///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />


/* ------------
     Scheduler.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class Scheduler {

        public static i = 0;

        public static roundRobin():void {

            //get the current running program
            if(_Kernel.runningQueue.length > 1){

                //loop amount of times set
                for(this.i = 0; this.i < _CPU.quantum; this.i++){
                    console.log("Program: " + _CPU.program.processId + " i: " + this.i);
                    _CPU.cycle();
                }

                if (_Kernel.runningQueue.length > _CPU.runningPID + 1) {
                    _CPU.program.status = "Ready";
                    //find the location of the current process in the running queue, then return that process id + 1
                    _CPU.runningPID ++;
                    _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                } else if (_Kernel.runningQueue.length >= 1) {
                    _CPU.runningPID = _Kernel.runningQueue[0].processId;
                    _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                }
            }

           //_CPU.terminateOS();


        }

    }

}
