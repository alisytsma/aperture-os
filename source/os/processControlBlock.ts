///<reference path="../globals.ts" />

/* ------------
     ProcessControlBlock.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class ProcessControlBlock {

        constructor(
            public processId: number = 0,
            public status: string = "Ready",
            public PC: number = 0,
            public IR: string = "00",
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
    ){

    }

        public init(): void {

            this.processId = 0;
            this.status = "Ready";
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;

        }
    }
}
