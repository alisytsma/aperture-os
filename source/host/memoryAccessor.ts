///<reference path="../globals.ts" />

/* ------------
     MemoryAccessor.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {

        constructor() {

        }

        public init(): void {

        }

        public static runProgram(processId: number): void {
            var program = _Kernel.readyQueue[processId];
            program.status = "Running";
            console.log("Process: " + _Kernel.readyQueue[processId]);
            TSOS.Control.updatePCB(program.processId, program.status, program.PC, program.Acc, program.IR, program.Xreg, program.Yreg, program.Zflag);
            console.log("Memory: " + _Memory.memArray);
            for(var i = 0; i < 32; i++){
                for(var j = 0; j < 9; j++){
                    console.log(_Memory.memArray[i][j]);
                    _CPU.opCodes(_Memory.memArray[i][j], i, j, program.processId, program.status);
                }
            }
        }
    }

}
