///<reference path="../globals.ts" />

/* ------------
     ProcessControlBlock.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class ProcessControlBlock {

        constructor(public processId: number,
                    public status: string,
                    public PC: number,
                    public Acc: number,
                    public IR: number,
                    public Xreg: number,
                    public Yreg: number,
                    public Zflag: number) {
        }

        public init(): void {

            document.getElementById("pcbPID").innerHTML = this.processId.toString();
            document.getElementById("pcbStatus").innerHTML = this.status.toString();
            document.getElementById("pcbPC").innerHTML = this.PC.toString();
            document.getElementById("pcbAcc").innerHTML = this.Acc.toString();
            document.getElementById("pcbIR").innerHTML = this.IR.toString();
            document.getElementById("pcbXreg").innerHTML = this.Xreg.toString();
            document.getElementById("pcbYreg").innerHTML = this.Yreg.toString();
            document.getElementById("pcbZflag").innerHTML = this.Zflag.toString();
        }

    }
}
