///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
///<reference path="../host/devices.ts" />
///<reference path="../os/kernel.ts" />
///<reference path="../host/cpu.ts" />
///<reference path="../os/fileSystemDeviceDriver.ts" />




/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {
        public static tbl = document.createElement('table');
        public static tblPCB = document.createElement('table');
        public static tblDisk = document.createElement('table');
        public static memArrayPosition = 0;


        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt, Reset, and single step buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnStepEna")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

             // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.



            this.loadTable();
            this.loadDisk();

        }

        public static initCpu(): void {
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();
            //console.log("reinit");
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        //enable/disable step mode
        public static hostBtnStepEna_click(btn): void {
            if (_CPU.singleStep == false) {
                _CPU.singleStep = true;
                (<HTMLInputElement> document.getElementById("btnStep")).disabled = false;
                (<HTMLInputElement> document.getElementById("btnStepEna")).value = "Disable Single Step Mode";
            } else {
                _CPU.singleStep = false;
                (<HTMLInputElement> document.getElementById("btnStep")).disabled = true;
                (<HTMLInputElement> document.getElementById("btnStepEna")).value = "Enable Single Step Mode";

            }
        }

        //disable step mode
        public static disableSingleStep(): void {
            _CPU.singleStep = false;
            (<HTMLInputElement> document.getElementById("btnStep")).disabled = true;
            (<HTMLInputElement> document.getElementById("btnStepEna")).value = "Enable Single Step Mode";

        }

        //step button
        public static hostBtnStep_click(btn): void {
            _CPU.cycle();
        }

        public static loadDisk(): void {

            //find table div and set id
            var divDisk = document.getElementById("divDisk");
            this.tblDisk.setAttribute("id", "tableDisk");

            for(var p = 0; p < 4; p++) {
                //loop through 32 times to create 32 rows
                for (var i = 0; i < 8; i++) {
                    //create 9 columns in those rows
                    for (var j = 0; j < 8; j++) {
                        var tr = this.tblDisk.insertRow();
                        for(var s = 0; s < 64; s++) {
                            var td = tr.insertCell();
                            if(s == 0){
                                //console.log(p.toString() + "," + i.toString() + "," + j.toString());
                                td.appendChild(document.createTextNode(p.toString() + ", " + i.toString() + ", " + j.toString()));
                            } else {
                                //add memory value to cell
                                td.appendChild(document.createTextNode(TSOS.FileSystemDeviceDriver.diskData[p][i][j][s]));
                            }
                        }
                    }
                }
            }
            //add to page
            divDisk.appendChild(this.tblDisk);
        }

        //function to clear the memory table
        public static clearTable(): void {
            var tableDiv = document.getElementById("divMemory");
            //loop down to delete every row
            for (var i = this.tbl.rows.length - 1; i >= 0; i--)
                this.tbl.deleteRow(i);
        }

        //function to update the memory table
        public static loadTable(): void {
            //find table div and set id
            var tableDiv = document.getElementById("divMemory");
            this.tbl.setAttribute("id", "tableMemory");
            //set equal to number that memory column header should be equal to
            var memNum = 0;
            //console.log(_Memory.memArray.toString());

            for(var p = 0; p < 3; p++) {
                //loop through 32 times to create 32 rows
                for (var i = 0; i < 32; i++) {
                    var tr = this.tbl.insertRow();
                    //create 9 columns in those rows
                    for (var j = 0; j < 9; j++) {
                        var td = tr.insertCell();
                        //if first in column
                        if (j == 0) {
                            var hexNum = memNum.toString(16).toUpperCase();
                            //if single digit, add 0x00 in front
                            if (hexNum.length == 1)
                                td.appendChild(document.createTextNode("0x00" + hexNum));
                            //if two digits, add 0x0 in front
                            else if (hexNum.length == 2)
                                td.appendChild(document.createTextNode("0x0" + hexNum));
                            //if three digits, add 0x in front
                            else
                                td.appendChild(document.createTextNode("0x" + hexNum));
                        }
                        //if not first in column
                        else {
                            //add memory value to cell
                            td.appendChild(document.createTextNode(_Memory.memArray[p][this.memArrayPosition]));

                            //increment row count
                            this.memArrayPosition++;
                        }
                    }
                    //increment column header by 8
                    memNum += 8;
                }
                this.memArrayPosition = 0;
            }
            //add to page
            tableDiv.appendChild(this.tbl);
            //set height and overflow of memory table
            document.getElementById("tableMemory").style.height = '100px';
            document.getElementById("tableMemory").style.overflow = 'auto';
            //reset counters to 0
            this.memArrayPosition = 0;
        }

        public static updatePCB(): void {
            this.clearPCB();
            //find table div and set id
            var divPCB = document.getElementById("divPCB");
            this.tblPCB.setAttribute("id", "tablePCB");

            //loop through for the length of the ready queue to get PCB count
            for (var i = 0; i <= _Kernel.readyQueue.length; i++) {
                var tr = this.tblPCB.insertRow();
                //create 8 columns in those rows
                for (var j = 0; j < 8; j++) {
                    var td = tr.insertCell();
                    if(i == 0){
                        //add titles to cell if first row
                        switch (j) {
                            case 0:
                                td.appendChild(document.createTextNode("PID"));
                                break;
                            case 1:
                                td.appendChild(document.createTextNode("Status"));
                                break;
                            case 2:
                                td.appendChild(document.createTextNode("PC"));
                                break;
                            case 3:
                                td.appendChild(document.createTextNode("IR"));
                                break;
                            case 4:
                                td.appendChild(document.createTextNode("Acc"));
                                break;
                            case 5:
                                td.appendChild(document.createTextNode("X"));
                                break;
                            case 6:
                                td.appendChild(document.createTextNode("Y"));
                                break;
                            case 7:
                                td.appendChild(document.createTextNode("ZF"));
                                break;
                        }
                    } else {
                        if (_Kernel.readyQueue[i - 1].status != "Terminated") {
                            //add appropriate values to cell
                            switch (j) {
                                case 0:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].processId));
                                    break;
                                case 1:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].status));
                                    break;
                                case 2:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].position));
                                    break;
                                case 3:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].IR));
                                    break;
                                case 4:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].Acc));
                                    break;
                                case 5:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].Xreg));
                                    break;
                                case 6:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].Yreg));
                                    break;
                                case 7:
                                    td.appendChild(document.createTextNode(_Kernel.readyQueue[i - 1].Zflag));
                                    break;
                            }
                        }
                    }
                }
            }
            //add to page
            divPCB.appendChild(this.tblPCB);
        }

        public static clearPCB(): void {
            for (var i = this.tblPCB.rows.length - 1; i >= 0; i--)
                this.tblPCB.deleteRow(i);
        }

        public static updateCPU(PC: number, Acc: string, IR: string, Xreg: string, Yreg: string, Zflag: string): void {
            document.getElementById("PC").innerHTML = PC.toString();
            document.getElementById("Acc").innerHTML = Acc;
            document.getElementById("IR").innerHTML = IR;
            document.getElementById("Xreg").innerHTML = Xreg;
            document.getElementById("Yreg").innerHTML = Yreg;
            document.getElementById("Zflag").innerHTML = Zflag;
        }
    }
}
