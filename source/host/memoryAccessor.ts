///<reference path="../globals.ts" />

/* ------------
     MemoryAccessor.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {

        public static readMemory(position: number): void {
            return _Memory.memArray[position];
        }

        public static writeMemory(position: number,  val: string): void {
            console.log("Current val: " + _Memory.memArray[position] + ", pos: " + position + ", updated val: " + val);
            _Memory.memArray[position] = val;
            console.log("Update mem: " + _Memory.memArray.toString());
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }

        public static clearMem(): void {
            for(var i = 0; i < 256; i++){
                    _Memory.memArray[i] = "00";
            }
        }

        public static memoryLength(): number{
            return _Memory.memArray.length;
        }
    }

}
