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
            while(_Kernel.runningQueue.length > 1){
                for(this.i = 0; this.i < _CPU.quantum; this.i++){
                    _CPU.cycle();
                }
                _CPU.program.status = "Ready";
                console.log("Length: " + _Kernel.runningQueue.length + " +1:" + (parseInt(_CPU.program.processId) + 1));
                if(_Kernel.runningQueue.length > parseInt(_CPU.program.processId) + 1) {
                    _CPU.program = _Kernel.readyQueue[parseInt(_CPU.program.processId) + 1];
                } else if(_Kernel.runningQueue.length >= 1){
                    _CPU.program = _Kernel.readyQueue[_Kernel.runningQueue[0].processId];
                }
                if(_CPU.program.position >= TSOS.MemoryAccessor.memoryLength()){
                    _CPU.terminateProgram();
                }
            }

           _CPU.terminateOS();


        }

    }

}
