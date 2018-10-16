///<reference path="../globals.ts" />

/* ------------
     MemoryAccessor.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {

        public static readMemory(column: number, row: number): void {
            return _Memory.memArray[column][row];
        }

        public static writeMemory(column: number, row: number,  val: string): void{
            _Memory.memArray[column][row] = val;

        }
    }

}
