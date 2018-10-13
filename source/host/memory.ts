///<reference path="../globals.ts" />

/* ------------
     memory.ts

     Requires global.ts.

     ------------ */

module TSOS {

    export class Memory {
        public memArray = [["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"],
            ["00","00","00","00","00","00","00","00"]];
        public memArrayCountRow = 0;
        public memArrayCountColumn = 0;


        constructor(


            ) {

        }

        public init(): void {

                this.printTable();

        }

        public printTable(): void{
            var tableDiv = document.getElementById("divMemory");
            var tbl  = document.createElement('table');
            tbl.setAttribute("id", "tableMemory");
            var memNum = 0;

            for(var i = 0; i < 32; i++){
                var tr = tbl.insertRow();
                for(var j = 0; j < 9; j++){
                    var td = tr.insertCell();
                    if(j == 0) {
                        if(memNum < 10)
                            td.appendChild(document.createTextNode("0x00" + memNum));
                        else if(memNum < 100)
                            td.appendChild(document.createTextNode("0x0" + memNum));
                        else
                            td.appendChild(document.createTextNode("0x" + memNum));
                    }
                    else {
                        td.appendChild(document.createTextNode(this.memArray[this.memArrayCountRow][this.memArrayCountColumn]));
                        if(this.memArrayCountRow < 8) {
                            this.memArrayCountRow++;
                        } else {
                            this.memArrayCountRow = 0;
                            this.memArrayCountColumn++;
                        }

                    }
                }
                memNum += 8;
            }
            tableDiv.appendChild(tbl);
            //tbl.setAttribute('color','blue');
            document.getElementById("tableMemory").style.height = '100px';
            document.getElementById("tableMemory").style.overflow = 'auto';
            document.getElementById("tableMemory").style.border = '1px solid black';
        }
    }
}
