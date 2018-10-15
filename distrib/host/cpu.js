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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, IR, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (IR === void 0) { IR = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.IR = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        };
        Cpu.prototype.opCodes = function (opcode) {
            switch (opcode) {
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
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
