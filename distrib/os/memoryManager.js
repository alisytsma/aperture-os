///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
/* ------------
     MemoryManager.tss

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        // update memory with new values
        MemoryManager.updateMemory = function (input, segment) {
            var position = 0;
            for (var i = 0; i < input.length; i++) {
                if (input.charAt(i) != " " && input.charAt(i) != "\"" && input.charAt(i) != "," && input.charAt(i) != "[" && input.charAt(i) != "]") {
                    _Memory.memArray[segment][position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            // set the end of the program to last position
            this.endProgram = position;
            // clear memory table and then load it again
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        };
        // return first section of memory that's free
        MemoryManager.allocateMemory = function () {
            if (_Memory.mem0Free) {
                _Memory.mem0Free = false;
                return 0;
            }
            else if (_Memory.mem1Free) {
                _Memory.mem1Free = false;
                return 1;
            }
            else if (_Memory.mem2Free) {
                _Memory.mem2Free = false;
                return 2;
            }
            else {
                return 99;
            }
        };
        // check if memory is full
        MemoryManager.checkMemory = function () {
            if (_Memory.mem0Free || _Memory.mem1Free || _Memory.mem2Free) {
                return true;
            }
            else {
                return false;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
