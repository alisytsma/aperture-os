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

        constructor(public PC: string = "0",
                    public Acc: string = "0",
                    public IR: string = "0",
                    public Xreg: string = "0",
                    public Yreg: string = "0",
                    public Zflag: string = "0",
                    public isExecuting: boolean = false) {
        }

        public init(): void {
            this.PC = "0";
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";
            this.isExecuting = false;

            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);

        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        }

        public opCodes(input: string, column: number, row: number, pid: string, status: string): void {
            console.log("Case: " + input);
            var arg = "00";

            switch(input){
                //A9 - load acc with const, 1 arg
                case "A9":
                    if(row < 7) {
                        arg = _Memory.memArray[column][row + 1];
                    } else {
                        row = 0;
                        arg = _Memory.memArray[column][row + 1];
                    }
                    this.Acc = arg;
                    TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
                    TSOS.Control.updatePCB(pid, status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
                    console.log("Program: " + input + arg);
                    break;
                //AD - load from mem, 2 arg
                case "AD":
                    console.log("Code AD");
                    break;
                case "8D":
                    console.log("Code 8D");
                    break;
                case "6D":
                    console.log("Code 6D");
                    break;
                case "A2":
                    console.log("Code A2");
                    break;
                case "AE":
                    console.log("Code AE");
                    break;
                case "A0":
                    console.log("Code A0");
                    break;
                case "AC":
                    console.log("Code AC");
                    break;
                case "EA":
                    console.log("Code EA");
                    break;
                case "00":
                    console.log("Code 00");
                    break;
                case "EC":
                    console.log("Code EC");
                    break;
                case "D0":
                    console.log("Code D0");
                    break;
                case "EE":
                    console.log("Code EE");
                    break;
                case "FF":
                    console.log("Code FF");
                    break;
            }
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
