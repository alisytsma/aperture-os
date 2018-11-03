///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />

/* ------------
     MemoryManager.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryManager {

        public static endProgram;

        public static updateMemory(input: string):void {
            console.log("Before: " + _Memory.memArray.toString());
            var position = 0;
            for (var i = 0; i < input.length; i++) {
                if(input.charAt(i) != " ") {
                    _Memory.memArray[_CPU.program.segment][position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            this.endProgram = position;
            console.log("After: " + _Memory.memArray.toString() + " length: " + this.endProgram);
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }

        public static allocateMemory() : number{
            if(_Memory.mem0Free){
                _Memory.memArraySegment = 0;
                _Memory.mem0Free = false;
                console.log("Free: 0");
                return 0;
            } else if(_Memory.mem1Free){
                _Memory.memArraySegment = 1;
                _Memory.mem1Free = false;
                console.log("Free: 1");

                return 1;
            } else if(_Memory.mem2Free){
                _Memory.memArraySegment = 2;
                console.log("Free: 2");
                _Memory.mem2Free = false;
                return 2;
            } else {
                return 99;
            }
        }

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
