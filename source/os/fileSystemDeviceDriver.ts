///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   FileSystemDeviceDriver.ts

   Requires deviceDriver.ts

   ---------------------------------- */

module TSOS {

    export class FileSystemDeviceDriver extends DeviceDriver {

        public static diskData = new Array(4);


        constructor(){
            super();
            this.driverEntry = this.krnFileDriverEntry;
            this.isr = this.rollIn;
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


            // populate with 0's
            for (var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for(var block = 0; block < 8; block++) {
                        FileSystemDeviceDriver.diskData[track][sector][block] = "00";
                    }
                }
            }

            console.log(FileSystemDeviceDriver.diskData.toString());

        }

        public rollIn(){

        }

    }
}
