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
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(processId, status, PC, Acc, IR, Xreg, Yreg, Zflag) {
            if (status === void 0) { status = "Ready"; }
            if (PC === void 0) { PC = "0"; }
            if (Acc === void 0) { Acc = "0"; }
            if (IR === void 0) { IR = "0"; }
            if (Xreg === void 0) { Xreg = "0"; }
            if (Yreg === void 0) { Yreg = "0"; }
            if (Zflag === void 0) { Zflag = "0"; }
            this.processId = processId;
            this.status = status;
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
        ProcessControlBlock.prototype.init = function () {
            this.status = "Ready";
            this.PC = "0";
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";
            TSOS.Control.updatePCB(this.processId, this.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
