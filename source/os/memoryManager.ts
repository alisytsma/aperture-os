///<reference path="../globals.ts" />

/* ------------
     MemoryManager.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryManager {

        public static updateMemory(input: string):void{
            console.log("Before: " + _Memory.memArray.toString());
            var position = 0;
            for (var i = 0; i < input.length; i++) {
                if(input.charAt(i) != " ") {
                    _Memory.memArray[position] = input.substring(i, i + 2).toUpperCase();
                    i+=2;
                    position++;
                }
            }
            console.log("After: " + _Memory.memArray.toString());
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }
    }
}
