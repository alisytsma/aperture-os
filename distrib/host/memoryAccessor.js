///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
/* ------------
     MemoryAccessor.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.readMemory = function (position) {
            return _Memory.memArray[_CPU.program.segment][position];
        };
        MemoryAccessor.writeMemory = function (position, val) {
            //console.log("Segment: " + _CPU.program.segment + "Current val: " + _Memory.memArray[_CPU.program.segment][position] + ", pos: " + position + ", updated val: " + val);
            val = (+val).toString(16).toUpperCase();
            if (val.length == 1)
                _Memory.memArray[_CPU.program.segment][position] = "0" + val;
            else
                _Memory.memArray[_CPU.program.segment][position] = val;
            //console.log("Update mem: " + _Memory.memArray.toString());
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        };
        MemoryAccessor.clearMem = function () {
            for (var j = 0; j < 3; j++) {
                for (var i = 0; i < 256; i++) {
                    _Memory.memArray[j][i] = "00";
                }
            }
        };
        MemoryAccessor.memoryLength = function () {
            return _Memory.memArray[0].length;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
