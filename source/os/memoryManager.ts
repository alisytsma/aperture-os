///<reference path="../globals.ts" />

/* ------------
     MemoryManager.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryManager {

        constructor(){
        }

        public init(): void {

        }

        public static updateMemory(input: string):void{
            var countRow = 0;
            var countCol = 0;
            for (var i = 0; i < input.length; i++) {
                if(input.charAt(i) != " ") {
                    _Memory.memArray[countRow][countCol] = input.substring(i, i + 2);
                    i+=2;
                    if(countCol < 7) {
                        countCol++;
                    } else {
                        countCol = 0;
                        countRow++;
                    }
                }
            }
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }
    }
}
