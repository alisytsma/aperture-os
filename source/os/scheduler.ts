///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/interrupt.ts" />


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
                    _CPU.cycle();
                }

                //if we can move to the next program, do so
                if (_Kernel.runningQueue.length > _CPU.runningPID + 1) {
                    //set current program status as ready
                    _CPU.program.status = "Ready";
                    //move to next program
                    _CPU.runningPID ++;
                    _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                    //context switch interrupt
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH, _CPU.runningPID));

                } else if (_Kernel.runningQueue.length >= 1) { //otherwise, if there's another program go back to 0
                    //set current program status as ready
                    _CPU.program.status = "Ready";
                    //move to first program
                    _CPU.runningPID = _Kernel.runningQueue[0].processId;
                    _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                    //context switch interrupt
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH, _CPU.runningPID));
                }
            }
        }

        public contextSwitch(params){
            _Kernel.krnTrace("Switching to process " + params);

        }

    }

}
