///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
/* ----------------------------------
   FileSystemDeviceDriver.ts

   Requires deviceDriver.ts

   ---------------------------------- */
var TSOS;
(function (TSOS) {
    var Block = /** @class */ (function () {
        function Block(track, sector, block) {
            this.track = track;
            this.sector = sector;
            this.block = block;
        }
        Block.prototype.disk = function () {
            /*
            4 tracks
            8 sectors
            8 blocks - array
             */
            for (var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for (var block = 0; block < 8; block++) {
                    }
                }
            }
        };
        return Block;
    }());
    TSOS.Block = Block;
})(TSOS || (TSOS = {}));
