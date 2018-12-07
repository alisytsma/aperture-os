///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   FileSystemDeviceDriver.ts

   Requires deviceDriver.ts

   ---------------------------------- */

module TSOS {

    export class FileSystemDeviceDriver extends DeviceDriver {

        public static diskData = new Array(4);
        public static sectorLocation = 0;
        public static blockLocation = 0;
        public static sectorPointerLocation = 0;
        public static blockPointerLocation = 0;


        constructor(){
            super();
            this.driverEntry = this.krnFileDriverEntry;
        }

        public krnFileDriverEntry() {

            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public init(){

            /*

            4 tracks
            8 sectors
            8 blocks - array
             */

            // create 2D
            for (var track = 0; track < FileSystemDeviceDriver.diskData.length; track++) {
                FileSystemDeviceDriver.diskData[track] = new Array(8);
            }
            // create 3D
            for (var track = 0; track < FileSystemDeviceDriver.diskData.length; track++) {
                for (var sector = 0; sector < FileSystemDeviceDriver.diskData[0].length; sector++) {
                    FileSystemDeviceDriver.diskData[track][sector] = new Array(8);
                }
            }
            // create 4D
            for (var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for (var block = 0; block < 8; block++) {
                        FileSystemDeviceDriver.diskData[track][sector][block] = new Array(64);

                    }
                }
            }


            // populate with 0's
            for (var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for(var block = 0; block < 8; block++) {
                        for(var cell = 0; cell < 64; cell++) {
                            FileSystemDeviceDriver.diskData[track][sector][block][cell] = "00";
                        }
                    }
                }
            }

            //console.log(FileSystemDeviceDriver.diskData.toString());

        }

        public static writeDisk(type: string, content: number[]){
            var track;
            switch (type){
                case "create":
                    track = 0;
                    FileSystemDeviceDriver.diskData[track][FileSystemDeviceDriver.sectorLocation]
                        [FileSystemDeviceDriver.blockLocation][1] = "1"
                    FileSystemDeviceDriver.diskData[track][FileSystemDeviceDriver.sectorLocation]
                        [FileSystemDeviceDriver.blockLocation][2] = FileSystemDeviceDriver.sectorPointerLocation;
                    FileSystemDeviceDriver.diskData[track][FileSystemDeviceDriver.sectorLocation]
                        [FileSystemDeviceDriver.blockLocation][3] = FileSystemDeviceDriver.blockPointerLocation;
                case "write":
                    track = 1;
                case "swapping":
                    track = 2;
            }

            FileSystemDeviceDriver.diskData[track][FileSystemDeviceDriver.sectorLocation]
                [FileSystemDeviceDriver.blockLocation][0] = "1";

            for(var i = 0; i < content.length; i++) {
                FileSystemDeviceDriver.diskData[track][FileSystemDeviceDriver.sectorLocation]
                    [FileSystemDeviceDriver.blockLocation][i + 4] = content[i];
            }

            if(FileSystemDeviceDriver.blockLocation < 8) {
                FileSystemDeviceDriver.blockLocation++;
            } else {
                FileSystemDeviceDriver.blockLocation = 0;
                FileSystemDeviceDriver.sectorLocation++;
            }

            if(FileSystemDeviceDriver.blockPointerLocation < 8) {
                FileSystemDeviceDriver.blockPointerLocation++;
            } else {
                FileSystemDeviceDriver.blockPointerLocation = 0;
                FileSystemDeviceDriver.sectorPointerLocation++;
            }

            console.log(FileSystemDeviceDriver.diskData.toString());

        }

        public readDisk(){

        }

    }
}
