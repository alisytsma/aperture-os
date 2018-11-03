///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />


/* ------------
     MemoryAccessor.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {

        public static readMemory(position: number): string {
            return _Memory.memArray[_Memory.memArraySegment][position];
        }

        public static writeMemory(position: number,  val: string): void {
            console.log("Current val: " + _Memory.memArray[position] + ", pos: " + position + ", updated val: " + val);
            val = (+val).toString(16).toUpperCase();
            if(val.length == 1)
                _Memory.memArray[_Memory.memArraySegment][position] = "0" + val;
            else
                _Memory.memArray[_Memory.memArraySegment][position] = val;
            console.log("Update mem: " + _Memory.memArray.toString());
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }

        public static clearMem(): void {
            for(var j = 0; j < 3; j++) {
                for (var i = 0; i < 256; i++) {
                    _Memory.memArray[j][i] = "00";
                }
            }
        }

        public static memoryLength(): number{
            return _Memory.memArray.length;
        }
    }

}
