///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="memoryManager.ts" />
///<reference path="../host/control.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.status = "Ready";
            this.pidCount = -1;
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // roll
            sc = new TSOS.ShellCommand(this.shellRoll, "roll", "- Roll for initiative.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellLocation, "whereami", "- Display location.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Set status message.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.load, "load", " - Load and validate user input.");
            this.commandList[this.commandList.length] = sc;
            // bluescreen
            sc = new TSOS.ShellCommand(this.blueScreen, "bluescreen", " - Force an error that causes blue screen.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.run, "run", "<integer> - Run a command by process id.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.clearmem, "clearmem", " - Clear all partitions of memory");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.ps, "ps", " - Display current processes in the ready queue and their status");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.kill, "kill", "<integer> - kill process specified by process ID");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.quantum, "quantum", "<integer> - let the user set the Round Robin quantum");
            this.commandList[this.commandList.length] = sc;
            // run all
            sc = new TSOS.ShellCommand(this.runAll, "runall", " - run all ready programs");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "roll":
                        _StdOut.putText("Roll begins a (very) short game of Dungeons and Dragons.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears all the text on the console.");
                        break;
                    case "man":
                        _StdOut.putText("Man provides more details about commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown powers off the virtual OS but leaves processes running.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current version of TSOS.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace <on | off> enables or disables the OS trace.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 <string> performs rot13 encryption on the entered string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt sets the input prompt for the console.");
                        break;
                    case "date":
                        _StdOut.putText("Date prints the current time and date in your timezone.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays your current location in the universe.");
                        break;
                    case "status":
                        _StdOut.putText("Status <string> sets the status message on the task bar.");
                        break;
                    case "load":
                        _StdOut.putText("Load loads the content in the User Progam Input box and checks if it is valid hex or not.");
                        break;
                    case "bluescreen":
                        _StdOut.putText("Bluescreen forces the OS to bluescreen, or causes a fatal kernel error that requires restarting.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellRoll = function () {
            var damage = Math.floor(Math.random() * 5) + 1;
            var playerResult = Math.floor(Math.random() * 20) + 1;
            var enemyResult = Math.floor(Math.random() * 20) + 1;
            var luckRoll = Math.floor(Math.random() * 20) + 1;
            _StdOut.putText("A challenger approaches. ");
            _StdOut.advanceLine();
            _StdOut.putText("You've rolled a " + playerResult + " for initiative. ");
            _StdOut.advanceLine();
            _StdOut.putText("The challenger rolled a " + enemyResult + " for initiative. ");
            if (enemyResult > playerResult) {
                _StdOut.advanceLine();
                _StdOut.putText("The challenger attacks. They deal " + damage + " damage. ");
                _StdOut.advanceLine();
                _StdOut.putText("You are bleeding and attempt to run away.");
                _StdOut.advanceLine();
                _StdOut.putText("You roll a " + luckRoll + ". ");
                if (luckRoll >= 10) {
                    _StdOut.advanceLine();
                    _StdOut.putText("You have successfully evaded your attacker.");
                }
                else {
                    _StdOut.advanceLine();
                    _StdOut.putText("You failed. You have been defeated by the challenger.");
                }
            }
            else {
                _StdOut.advanceLine();
                _StdOut.putText("You attack. You deal " + damage + " damage. ");
                _StdOut.advanceLine();
                _StdOut.putText("They are bleeding and attempt to run away.");
                _StdOut.advanceLine();
                _StdOut.putText("They roll a " + luckRoll + ". ");
                if (luckRoll >= 10) {
                    _StdOut.advanceLine();
                    _StdOut.putText("They have successfully evaded you.");
                }
                else {
                    _StdOut.advanceLine();
                    _StdOut.putText("They failed. You have defeated the challenger.");
                }
            }
        };
        Shell.prototype.shellDate = function () {
            var today = new Date();
            var date = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            _StdOut.putText("It is " + time + " on " + date);
        };
        Shell.prototype.shellLocation = function () {
            if (_SarcasticMode) {
                _StdOut.putText("How about you go outside for once in your life and look?");
            }
            else {
                _StdOut.putText("Earth, I'd assume.");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            //if status arguments
            if (args.length > 0) {
                //loop for length of arguments to add them together to make a
                //sentence with a space inbetween
                for (var i = 0; i < args.length; i++) {
                    var sentenceBuilder = args[i];
                    this.status += sentenceBuilder + " ";
                }
            }
            //print update that status has been changed
            _StdOut.putText("Status set to " + this.status);
            //update status on host
            document.getElementById("status").innerHTML = "Status: " + this.status + " | ";
        };
        Shell.prototype.load = function () {
            var input = (document.getElementById("taProgramInput").value);
            var valid = true;
            _StdOut.putText("Loading...");
            _StdOut.advanceLine();
            for (var i = 0; i < input.length; i++) {
                if (((i + 1) % 3 == 0) && input.charAt(i) != " ") {
                    _StdOut.putText("Must add a space at position " + i);
                    valid = false;
                    break;
                }
                if (input.charAt(i).match("-?[0-9a-fA-F\\s]+")) {
                    valid = true;
                }
                else {
                    _StdOut.putText("Character " + input.charAt(i) + " at position " + i + " is not valid hex input.");
                    valid = false;
                    break;
                }
            }
            if (input == "") {
                valid = false;
                _StdOut.putText("No text entered, not valid hex input.");
            }
            if (valid) {
                if (TSOS.MemoryManager.checkMemory()) {
                    _OsShell.pidCount++;
                    _Kernel.createProcess(_OsShell.pidCount);
                    _StdOut.putText("Loaded with a PID of " + String(_OsShell.pidCount));
                    TSOS.MemoryManager.updateMemory(input.toString());
                }
            }
        };
        //force a kernel error
        Shell.prototype.blueScreen = function () {
            _Kernel.krnTrapError("Error caused by user");
        };
        //run a program
        Shell.prototype.run = function (args) {
            _CPU.scheduling = false;
            var validPID = false;
            //if the arg matches a process id that's in the ready queue and it hasn't been run yet, set to valid
            for (var i = 0; i < _Kernel.readyQueue.length; i++) {
                console.log("Stat " + _Kernel.readyQueue[i].processId + ": " + _Kernel.readyQueue[i].status);
                if (_Kernel.readyQueue[i].processId == args && _Kernel.readyQueue[i].status == "Ready")
                    validPID = true;
            }
            //if valid
            if (validPID) {
                //set running pid to args
                _CPU.runningPID = args;
                //set program equal to the one we're running
                _CPU.program = _Kernel.readyQueue[args];
                //add to running queue
                _Kernel.runningQueue.push(_CPU.program);
                //reset CPU
                _CPU.position = 0;
                _CPU.Acc = "0";
                _CPU.IR = "0";
                _CPU.Xreg = "0";
                _CPU.Yreg = "0";
                _CPU.Zflag = "0";
                _CPU.isExecuting = false;
                TSOS.Control.updateCPU(_CPU.position, _CPU.Acc, _CPU.IR, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                //disable single step
                if (_CPU.singleStep == false)
                    _CPU.isExecuting = true;
            }
            else {
                _StdOut.putText("Not a valid PID");
            }
        };
        //clear all memory partitions
        Shell.prototype.clearmem = function () {
            //mark all as free
            _Memory.mem0Free = true;
            _Memory.mem1Free = true;
            _Memory.mem2Free = true;
            //clear memory
            TSOS.MemoryAccessor.clearMem();
            //clear table and reload it
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        };
        //display processes in ready queue and their status
        Shell.prototype.ps = function () {
            for (var i = 0; i < _Kernel.readyQueue.length; i++) {
                _StdOut.putText("Process " + _Kernel.readyQueue[i].processId + " is " + _Kernel.readyQueue[i].status);
                _StdOut.advanceLine();
            }
        };
        //kill a process
        Shell.prototype.kill = function (args) {
            _CPU.program = _Kernel.readyQueue[args];
            _CPU.terminateProgram();
        };
        //set quantum
        Shell.prototype.quantum = function (args) {
            _CPU.quantum = args;
        };
        //run all programs
        Shell.prototype.runAll = function () {
            _CPU.scheduling = true;
            //add to running queue
            console.log("B - Ready length: " + _Kernel.readyQueue.length + ", Running length: " + _Kernel.runningQueue.length);
            _Kernel.runningQueue = _Kernel.readyQueue.slice(0);
            console.log("A - Ready length: " + _Kernel.readyQueue.length + ", Running length: " + _Kernel.runningQueue.length);
            //set running pid to args
            _CPU.runningPID = _Kernel.runningQueue[0].processId;
            //set program equal to the one we're running
            _CPU.program = _Kernel.readyQueue[0];
            /*
            //reset CPU
            _CPU.position = 0;
            _CPU.Acc = "0";
            _CPU.IR = "0";
            _CPU.Xreg = "0";
            _CPU.Yreg = "0";
            _CPU.Zflag = "0";
            _CPU.isExecuting = false;
            TSOS.Control.updateCPU(_CPU.position, _CPU.Acc, _CPU.IR, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
            //disable single step
            if(_CPU.singleStep == false)
                _CPU.isExecuting = true;
            if(_CPU.scheduling == true)
                TSOS.Scheduler.roundRobin();*/
            //disable single step
            if (_CPU.singleStep == false)
                _CPU.isExecuting = true;
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
