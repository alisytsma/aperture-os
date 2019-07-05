///<reference path="../globals.ts" />
/* ------------
     ProcessManager.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager() {
        }
        ProcessManager.prototype.init = function () {
        };
        ProcessManager.prototype.createNewProcess = function (pid, status, PC, acc, IR, xReg, yReg, zFlag) {
            //var newProcess = new _ProcessControlBlock(pid, status, PC, acc, IR, xReg, yReg, zFlag);
            // _ProcessControlBlock.init();
            document.getElementById("pcbPID").innerHTML = pid;
            document.getElementById("pcbStatus").innerHTML = status;
            document.getElementById("pcbPC").innerHTML = PC;
            document.getElementById("pcbAcc").innerHTML = acc;
            document.getElementById("pcbIR").innerHTML = IR;
            document.getElementById("pcbXreg").innerHTML = xReg;
            document.getElementById("pcbYreg").innerHTML = yReg;
            document.getElementById("pcbZflag").innerHTML = zFlag;
            //console.log("Process: " + newProcess.toString());
        };
        ProcessManager.readyQueue = [];
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
