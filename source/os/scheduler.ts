///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />


/* ------------
     Scheduler.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class Scheduler {

        public static roundRobin(){

            //get the current running program
            var currentProgram = _Kernel.runningQueue.indexOf(_CPU.program);
            while(_Kernel.runningQueue.length > 1){
                for(var i = 0; i < _CPU.quantum; i++){
                    _CPU.cycle();
                }
                if(_Kernel.runningQueue.length > currentProgram + 1)
                    _CPU.program = _Kernel.runningQueue[currentProgram + 1];
                else
                    _CPU.program = _Kernel.runningQueue[0];
            }

        }

    }

}
