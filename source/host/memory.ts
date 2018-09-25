///<reference path="../globals.ts" />

/* ------------
     memory.ts

     Requires global.ts.

     ------------ */

module TSOS {

    export class Memory {
        public memArray = ["0","0","0","0","0","0","0","0",
                           "0","0","0","0","0","0","0","0",
                           "0","0","0","0","0","0","0","0",
                           "0","0","0","0","0","0","0","0"];
        public memArrayCount = 0;

        constructor(


            ) {

        }

        public init(): void {

                this.printTable();

        }

        public printTable(): void{
            var tableDiv = document.getElementById("divMemory");
            var tbl  = document.createElement('table');

            for(var i = 0; i < 4; i++){
                var tr = tbl.insertRow();
                for(var j = 0; j < 8; j++){
                    if(i == 4 && j == 8){
                        break;
                    } else {
                        var td = tr.insertCell();
                        td.appendChild(document.createTextNode(this.memArray[this.memArrayCount]));
                        this.memArrayCount++;
                    }
                }
            }
            tableDiv.appendChild(tbl);
        }
    }
}
