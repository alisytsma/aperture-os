///<reference path="../globals.ts" />

/* ------------
     CPU.ts

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

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public IR: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.IR = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;

            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);

        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        }

        public opCodes(opcode: string): void {

            switch(opcode){
                case "A9":


            }
            //A9 - load acc with const, 1 arg
            //AD - load from mem, 2 arg
            //8D - store acc in mem, 2 arg
            //6D - add with carry, 2 arg
            //A2 - load x reg with constant, 1 arg
            //AE - load x reg from mem, 2 arg
            //A0 - load y reg with const, 1 arg
            //AC - load y reg from mem. 2 arg
            //EA - no op, 0 arg
            //00 - break, 0 arg
            //EC - compare a byte in mem to the x reg, 2 arg
            //D0 - branch n bytes if z flag = 0, 1 arg
            //EE - increment the value of a byte, 2 args
            //FF - system call
        }
    }
}
