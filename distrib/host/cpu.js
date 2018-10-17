///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../host/memoryAccessor.ts" />
///<reference path="../os/memoryManager.ts" />
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
        function Cpu(position, Acc, IR, Xreg, Yreg, Zflag, isExecuting) {
            if (position === void 0) { position = 0; }
            if (Acc === void 0) { Acc = "0"; }
            if (IR === void 0) { IR = "0"; }
            if (Xreg === void 0) { Xreg = "0"; }
            if (Yreg === void 0) { Yreg = "0"; }
            if (Zflag === void 0) { Zflag = "0"; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.position = position;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            //public position = 0;
            this.singleStep = false;
        }
        Cpu.prototype.init = function () {
            this.position = 0;
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";
            this.isExecuting = false;
            TSOS.Control.updateCPU(this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // console.log("Position: " + this.position);
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.program = _Kernel.readyQueue[0];
            //update status to running
            this.program.status = "Running";
            //send input to opCodes to check what actions need to be performed
            _CPU.opCodes(TSOS.MemoryAccessor.readMemory(this.position));
            //update PCB
            if (this.position >= TSOS.MemoryAccessor.memoryLength()) {
                this.terminateOS();
            }
        };
        Cpu.prototype.terminateOS = function () {
            //set status to terminated and update block
            this.program.status = "Terminated";
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            //mark isExecuting as false
            this.isExecuting = false;
            //mark single step as false
            TSOS.Control.disableSingleStep();
            //set memory back to 0
            TSOS.MemoryAccessor.clearMem();
            //reset table
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
            TSOS.Control.initCpu();
        };
        Cpu.prototype.opCodes = function (input) {
            var addr;
            var arg;
            var memVal;
            switch (input) {
                //A9 - load acc with const, 1 arg
                case "A9":
                    console.log("Code A9 at position " + this.position);
                    this.IR = "A9";
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //find next code to get values for op code
                    this.Acc = arg;
                    this.position += 2;
                    break;
                //AD - load from mem, 2 arg
                case "AD":
                    console.log("Code AD at position " + this.position);
                    this.IR = "AD";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set the acc value to this position in memory
                    this.Acc = parseInt(TSOS.MemoryAccessor.readMemory(+arg).toString(), 16).toString();
                    this.position += 3;
                    break;
                //8D - store acc in mem, 2 arg
                case "8D":
                    console.log("Code 8D at position " + this.position);
                    this.IR = "8D";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set this position in memory equal to the acc value
                    TSOS.MemoryAccessor.writeMemory((+arg), this.Acc);
                    this.position += 3;
                    break;
                //6D - add with carry, 2 arg
                case "6D":
                    this.IR = "6D";
                    console.log("Code 6D at position " + this.position);
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    //get acc value
                    arg = parseInt(addr, 16);
                    var accValue = (+this.Acc);
                    // console.log("Acc Val: " + accValue + ", add: " + arg);
                    //find address corresponding to user input and add it to acc value
                    accValue += (+arg);
                    // console.log("New acc Val: " + accValue);
                    //make sure valid input
                    if (!isNaN(accValue))
                        this.Acc = accValue.toString();
                    this.position += 3;
                    break;
                //A2 - load x reg with constant, 1 arg
                case "A2":
                    this.IR = "A2";
                    console.log("Code A2 at position " + this.position);
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set xreg to user input
                    this.Xreg = arg.toString();
                    this.position += 2;
                    break;
                //AE - load x reg from mem, 2 arg
                case "AE":
                    this.IR = "AE";
                    console.log("Code AE at position " + this.position);
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set the xreg value to this position in memory
                    this.Xreg = parseInt(TSOS.MemoryAccessor.readMemory(+arg).toString(), 16).toString();
                    this.position += 3;
                    break;
                //A0 - load y reg with const, 1 arg
                case "A0":
                    this.IR = "A0";
                    console.log("Code A0 at position " + this.position);
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set yreg to user input
                    this.Yreg = arg;
                    this.position += 2;
                    break;
                //AC - load y reg from mem. 2 arg
                case "AC":
                    this.IR = "AC";
                    console.log("Code AC at position " + this.position);
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set the yreg value to this position in memory
                    this.Yreg = parseInt(TSOS.MemoryAccessor.readMemory(+arg).toString(), 16).toString();
                    this.position += 3;
                    break;
                //EA - no op, 0 arg
                case "EA":
                    this.IR = "EA";
                    console.log("Code EA at position " + this.position);
                    this.position++;
                    break;
                //00 - break, 0 arg but check for another
                case "00":
                    this.IR = "00";
                    console.log("Code 00 at position " + this.position);
                    this.terminateOS();
                    break;
                //EC - compare a byte in mem to the x reg, 2 arg
                case "EC":
                    this.IR = "EC";
                    console.log("Code EC at position " + this.position);
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    //console.log("Mem add: " + addr);
                    arg = parseInt(addr, 16);
                    //console.log("Conv: " + arg);
                    //get xreg value
                    var xValue = (+this.Xreg);
                    //console.log("XVal: " + this.Xreg);
                    //find address corresponding to user input and add it to acc value
                    memVal = parseInt(TSOS.MemoryAccessor.readMemory(+arg), 16);
                    // console.log("Mem Val: " + memVal);
                    if (xValue == memVal) {
                        this.Zflag = "1";
                    }
                    else {
                        this.Zflag = "0";
                    }
                    this.position += 3;
                    break;
                //D0 - branch n bytes if z flag = 0, 1 arg
                case "D0":
                    //if zflag is 0
                    if ((+this.Zflag) == 0) {
                        console.log("Code D0 at position " + this.position);
                        // get the branch value from memory
                        console.log("Was at location " + this.position);
                        arg = TSOS.MemoryAccessor.readMemory(this.position + 1);
                        var newLocation = parseInt(arg, 16) + this.position;
                        console.log("Add " + parseInt(arg, 16));
                        // if the branch will exceed the memory, go back to 0
                        if (newLocation > TSOS.MemoryManager.endProgram) {
                            newLocation = newLocation % 256;
                        }
                        // Add 2 to account for the branch op and the location
                        this.position = newLocation + 2;
                        console.log("Now at location " + this.position);
                    }
                    else {
                        this.position += 2;
                    }
                    break;
                //EE - increment the value of a byte, 2 args
                case "EE":
                    this.IR = "EE";
                    console.log("Code EE at position " + this.position);
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //add 1 to position in mem
                    memVal = +TSOS.MemoryAccessor.readMemory(+arg) + 1;
                    TSOS.MemoryAccessor.writeMemory((+arg), memVal.toString());
                    //make sure valid number
                    if (!isNaN(accValue))
                        this.Acc = accValue.toString();
                    this.position += 3;
                    break;
                //FF - system call
                case "FF":
                    this.IR = "FF";
                    console.log("Code FF at position " + this.position);
                    var stringBuilder = "";
                    //console.log("FF: " + this.Xreg);
                    if ((+this.Xreg) == 1) {
                        // console.log("FF y reg: " + this.Yreg);
                        _StdOut.putText(this.Yreg.toString());
                    }
                    else if ((+this.Xreg) == 2) {
                        var stringBuilder = "";
                        //Grab the current Y Register value
                        var yRegVal = (+this.Yreg);
                        //Go to this spot in the memory
                        var byte = TSOS.MemoryAccessor.readMemory(yRegVal);
                        console.log(yRegVal);
                        //Loop until we reach "00"
                        while (byte != "00") {
                            //Go to this spot in the memory
                            var byte = TSOS.MemoryAccessor.readMemory(yRegVal);
                            //Get the char code from this spot's value
                            var char = String.fromCharCode(parseInt(byte, 16));
                            console.log("Char: " + char + ", byte: " + byte);
                            yRegVal++;
                            //add char to string
                            stringBuilder += char;
                            console.log(yRegVal);
                        }
                        //print string
                        _StdOut.putText(stringBuilder);
                    }
                    this.position++;
                    break;
            }
            TSOS.Control.updateCPU(this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
