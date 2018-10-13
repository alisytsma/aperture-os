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

            document.getElementById("PC").innerHTML = this.PC.toString();
            document.getElementById("Acc").innerHTML = this.Acc.toString();
            document.getElementById("IR").innerHTML = this.IR.toString();
            document.getElementById("Xreg").innerHTML = this.Xreg.toString();
            document.getElementById("Yreg").innerHTML = this.Yreg.toString();
            document.getElementById("Zflag").innerHTML = this.Zflag.toString();
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            document.getElementById("PC").innerHTML = this.PC.toString();
            document.getElementById("Acc").innerHTML = this.Acc.toString();
            document.getElementById("IR").innerHTML = this.IR.toString();
            document.getElementById("Xreg").innerHTML = this.Xreg.toString();
            document.getElementById("Yreg").innerHTML = this.Yreg.toString();
            document.getElementById("Zflag").innerHTML = this.Zflag.toString();

            //LDA - A9, AD
            //STA - 8D
        }
    }
}
