///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public status = "Ready";
        public pidCount = -1;


        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;


            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // roll
            sc = new ShellCommand(this.shellRoll,
                "roll",
                "- Roll for initiative.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellLocation,
                "whereami",
                "- Display location.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Set status message.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.load,
                "load",
                " - Load and validate user input.");
            this.commandList[this.commandList.length] = sc;

            // bluescreen
            sc = new ShellCommand(this.blueScreen,
                "bluescreen",
                " - Force an error that causes blue screen.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.run,
                "run",
                "<integer> - Run a command by process id.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION)
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
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

            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellRoll() {
            var damage = Math.floor(Math.random() * 5) + 1;
            var playerResult = Math.floor(Math.random() * 20) + 1;
            var enemyResult = Math.floor(Math.random() * 20) + 1;
            var luckRoll = Math.floor(Math.random() * 20) + 1;

            _StdOut.putText("A challenger approaches. ");
            _StdOut.advanceLine();
            _StdOut.putText("You've rolled a " + playerResult + " for initiative. ");
            _StdOut.advanceLine();
            _StdOut.putText("The challenger rolled a " + enemyResult + " for initiative. ");

            if(enemyResult > playerResult){
                _StdOut.advanceLine();
                _StdOut.putText("The challenger attacks. They deal " + damage + " damage. ");
                _StdOut.advanceLine();
                _StdOut.putText("You are bleeding and attempt to run away.");
                _StdOut.advanceLine();
                _StdOut.putText("You roll a " + luckRoll + ". ");
                if (luckRoll >= 10 ) {
                    _StdOut.advanceLine();
                    _StdOut.putText("You have successfully evaded your attacker.");
                } else {
                    _StdOut.advanceLine();
                    _StdOut.putText("You failed. You have been defeated by the challenger.");
                }

            } else {
                _StdOut.advanceLine();
                _StdOut.putText("You attack. You deal " + damage + " damage. ");
                _StdOut.advanceLine();
                _StdOut.putText("They are bleeding and attempt to run away.");
                _StdOut.advanceLine();
                _StdOut.putText("They roll a " + luckRoll + ". ");
                if (luckRoll >= 10) {
                    _StdOut.advanceLine();
                    _StdOut.putText("They have successfully evaded you.");
                } else {
                    _StdOut.advanceLine();
                    _StdOut.putText("They failed. You have defeated the challenger.");
                }
            }
        }

        public shellDate(){
            var today = new Date();
            var date = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            _StdOut.putText("It is " + time + " on " + date);
        }


        public shellLocation(){
            if(_SarcasticMode){
                _StdOut.putText("How about you go outside for once in your life and look?");
            } else {
                _StdOut.putText("Earth, I'd assume.");
            }
        }

        public shellStatus(args){
            //set status equal to input
            this.status = args;
            //print update that status has been changed
            _StdOut.putText("Status set to " + args);
            //update status on host
            document.getElementById("status").innerHTML = "Status: " + this.status + " | ";
        }

        public load(){
            var input = ((document.getElementById("taProgramInput") as HTMLInputElement).value);
            var valid = true;
            _StdOut.putText("Loading...");
            _StdOut.advanceLine();

            for(var i = 0; i < input.length; i++) {
                if(((i + 1) % 3 == 0) && input.charAt(i) != " "){
                    _StdOut.putText("Must add a space at position " + i);
                    valid = false;
                    break;
                }
                if (input.charAt(i).match("-?[0-9a-fA-F\\s]+")) {
                    valid = true;
                } else {
                    _StdOut.putText("Character " + input.charAt(i) + " at position " + i + " is not valid hex input.");
                    valid = false;
                    break;
                }
            }
            if(input == "") {
                valid = false;
                _StdOut.putText("No text entered, not valid hex input.");
            }
            if(valid) {
                _OsShell.pidCount++;
                _StdOut.putText("Loaded with a PID of " + String(_OsShell.pidCount));
                TSOS.MemoryManager.updateMemory(input.toString());
                _Kernel.createProcess(_OsShell.pidCount);
            }
        }

        //force a kernel error
        public blueScreen(){
            _Kernel.krnTrapError("Error caused by user");
        }

        //run a program
        public run(args){
            //console.log("PID: " + _OsShell.pidCount);
            if(_OsShell.pidCount == args) {
                _CPU.runningPID = args;
                _CPU.PC = 0;
                _CPU.Acc = "0";
                _CPU.IR = "0";
                _CPU.Xreg = "0";
                _CPU.Yreg = "0";
                _CPU.Zflag = "0";
                _CPU.isExecuting = false;
                TSOS.Control.updateCPU(_CPU.PC, _CPU.Acc, _CPU.IR, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
                if(_CPU.singleStep == false)
                    _CPU.isExecuting = true;
            } else {
                _StdOut.putText("Not a valid PID");
            }
        }
    }
}
