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
        function ProcessControlBlock(processId, segment, priority, status, position, Acc, IR, Xreg, Yreg, Zflag, turnaroundTime, waitTime) {
            if (priority === void 0) { priority = 0; }
            if (status === void 0) { status = "Ready"; }
            if (position === void 0) { position = 0; }
            if (Acc === void 0) { Acc = "0"; }
            if (IR === void 0) { IR = "0"; }
            if (Xreg === void 0) { Xreg = "0"; }
            if (Yreg === void 0) { Yreg = "0"; }
            if (Zflag === void 0) { Zflag = "0"; }
            if (turnaroundTime === void 0) { turnaroundTime = 0; }
            if (waitTime === void 0) { waitTime = 0; }
            this.processId = processId;
            this.segment = segment;
            this.priority = priority;
            this.status = status;
            this.position = position;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.turnaroundTime = turnaroundTime;
            this.waitTime = waitTime;
        }
        ProcessControlBlock.prototype.init = function () {
            this.status = "Ready";
            this.position = 0;
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";
            this.turnaroundTime = 0;
            this.waitTime = 0;
        };
        //update the values within the process control block
        ProcessControlBlock.prototype.updateValues = function (status, pc, acc, ir, xreg, yreg, zflag) {
            this.status = status;
            this.position = pc;
            this.Acc = acc;
            this.IR = ir;
            this.Xreg = xreg;
            this.Yreg = yreg;
            this.Zflag = zflag;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
