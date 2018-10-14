///<reference path="../globals.ts" />

/* ------------
     ProcessManager.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class ProcessManager {

        public static readyQueue = [];

        constructor() {

        }

        public init(): void {

        }

        public createNewProcess(pid: string, status: string, PC: string, acc: string, IR: string, xReg: string, yReg: string, zFlag: string): void {
            //var newProcess = new _ProcessControlBlock(pid, status, PC, acc, IR, xReg, yReg, zFlag);
           // _ProcessControlBlock.init();
            document.getElementById("pcbPID").innerHTML = pid;
            document.getElementById("pcbStatus").innerHTML = status;
            document.getElementById("pcbPC").innerHTML = PC;
            document.getElementById("pcbAcc").innerHTML = acc;
            document.getElementById("pcbIR").innerHTML = IR;
            document.getElementById("pcbXreg").innerHTML = xReg;
            document.getElementById("pcbYreg").innerHTML = yReg;
            document.getElementById("pcbZflag").innerHTML = zFlag;
            //console.log("Process: " + newProcess.toString());
        }
    }
}
