///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />

/* ------------
     MemoryManager.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryManager {

        public static endProgram;

        public static updateMemory(input: string):void{
            console.log("Before: " + _Memory.memArray.toString());
            var position = 0;
            for (var i = 0; i < input.length; i++) {
                if(input.charAt(i) != " ") {
                    _Memory.memArray[_Memory.memArraySegment][position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            this.endProgram = position;
            console.log("After: " + _Memory.memArray.toString() + " length: " + this.endProgram);
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }
    }
}
