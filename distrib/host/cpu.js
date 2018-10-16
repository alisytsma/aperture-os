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
            this.PC = 0;
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
            console.log(this.runningPID);
            this.program = _Kernel.readyQueue[this.runningPID];
            //update status to running
            this.program.status = "Running";
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            //send input to opCodes to check what actions need to be performed
            _CPU.opCodes(TSOS.MemoryAccessor.readMemory(this.positionCol, this.positionRow), this.positionCol, this.positionRow, this.program.processId, this.program.status);
            //update PCB
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            if (this.positionRow < 7) {
                this.positionRow++;
            }
            else {
                this.positionRow = 0;
                this.positionCol++;
                // if at end of memory, terminate
            }
            if (this.positionRow >= 7 && this.positionCol >= 31) {
                this.terminateOS();
            }
        };
        Cpu.prototype.terminateOS = function () {
            //set status to terminated and update block
            this.program.status = "Terminated";
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            //mark isExecuting as false
            this.isExecuting = false;
            //set memory back to 0
            for (var i = 0; i < 32; i++) {
                for (var j = 0; j < 8; j++) {
                    _Memory.memArray[i][j] = "00";
                }
            }
            //reset table
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        };
        Cpu.prototype.opCodes = function (input, column, row, pid, status) {
            var arg;
            switch (input) {
                //A9 - load acc with const, 1 arg
                case "A9":
                    this.IR = "A9";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = _Memory.memArray[column][row + 1];
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = _Memory.memArray[column + 1][row];
                    }
                    //set acc to user input
                    this.Acc = arg;
                    this.PC += 2;
                    break;
                //AD - load from mem, 2 arg
                case "AD":
                    this.IR = "AD";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    //set the acc value to this position in memory
                    this.Acc = TSOS.MemoryAccessor.readMemory(indexCol - 1, row);
                    ;
                    this.PC += 3;
                    break;
                //8D - store acc in mem, 2 arg
                case "8D":
                    this.IR = "8D";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    //set this position in memory equal to the acc value
                    console.log("Col: " + (indexCol) + ", Row: " + indexRow);
                    TSOS.MemoryAccessor.writeMemory(indexCol, indexRow + 1, this.Acc.toString());
                    this.PC += 3;
                    break;
                //6D - add with carry, 2 arg
                case "6D":
                    this.IR = "6D";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //get acc value
                    var accValue = (+this.Acc);
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    //find address corresponding to user input and add it to acc value
                    accValue += (+_Memory.memArray[indexCol - 1][indexRow]);
                    //make sure valid input
                    if (!isNaN(accValue))
                        this.Acc = accValue.toString();
                    this.PC += 3;
                    break;
                //A2 - load x reg with constant, 1 arg
                case "A2":
                    this.IR = "A2";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set xreg to user input
                    this.Xreg = arg;
                    this.PC += 2;
                    break;
                //AE - load x reg from mem, 2 arg
                case "AE":
                    this.IR = "AE";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    //set the xreg value to this position in memory
                    this.Xreg = _Memory.memArray[indexCol - 1][indexRow];
                    this.PC += 3;
                    break;
                //A0 - load y reg with const, 1 arg
                case "A0":
                    this.IR = "A0";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set yreg to user input
                    this.Yreg = arg;
                    this.PC += 2;
                    break;
                //AC - load y reg from mem. 2 arg
                case "AC":
                    this.IR = "AC";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    //set the yreg value to this position in memory
                    this.Yreg = _Memory.memArray[indexCol - 1][indexRow];
                    this.PC += 3;
                    break;
                //EA - no op, 0 arg
                case "EA":
                    this.IR = "EA";
                    this.PC += 1;
                    break;
                //00 - break, 0 arg but check for another
                case "00":
                    this.IR = "00";
                    var arg2;
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    } //if not at end of row, increment row
                    if (row < 7) {
                        arg2 = TSOS.MemoryAccessor.readMemory(column, row + 2);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg2 = TSOS.MemoryAccessor.readMemory(column + 1, row + 1);
                    }
                    //if next input is also 00, terminate
                    if (arg == "00" && arg2 == "00") {
                        this.PC += 2;
                        this.terminateOS();
                        break;
                    }
                    else {
                        this.PC += 1;
                    }
                    break;
                //EC - compare a byte in mem to the x reg, 2 arg
                case "EC":
                    this.IR = "EC";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //get xreg value
                    var xValue = (+this.Xreg);
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    console.log("index row: " + indexRow + "; indexCol: " + indexCol);
                    //find address corresponding to user input and add it to acc value
                    var memVal;
                    if (indexCol > 0)
                        memVal = (+_Memory.memArray[indexCol - 1][indexRow]);
                    else
                        memVal = (+_Memory.memArray[0][indexRow]);
                    if (xValue == memVal) {
                        this.Zflag = "1";
                    }
                    else {
                        this.Zflag = "0";
                    }
                    this.Xreg = xValue.toString();
                    this.PC += 3;
                    break;
                //D0 - branch n bytes if z flag = 0, 1 arg
                case "D0":
                    this.IR = "D0";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    var incr = (+arg);
                    if ((+this.Zflag) == 0) {
                        console.log("previous pos: " + this.positionCol + ", " + this.positionRow);
                        if (row < 7) {
                            this.positionRow += incr;
                        }
                        else {
                            this.positionRow += (incr - 1);
                            this.positionCol += 1;
                        }
                        console.log("after pos: " + this.positionCol + ", " + this.positionRow);
                    }
                    this.PC += incr;
                    break;
                //EE - increment the value of a byte, 2 args
                case "EE":
                    this.IR = "EE";
                    //if not at end of row, increment row
                    if (row < 7) {
                        arg = TSOS.MemoryAccessor.readMemory(column, row + 1);
                        //else go to beginning of next line
                    }
                    else {
                        row = 0;
                        arg = TSOS.MemoryAccessor.readMemory(column + 1, row);
                    }
                    //set column to rounded up converted decimal input divided by 8
                    var indexCol = Math.ceil(this.convertHex(arg) / 8);
                    //set row to the remainder of the converted decimal input divided by 8
                    var indexRow = this.convertHex(arg) % 8;
                    //find address corresponding to user input and increment it
                    var memVal;
                    if (indexCol > 0)
                        memVal = (+TSOS.MemoryAccessor.readMemory(indexCol - 1, indexRow)) + 1;
                    else
                        memVal = (+TSOS.MemoryAccessor.readMemory(0, indexRow)) + 1;
                    if (indexCol > 0)
                        TSOS.MemoryAccessor.writeMemory(indexCol - 1, indexRow, memVal.toString());
                    else
                        TSOS.MemoryAccessor.writeMemory(0, indexRow, memVal.toString());
                    //make sure valid number
                    if (!isNaN(accValue))
                        this.Acc = accValue.toString();
                    this.PC += 3;
                    break;
                //FF - system call
                case "FF":
                    this.IR = "FF";
                    if ((+this.Xreg) == 1) {
                        _StdOut.putText(this.Yreg);
                    }
                    else if ((+this.Xreg) == 2) {
                    }
                    this.PC += 2;
                    break;
            }
            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
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
