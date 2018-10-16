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
            if (PC === void 0) { PC = "0"; }
            if (Acc === void 0) { Acc = "0"; }
            if (IR === void 0) { IR = "0"; }
            if (Xreg === void 0) { Xreg = "0"; }
            if (Yreg === void 0) { Yreg = "0"; }
            if (Zflag === void 0) { Zflag = "0"; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.positionRow = 0;
            this.positionCol = 0;
        }
        Cpu.prototype.init = function () {
            this.PC = "0";
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";
            this.isExecuting = false;
            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.program = _Kernel.readyQueue[this.runningPID];
            this.program.status = "Running";
            //console.log("Process: " + _Kernel.readyQueue[this.runningPID]);
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.program.PC, this.program.Acc, this.program.IR, this.program.Xreg, this.program.Yreg, this.program.Zflag);
            // console.log("Memory: " + _Memory.memArray);
            // console.log("Location: " + this.positionCol + "," + this.positionRow);
            _CPU.opCodes(_Memory.memArray[this.positionCol][this.positionRow], this.positionCol, this.positionRow, this.program.processId, this.program.status);
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            if (this.positionRow < 7) {
                this.positionRow++;
            }
            else {
                this.positionRow = 0;
                this.positionCol++;
            }
            if (this.positionRow >= 7 && this.positionCol >= 31) {
                this.terminateOS();
            }
        };
        Cpu.prototype.terminateOS = function () {
            this.program.status = "Terminated";
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            this.isExecuting = false;
            console.log("Terminate");
        };
        Cpu.prototype.opCodes = function (input, column, row, pid, status) {
            // console.log("Case: " + input);
            var arg;
            switch (input) {
                //A9 - load acc with const, 1 arg
                case "A9":
                    if (row < 7) {
                        arg = _Memory.memArray[column][row + 1];
                    }
                    else {
                        row = 0;
                        arg = _Memory.memArray[column + 1][row];
                    }
                    this.Acc = arg;
                    this.program.Acc = arg;
                    break;
                //AD - load from mem, 2 arg
                case "AD":
                    if (row < 7) {
                        arg = _Memory.memArray[column][row + 1];
                    }
                    else {
                        row = 0;
                        arg = _Memory.memArray[column + 1][row];
                    }
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    var indexRow = this.convertHex(arg) % 8;
                    this.Acc = _Memory.memArray[indexCol - 1][indexRow];
                    break;
                //8D - store acc in mem, 2 arg
                case "8D":
                    if (row < 7) {
                        arg = _Memory.memArray[column][row + 1];
                    }
                    else {
                        row = 0;
                        arg = _Memory.memArray[column + 1][row];
                    }
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    var indexRow = this.convertHex(arg) % 8;
                    console.log("Location: " + (indexCol - 1) + ", " + indexRow);
                    _Memory.memArray[indexCol - 1][indexRow] = this.Acc;
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
                    if (row < 7) {
                        arg = _Memory.memArray[column][row + 1];
                    }
                    else {
                        row = 0;
                        arg = _Memory.memArray[column][row + 1];
                    }
                    if (arg == "00") {
                        this.terminateOS();
                        break;
                    }
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
            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
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
        //function to convert string to hex
        Cpu.prototype.convertHex = function (hex) {
            var add = 0;
            //get first number, if letter translate then multiply by 16
            //otherwise just multiply by 16
            switch (hex[0]) {
                case "A":
                    add = 10 * 16;
                    break;
                case "B":
                    add = 11 * 16;
                    break;
                case "C":
                    add = 12 * 16;
                    break;
                case "D":
                    add = 13 * 16;
                    break;
                case "E":
                    add = 14 * 16;
                    break;
                case "F":
                    add = 15 * 16;
                    break;
                default:
                    add = (+hex[0]) * 16;
                    break;
            }
            //get second number, if letter translate then add to first number
            //otherwise just add to first number
            switch (hex[1]) {
                case "A":
                    add += 10;
                    break;
                case "B":
                    add += 11;
                    break;
                case "C":
                    add += 12;
                    break;
                case "D":
                    add += 13;
                    break;
                case "E":
                    add += 14;
                    break;
                case "F":
                    add += 15;
                    break;
                default:
                    add += (+hex[1]);
                    break;
            }
            console.log("Hex: " + add);
            //return hex number
            return add;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
