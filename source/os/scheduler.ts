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
        public static programToSwap = 0;
        public static runCount = 0;

        public static roundRobin():void {

            //get the current running program
            if(_Kernel.runningQueue.length > 1) {

                // check to see if any of the memory is free without swapping
                if(_Memory.mem0Free || _Memory.mem1Free || _Memory.mem2Free && _Kernel.pcbDiskList.length > 0) {
                    // if track 2 is the one with data, otherwise track 3
                    if (!TSOS.FileSystemDeviceDriver.checkDisk(2))
                        TSOS.FileSystemDeviceDriver.rollOut(2, 2);
                    else
                        TSOS.FileSystemDeviceDriver.rollOut(3, 2);
                }

                //if cycle count greater than quantum
                if (this.cycleCount >= _CPU.quantum) {
                    this.runCount++;
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
                        else  //move to first program
                            _CPU.program = _Kernel.readyQueue[0];

                        // if there's a program on the disk
                        if (_Kernel.pcbDiskList.length > 0) {

                            var memSegment;

                            // check to see if any of the memory is free without swapping
                            if(_Memory.mem0Free || _Memory.mem1Free || _Memory.mem2Free){
                                // if track 2 is the one with data, otherwise track 3
                                if(!TSOS.FileSystemDeviceDriver.checkDisk(2))
                                    TSOS.FileSystemDeviceDriver.rollOut(2, 2);
                                else
                                    TSOS.FileSystemDeviceDriver.rollOut(3, 2);
                            } else { // if it's not we must swap
                                // set mem segment to free of the program we're swapping
                                if (_Kernel.readyQueue[this.programToSwap].segment == 0) {
                                    _Memory.mem0Free = true;
                                    memSegment = 0;
                                }
                                else if (_Kernel.readyQueue[this.programToSwap].segment == 1) {
                                    _Memory.mem1Free = true;
                                    memSegment = 1;
                                }
                                else if (_Kernel.readyQueue[this.programToSwap].segment == 2) {
                                    _Memory.mem2Free = true;
                                    memSegment = 2;
                                }

                                // set the program we're swapping's segment to 99 and add it to the disk array
                                _Kernel.readyQueue[this.programToSwap].segment = 99;
                                _Kernel.pcbDiskList.push(_Kernel.readyQueue[this.programToSwap]);

                                // if track 2 is open, roll into track 2 and roll out from track 3
                                if (TSOS.FileSystemDeviceDriver.checkDisk(2)) {
                                    TSOS.FileSystemDeviceDriver.rollIn(_Memory.memArray[memSegment].toString(), 2);
                                    TSOS.FileSystemDeviceDriver.rollOut(3, this.programToSwap);

                                    // else if track 3 is open, roll into track 3 and roll out from track 2
                                } else if (TSOS.FileSystemDeviceDriver.checkDisk(3)) {
                                    TSOS.FileSystemDeviceDriver.rollIn(_Memory.memArray[memSegment].toString(), 3);
                                    TSOS.FileSystemDeviceDriver.rollOut(2, this.programToSwap);
                                }

                                // set program to the one we just swapped in
                                _CPU.program = _Kernel.readyQueue[this.programToSwap];


                                // incriment program to swap as long as it's under 2, otherwise go to 0
                                this.programToSwap++;
                                if (this.programToSwap > 2)
                                    this.programToSwap = 0;

                            }
                        } else {
                            //sort the running queue by processId
                            _Kernel.readyQueue.sort(function(a, b){
                                return a.processId-b.processId
                            });
                            _CPU.runningPID = 0;
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
            }
        }

        public static FCFS():void {

            //get the current running program
            if(_Kernel.runningQueue.length > 0) {
                _CPU.runningPID = _Kernel.runningQueue[0].processId;
                _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
            }

            // if running queue has data but isn't full and the disk has data, bring the disk data to mem
            if(_Kernel.pcbDiskList.length > 0 && _Kernel.runningQueue.length < 3 && _Kernel.runningQueue.length > 0){
                // if track 2 is the one with data, otherwise track 3
                if(!TSOS.FileSystemDeviceDriver.checkDisk(2))
                    TSOS.FileSystemDeviceDriver.rollOut(2, 2);
                else
                    TSOS.FileSystemDeviceDriver.rollOut(3, 2);
            }

        }

        public static priorityAlgo():void {

            //sort the running queue by sort
            _Kernel.runningQueue.sort(function(a, b){
                return a.priority-b.priority
            });

            //get the current running program
            if(_Kernel.runningQueue.length > 0) {
                _CPU.runningPID = _Kernel.runningQueue[0].processId;
                _CPU.program = _Kernel.readyQueue[_CPU.runningPID];
            }

            // if running queue has data but isn't full and the disk has data, bring the disk data to mem
            if(_Kernel.pcbDiskList.length > 0 && _Kernel.runningQueue.length < 3 && _Kernel.runningQueue.length > 0){
                // if track 2 is the one with data, otherwise track 3
                if(!TSOS.FileSystemDeviceDriver.checkDisk(2))
                    TSOS.FileSystemDeviceDriver.rollOut(2, 2);
                else
                    TSOS.FileSystemDeviceDriver.rollOut(3, 2);
            }

        }


        public static contextSwitch(params){
            _Kernel.krnTrace("Switching to process " + params);

        }

    }

}
