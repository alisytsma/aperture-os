///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />

/* ------------
     MemoryManager.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryManager {

        public static endProgram;

        // update memory with new values
        public static updateMemory(input: string):void {
            var position = 0;
            for (var i = 0; i < input.length; i++) {
                if(input.charAt(i) != " ") {
                    _Memory.memArray[_CPU.program.segment][position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            // set the end of the program to last position
            this.endProgram = position;
            // clear memory table and then load it again
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }

        // return first section of memory that's free
        public static allocateMemory() : number{
            if(_Memory.mem0Free){
                _Memory.mem0Free = false;
                return 0;
            } else if(_Memory.mem1Free){
                _Memory.mem1Free = false;
                return 1;
            } else if(_Memory.mem2Free){
                _Memory.mem2Free = false;
                return 2;
            } else {
                return 99;
            }
        }

        // check if memory is full
        public static checkMemory(): boolean {
            if(_Memory.mem0Free ||_Memory.mem1Free ||_Memory.mem2Free){
                return true;
            } else {
                _StdOut.putText("Memory full");
                return false;
            }
        }
    }
}
