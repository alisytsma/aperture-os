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
        public static cycleCount = 0;

        public static roundRobin():void {

            //get the current running program
            if(_Kernel.runningQueue.length > 1) {

                //loop amount of times set
                /* for (this.i = 0; this.cycleCount < _CPU.quantum; this.i++) {
                     continue;
                 }*/

                if (this.cycleCount >= _CPU.quantum) {
                    //if we can move to the next program, do so
                    if (_Kernel.runningQueue.length > _CPU.runningPID + 1) {
                        //set current program status as ready
                        _CPU.program.status = "Ready";
                        //move to next program
                        _CPU.runningPID++;
                        _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                        //context switch interrupt
                        if (_CPU.program != null)
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH, _CPU.program.processId));

                    } else if (_Kernel.runningQueue.length >= 1) { //otherwise, if there's another program go back to 0
                        //set current program status as ready
                        _CPU.program.status = "Ready";
                        //move to first program
                        _CPU.runningPID = _Kernel.runningQueue[0].processId;
                        _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                        //context switch interrupt
                        if (_CPU.program != null)
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH, _CPU.program.processId));

                } else {
                    _CPU.program = _Kernel.runningQueue[0];
                }
                    this.cycleCount = 0;
            }

                console.log(this.cycleCount++);
                this.cycleCount++;


            }
        }

        public static contextSwitch(params){
            _Kernel.krnTrace("Switching to process " + params);

        }

    }

}
