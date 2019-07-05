///<reference path="../globals.ts" />
///<reference path="queue.ts" />
///<reference path="../host/control.ts" />
///<reference path="deviceDriverKeyboard.ts" />
///<reference path="fileSystemDeviceDriver.ts" />
///<reference path="shell.ts" />
///<reference path="../host/memory.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="scheduler.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel() {
            //list of programs that are ready and waiting
            this.readyQueue = [];
            //list of programs that are currently being run
            this.runningQueue = [];
            this.pcbDiskList = [];
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            //
            // ... more?
            //
            //set status
            document.getElementById("status").innerHTML = "Status: Running | ";
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            //create new memory instance
            _Memory = new TSOS.Memory();
            _Memory.init();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            TSOS.Control.updatePCB();
            // Load the file system device driver
            this.krnTrace("Loading the file system device driver.");
            _krnFileDriver = new TSOS.FileSystemDeviceDriver(); // Construct it.
            _krnFileDriver.init(); // Call the initialization routine.
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting && _CPU.singleStep == false) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                _CPU.cycle();
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
            if (_CPU.scheduling == true) {
                if (TSOS.Scheduler.schedulingAlgo == "rr") {
                    TSOS.Scheduler.roundRobin();
                }
                else if (TSOS.Scheduler.schedulingAlgo == "fcfs") {
                    TSOS.Scheduler.FCFS();
                }
                else if (TSOS.Scheduler.schedulingAlgo == "priority") {
                    TSOS.Scheduler.priorityAlgo();
                }
                else {
                    TSOS.Scheduler.schedulingAlgo = "rr";
                    TSOS.Scheduler.roundRobin();
                }
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case CONTEXT_SWITCH:
                    TSOS.Scheduler.contextSwitch(params);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        Kernel.prototype.createProcess = function (pid, memory, priority) {
            //create a new process
            var newProc = new TSOS.ProcessControlBlock(pid.toString(), TSOS.MemoryManager.allocateMemory(), priority);
            //add it to the ready queue
            if (memory) {
                this.readyQueue.push(newProc);
                //set the current program to the new process
                _CPU.program = newProc;
            }
            else {
                this.pcbDiskList.push(newProc);
            }
            //update the PCB table
            TSOS.Control.updatePCB();
            //initialize
            newProc.init();
        };
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
            //create displayDate and displayTime to get date and time
            var displayDate = new Date().toLocaleDateString();
            var displayTime = new Date();
            //Update time in task bar
            document.getElementById("time").innerHTML = "Time: " + displayDate + " " + displayTime.getHours()
                + ":" + displayTime.getMinutes() + ":" + displayTime.getSeconds();
        };
        Kernel.prototype.krnTrapError = function (msg) {
            //clear the screen, reset the position, and print text at top
            _Console.clearScreen();
            _Console.resetXY();
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _DrawingContext.fillStyle = 'blue';
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _StdOut.putText("OS ERROR - TRAP: " + msg);
            this.krnShutdown();
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));