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
            this.runningPID = 0;
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
            console.log("Running PID: " + _Kernel.readyQueue[this.runningPID].processId);
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.program = _Kernel.readyQueue[this.runningPID];
            //update status to running
            this.program.status = "Running";
            //send input to opCodes to check what actions need to be performed
            _CPU.opCodes(TSOS.MemoryAccessor.readMemory(this.position));
            //update PCB
            if (this.position >= TSOS.MemoryAccessor.memoryLength()) {
                this.terminateProgram();
            }
        };
        Cpu.prototype.terminateProgram = function () {
            //set status to terminated and update block
            this.program.updateValues("Terminated", this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.clearPCB();
            TSOS.Control.updatePCB();
            //mark isExecuting as false
            this.isExecuting = false;
        };
        Cpu.prototype.terminateOS = function () {
            //mark single step as false
            TSOS.Control.disableSingleStep();
            //set memory back to 0
            TSOS.MemoryAccessor.clearMem();
            //reset table
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
            //reset CPU
            TSOS.Control.initCpu();
            //new line on shell
            _StdOut.advanceLine();
            _Console.clearLine();
            _StdOut.putText(_OsShell.promptStr);
        };
        Cpu.prototype.opCodes = function (input) {
            var addr;
            var arg;
            var memVal;
            switch (input) {
                //A9 - load acc with const, 1 arg
                case "A9":
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
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    //convert address to decimal
                    arg = parseInt(addr, 16);
                    //find this address in the memory
                    var argAddress = TSOS.MemoryAccessor.readMemory(arg);
                    //convert result to decimal
                    var accValue = parseInt(argAddress, 16);
                    //add the acc value to the acc
                    this.Acc += accValue;
                    this.position += 3;
                    break;
                //A2 - load x reg with constant, 1 arg
                case "A2":
                    this.IR = "A2";
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set xreg to user input
                    this.Xreg = arg.toString();
                    this.position += 2;
                    break;
                //AE - load x reg from mem, 2 arg
                case "AE":
                    this.IR = "AE";
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
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //set yreg to user input
                    this.Yreg = arg;
                    this.position += 2;
                    break;
                //AC - load y reg from mem. 2 arg
                case "AC":
                    this.IR = "AC";
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
                    this.position++;
                    break;
                //00 - break, 0 arg but check for another
                case "00":
                    this.IR = "00";
                    this.terminateProgram();
                    break;
                //EC - compare a byte in mem to the x reg, 2 arg
                case "EC":
                    this.IR = "EC";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = parseInt(addr, 16);
                    //get xreg value
                    var xValue = (+this.Xreg);
                    //find address corresponding to user input and add it to acc value
                    memVal = parseInt(TSOS.MemoryAccessor.readMemory(+arg), 16);
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
                        //get number to branch from memory
                        arg = TSOS.MemoryAccessor.readMemory(this.position + 1);
                        var newLocation = parseInt(arg, 16) + this.position;
                        //if the branch will exceed the size of the program, loop back around
                        if (newLocation > TSOS.MemoryManager.endProgram) {
                            newLocation = newLocation % 256;
                        }
                        //add 2 to the position and add in the new location
                        this.position = newLocation + 2;
                        //otherwise, just move up two
                    }
                    else {
                        this.position += 2;
                    }
                    break;
                //EE - increment the value of a byte, 2 args
                case "EE":
                    this.IR = "EE";
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
                    var stringBuilder = "";
                    if ((+this.Xreg) == 1) {
                        _StdOut.putText(this.Yreg.toString());
                    }
                    else if ((+this.Xreg) == 2) {
                        var stringBuilder = "";
                        //Grab the current Y Register value
                        var yRegVal = (+this.Yreg);
                        //Go to this spot in the memory
                        var byte = TSOS.MemoryAccessor.readMemory(yRegVal);
                        //Loop until we reach "00"
                        while (byte != "00") {
                            //Go to this spot in the memory
                            var byte = TSOS.MemoryAccessor.readMemory(yRegVal);
                            //Get the char code from this spot's value
                            var char = String.fromCharCode(parseInt(byte, 16));
                            yRegVal++;
                            //add char to string
                            stringBuilder += char;
                        }
                        //print string
                        _StdOut.putText(stringBuilder);
                    }
                    this.position++;
                    break;
            }
            //update CPU and PCB
            TSOS.Control.updateCPU(this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            this.program.updateValues("Running", this.position, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.updatePCB();
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
