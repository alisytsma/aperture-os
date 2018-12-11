///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/interrupt.ts" />


/* ------------
     Scheduler.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class Scheduler {

        public static i = 0;
        public static cycleCount = 0;
        public static schedulingAlgo;
        public static swap = 0;

        public static roundRobin():void {

            //get the current running program
            if(_Kernel.runningQueue.length > 1) {

                //if cycle count less than quantum
                if (this.cycleCount >= _CPU.quantum) {
                    //if we can move to the next program, do so
                    if (_Kernel.runningQueue.length > _CPU.runningPID + 1) {
                        //set current program status as ready
                        _CPU.program.status = "Ready";
                        //move to next program
                        _CPU.runningPID++;
                        _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                        //context switch interrupt
                        if (_CPU.program != null)
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH, _CPU.program.processId));

                    } else if (_Kernel.runningQueue.length >= 1) { //otherwise, if there's another program go back to 0
                        //set current program status as ready
                        if(_CPU.program != null)
                            _CPU.program.status = "Ready";
                        else
                            _CPU.program = _Kernel.readyQueue[0];
                        //move to first program
                        if (_Kernel.pcbDiskList.length > 0) {



                            for(var i = 0; i < _Kernel.runningQueue.length; i++)
                                console.log("Running queue: " + _Kernel.runningQueue[i].processId);
                            console.log("Disk queue: " + _Kernel.pcbDiskList[0].processId);

                            //if less than 3 processes
                            if(_Kernel.runningQueue.length < 3){
                                _Kernel.runningQueue.push(_Kernel.pcbDiskList[0]);
                                _Kernel.pcbDiskList.splice(0,1);
                                _CPU.runningPID = _Kernel.runningQueue[0];
                            } else {
                                var toMemory = _Kernel.pcbDiskList[0];
                                var toDisk = _Kernel.runningQueue[this.swap];

                                var track;
                                if(TSOS.FileSystemDeviceDriver.checkDisk(3)){
                                    track = 3;
                                } else if(TSOS.FileSystemDeviceDriver.checkDisk(4)) {
                                    track = 4;
                                }
                                _Kernel.runningQueue[this.swap].segment = 99;
                                TSOS.FileSystemDeviceDriver.rollIn(_Kernel.runningQueue[this.swap].toString(), track);

                                toMemory.segment = _Kernel.runningQueue[this.swap].segment;
                                MemoryManager.updateMemory(toMemory.toString());

                                Control.clearTable();
                                Control.loadTable();
                                Control.clearDisk();
                                Control.loadDisk();

                                _Kernel.runningQueue[this.swap] = toMemory;
                                _Kernel.pcbDiskList[0] = toDisk;

                                console.log("DISK: " +  _Kernel.pcbDiskList[0].processId + " MEM: " + _Kernel.runningQueue[this.swap].processId);

                            }

                            _CPU.runningPID = _Kernel.runningQueue[0];
                            _CPU.program = _Kernel.readyQueue[_Kernel.runningQueue[0].processId];



                        } else {

                        _CPU.runningPID = _Kernel.runningQueue[0].processId;
                        _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
                        }
                        //context switch interrupt
                        if (_CPU.program != null)
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH, _CPU.program.processId));

                    }  else {
                        _CPU.program = _Kernel.runningQueue[0];
                    }
                    this.cycleCount = 0;
            }

            this.cycleCount++;

            }
        }

        public static FCFS():void {

            //get the current running program
            if(_Kernel.runningQueue.length > 0) {

                _CPU.runningPID = _Kernel.runningQueue[0].processId;
                _CPU.program = _Kernel.readyQueue[_CPU.runningPID];

            }

            if(_Kernel.pcbDiskList.length > 0 && _Kernel.runningQueue.length < 3){

                _Kernel.pcbDiskList[0].segment = TSOS.MemoryManager.allocateMemory();
                _Kernel.readyQueue.push(_Kernel.pcbDiskList[0]);
                _Kernel.runningQueue.push(_Kernel.pcbDiskList[0]);
                _Kernel.pcbDiskList.splice(0,1);



            }

            console.log("Running program: " + _CPU.program.processId);
        }

        public static priority():void {


        }


        public static contextSwitch(params){
            _Kernel.krnTrace("Switching to process " + params);

        }

    }

}
