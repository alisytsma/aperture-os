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

        constructor(public processId: string,
                    public status: string = "Ready",
                    public PC: number = 0,
                    public Acc: string = "0",
                    public IR: string = "0",
                    public Xreg: string = "0",
                    public Yreg: string = "0",
                    public Zflag: string = "0") {
        }

        public init(): void {
            this.status = "Ready";
            this.PC = 0;
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";

            TSOS.Control.updatePCB(this.processId, this.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        }

    }
}
