///<reference path="../globals.ts" />

/* ------------
     CPU.tss

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

        public runningPID: number;
        public program;
        public position = 0;
        public singleStep = false;

        constructor(public PC: number = 0,
                    public Acc: string = "0",
                    public IR: string = "0",
                    public Xreg: string = "0",
                    public Yreg: string = "0",
                    public Zflag: string = "0",
                    public isExecuting: boolean = false) {
        }

        public init(): void {
            this.PC = 0;
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
            console.log("Position: " + this.position);
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.program = _Kernel.readyQueue[this.runningPID];
            //update status to running
            this.program.status = "Running";
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);

            //send input to opCodes to check what actions need to be performed
            _CPU.opCodes(TSOS.MemoryAccessor.readMemory(this.position));
            this.position++;

            //update PCB
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            if(this.position >= TSOS.MemoryAccessor.memoryLength()){
                this.terminateOS();
            }
        }

        public terminateOS(): void {
            //set status to terminated and update block
            this.program.status = "Terminated";
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            //mark isExecuting as false
            this.isExecuting = false;
            //mark single step as false
            TSOS.Control.disableSingleStep();
            //set memory back to 0
            //TSOS.MemoryAccessor.clearMem();
            //reset table
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }


        public opCodes(input: string): void {
            var addr;
            var arg;

            switch(input){
                //A9 - load acc with const, 1 arg
                case "A9":
                    this.IR = "A9";
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //find next code to get values for op code
                    this.Acc = arg;
                    this.position ++;
                    break;

                //AD - load from mem, 2 arg
                case "AD":
                    this.IR = "AD";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //set the acc value to this position in memory
                    this.Acc = TSOS.MemoryAccessor.readMemory(+arg);
                    this.position += 2;
                    break;

                //8D - store acc in mem, 2 arg
                case "8D":
                    this.IR = "8D";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //set this position in memory equal to the acc value
                    TSOS.MemoryAccessor.writeMemory((+arg), this.Acc);
                    this.position += 2;
                    break;

                //6D - add with carry, 2 arg
                case "6D":
                    this.IR = "6D";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);                    //get acc value
                    var accValue = (+this.Acc);
                    console.log("Acc Val: " + accValue + ", add: " + arg);
                    //find address corresponding to user input and add it to acc value
                    accValue += (+arg);
                    console.log("New acc Val: " + accValue);

                    //make sure valid input
                    if(!isNaN(accValue))
                        this.Acc = accValue.toString();
                    this.position += 2;
                    break;

                //A2 - load x reg with constant, 1 arg
                case "A2":
                    this.IR = "A2";
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //set xreg to user input
                    this.Xreg = arg;
                    this.position += 1;
                    break;

                //AE - load x reg from mem, 2 arg
                case "AE":
                    this.IR = "AE";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //set the xreg value to this position in memory
                    this.Xreg = TSOS.MemoryAccessor.readMemory(+arg);
                    this.position += 2;
                    break;

                //A0 - load y reg with const, 1 arg
                case "A0":
                    this.IR = "A0";
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //set yreg to user input
                    this.Yreg = arg;
                    this.position += 1;
                    break;

                //AC - load y reg from mem. 2 arg
                case "AC":
                    this.IR = "AC";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //set the yreg value to this position in memory
                    this.Yreg = TSOS.MemoryAccessor.readMemory(+arg);
                    this.position += 2;
                    break;

                //EA - no op, 0 arg
                case "EA":
                    this.IR = "EA";
                    break;

                //00 - break, 0 arg but check for another
                case "00":
                    this.IR = "00";
                    this.terminateOS();
                    break;

                //EC - compare a byte in mem to the x reg, 2 arg
                case "EC":
                    this.IR = "EC";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    console.log("Mem add: " + addr);
                    arg = this.convertHex(addr);
                    console.log("Conv: " + arg);
                    //get xreg value
                    var xValue = (+this.Xreg);
                    console.log("XVal: " + this.Xreg);
                    //find address corresponding to user input and add it to acc value
                    var memVal;
                    memVal = TSOS.MemoryAccessor.readMemory(+arg);
                    console.log("Mem Val: " + memVal);


                    if(xValue == memVal){
                        this.Zflag = "1";
                    } else {
                        this.Zflag = "0";
                    }
                    this.Xreg = xValue.toString();
                    this.position += 2;
                    break;

                //D0 - branch n bytes if z flag = 0, 1 arg
                case "D0":
                    //if zflag is 0
                    if ((+this.Zflag) == 0) {
                        this.position = ((2 + parseInt((TSOS.MemoryAccessor.readMemory(this.position + 1)), 16)) % (+TSOS.MemoryManager.endProgram));
                    }
                    this.PC = this.position;
                    console.log("Z Pos: " + this.position);
                    break;

                //EE - increment the value of a byte, 2 args
                case "EE":
                    this.IR = "EE";
                    //find next 2 codes and swap them to get values for op code
                    addr = (TSOS.MemoryAccessor.readMemory(this.position + 2) + TSOS.MemoryAccessor.readMemory(this.position + 1));
                    arg = this.convertHex(addr);
                    //add 1 to position in mem
                    var memVal = (+TSOS.MemoryAccessor.readMemory(+arg)) + 1;
                    TSOS.MemoryAccessor.writeMemory((+arg), memVal.toString());

                    //make sure valid number
                    if(!isNaN(accValue))
                        this.Acc = accValue.toString();
                    this.position += 2;
                    break;

                //FF - system call
                case "FF":
                    this.IR = "FF";
                    var stringBuilder = "";
                    console.log("FF: " + this.Xreg);
                    if((+this.Xreg) == 1){
                        console.log("FF y reg: " + this.Yreg);
                        _StdOut.putText(this.Yreg.toString());
                    } else if ((+this.Xreg) == 2) {
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
                            var char = String.fromCharCode(byte);
                            yRegVal++;
                            //add char to string
                            stringBuilder += char;
                        }
                        //print string
                        _StdOut.putText(stringBuilder);

                    }
                    break;
            }
            this.PC = this.position;
            TSOS.Control.updateCPU(this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.updatePCB(this.program.processId, this.program.status, this.PC, this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        }

        //function to convert string to hex
        //did not realize this was already built in cause I'm dumb
        //leaving it anyway cause I took the time to make it
        public convertHex(hex: string): number {
            var add = 0;
            console.log("Var: " + hex + ", 2: " + hex[2] + " 3: " + hex[3]);

            if(hex.length == 4) {
                //get first number, if letter translate then multiply by 16
                //otherwise just multiply by 16
                switch (hex[2]) {
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
                        add = (+hex[2]) * 16;
                        break;
                }
                //get second number, if letter translate then add to first number
                //otherwise just add to first number
                switch (hex[3]) {
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
                        add += (+hex[3]);
                        break;
                }
            } else if (hex.length == 2){
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
            }
            console.log("Hex: " + add);
            //return hex number
            return add;
        }
    }
}
