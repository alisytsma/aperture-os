///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../host/memoryAccessor.ts" />
///<reference path="../os/memoryManager.ts" />
///<reference path="../os/scheduler.ts" />
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
            this.quantum = 6;
            this.scheduling = true;
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
            TSOS.Scheduler.cycleCount++;
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // this.program = _Kernel.readyQueue[this.runningPID];
            //update status to running
            if (this.program != null)
                this.program.status = "Running";
            //update turnaround time for all programs in ready queue
            for (var i = 0; i < _Kernel.readyQueue.length; i++) {
                _Kernel.readyQueue[i].turnaroundTime++;
                if (_Kernel.readyQueue[i].status != "Running") {
                    _Kernel.readyQueue[i].waitTime++;
                }
            }
            if (this.program != null) {
                //send input to opCodes to check what actions need to be performed
                this.opCodes(TSOS.MemoryAccessor.readMemory(this.program.position));
                //update PCB
                if (this.program.position >= TSOS.MemoryAccessor.memoryLength()) {
                    this.terminateProgram();
                }
            }
        };
        Cpu.prototype.terminateProgram = function () {
            //print turnaround time and wait time
            _StdOut.advanceLine();
            _StdOut.putText("Turnaround time: " + this.program.turnaroundTime);
            _StdOut.advanceLine();
            _StdOut.putText("Wait time: " + this.program.waitTime);
            _StdOut.advanceLine();
            //put prompt back
            _OsShell.putPrompt();
            //set status to terminated and update block
            this.program.updateValues("Terminated", this.program.position, this.program.Acc, this.program.IR, this.program.Xreg, this.program.Yreg, this.program.Zflag);
            TSOS.Control.clearPCB();
            TSOS.Control.updatePCB();
            //console.log("Splice: " + _Kernel.runningQueue.indexOf(this.program));
            _Kernel.runningQueue.splice(_Kernel.runningQueue.indexOf(this.program), 1);
            if (_Kernel.runningQueue.length > _CPU.runningPID + 1) {
                _CPU.runningPID++;
                _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
            }
            else if (_Kernel.runningQueue.length >= 1) {
                _CPU.runningPID = _Kernel.runningQueue[0].processId;
                _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
            }
            if (_Kernel.runningQueue.length == 0) {
                this.terminateOS();
            }
        };
        Cpu.prototype.terminateOS = function () {
            //mark isExecuting as false
            this.isExecuting = false;
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
            //console.log("program: " + this.program.processId + ", input: " + input);
            switch (input) {
                //A9 - load acc with const, 1 arg
                case "A9":
                    this.program.IR = "A9";
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //find next code to get values for op code
                    this.program.Acc = arg;
                    this.program.position += 2;
                    break;
                //AD - load from mem, 2 arg
                case "AD":
                    console.log("Code AD at position " + this.program.position);
                    this.program.IR = "AD";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //set the acc value to this position in memory
                    this.program.Acc = parseInt(TSOS.MemoryAccessor.readMemory(+arg).toString(), 16).toString();
                    this.program.position += 3;
                    break;
                //8D - store acc in mem, 2 arg
                case "8D":
                    this.program.IR = "8D";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //set this position in memory equal to the acc value
                    TSOS.MemoryAccessor.writeMemory((+arg), this.program.Acc);
                    this.program.position += 3;
                    break;
                //6D - add with carry, 2 arg
                case "6D":
                    this.program.IR = "6D";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    //convert address to decimal
                    arg = parseInt(addr, 16);
                    //find this address in the memory
                    var argAddress = TSOS.MemoryAccessor.readMemory(arg);
                    //convert result to decimal
                    var accValue = parseInt(argAddress, 16);
                    //add the acc value to the acc
                    this.program.Acc += accValue;
                    this.program.position += 3;
                    break;
                //A2 - load x reg with constant, 1 arg
                case "A2":
                    this.program.IR = "A2";
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //set xreg to user input
                    this.program.Xreg = arg.toString();
                    this.program.position += 2;
                    break;
                //AE - load x reg from mem, 2 arg
                case "AE":
                    this.program.IR = "AE";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //set the xreg value to this position in memory
                    this.program.Xreg = parseInt(TSOS.MemoryAccessor.readMemory(+arg).toString(), 16).toString();
                    this.program.position += 3;
                    break;
                //A0 - load y reg with const, 1 arg
                case "A0":
                    this.program.IR = "A0";
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //set yreg to user input
                    this.program.Yreg = arg;
                    this.program.position += 2;
                    break;
                //AC - load y reg from mem. 2 arg
                case "AC":
                    this.program.IR = "AC";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //set the yreg value to this position in memory
                    this.program.Yreg = parseInt(TSOS.MemoryAccessor.readMemory(+arg).toString(), 16).toString();
                    this.program.position += 3;
                    break;
                //EA - no op, 0 arg
                case "EA":
                    this.program.IR = "EA";
                    this.program.position++;
                    break;
                //00 - break, 0 arg but check for another
                case "00":
                    this.program.IR = "00";
                    this.terminateProgram();
                    break;
                //EC - compare a byte in mem to the x reg, 2 arg
                case "EC":
                    this.program.IR = "EC";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //get xreg value
                    var xValue = (+this.program.Xreg);
                    //find address corresponding to user input and add it to acc value
                    memVal = parseInt(TSOS.MemoryAccessor.readMemory(+arg), 16);
                    if (xValue == memVal) {
                        this.program.Zflag = "1";
                    }
                    else {
                        this.program.Zflag = "0";
                    }
                    this.program.position += 3;
                    break;
                //D0 - branch n bytes if z flag = 0, 1 arg
                case "D0":
                    //if zflag is 0
                    if ((+this.program.Zflag) == 0) {
                        //get number to branch from memory
                        arg = TSOS.MemoryAccessor.readMemory(this.program.position + 1);
                        var newLocation = parseInt(arg, 16) + this.program.position;
                        //if the branch will exceed the size of the program, loop back around
                        if (newLocation > TSOS.MemoryManager.endProgram) {
                            newLocation = newLocation % 256;
                        }
                        //add 2 to the position and add in the new location
                        this.program.position = newLocation + 2;
                        //otherwise, just move up two
                    }
                    else {
                        this.program.position += 2;
                    }
                    break;
                //EE - increment the value of a byte, 2 args
                case "EE":
                    this.program.IR = "EE";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.program.position + 2) + TSOS.MemoryAccessor.readMemory(this.program.position + 1));
                    arg = parseInt(addr, 16);
                    //add 1 to position in mem
                    memVal = +TSOS.MemoryAccessor.readMemory(+arg) + 1;
                    TSOS.MemoryAccessor.writeMemory((+arg), memVal.toString());
                    //make sure valid number
                    if (!isNaN(accValue))
                        this.program.Acc = accValue.toString();
                    this.program.position += 3;
                    break;
                //FF - system call
                case "FF":
                    this.program.IR = "FF";
                    var stringBuilder = "";
                    if ((+this.program.Xreg) == 1) {
                        _StdOut.putText(this.program.Yreg.toString());
                    }
                    else if ((+this.program.Xreg) == 2) {
                        var stringBuilder = "";
                        //Grab the current Y Register value
                        var yRegVal = (+this.program.Yreg);
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
                    this.program.position++;
                    break;
            }
            //update CPU and PCB
            TSOS.Control.updateCPU(this.program.position, this.program.Acc, this.program.IR, this.program.Xreg, this.program.Yreg, this.program.Zflag);
            this.program.updateValues(this.program.status, this.program.position, this.program.Acc, this.program.IR, this.program.Xreg, this.program.Yreg, this.program.Zflag);
            TSOS.Control.updatePCB();
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
