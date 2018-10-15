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
        }
    }

}
