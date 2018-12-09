///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   FileSystemDeviceDriver.ts

   Requires deviceDriver.ts

   ---------------------------------- */

module TSOS {

    export class FileSystemDeviceDriver extends DeviceDriver {

        //public static diskData = new Array(8);
        public static cell = new Array(64);
        public static trackLocation = 0;
        public static sectorLocation = 0;
        public static blockLocation = 0;
        public static fileSector = 0;
        public static fileBlock = 0;


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

            /* 4 tracks
            8 sectors
            8 blocks - array

            // create 2D
            for (var sector = 0; sector < FileSystemDeviceDriver.diskData.length; sector++) {
                FileSystemDeviceDriver.diskData[sector] = new Array(8);
            }

            // create 3D
            for (var sector = 0; sector < FileSystemDeviceDriver.diskData[0].length; sector++) {
                for (var block = 0; block < FileSystemDeviceDriver.diskData[0].length; block++) {
                    FileSystemDeviceDriver.diskData[sector][block] = new Array(64);
                }
            }*/

            FileSystemDeviceDriver.cell.fill("00");

            // populate with 0's
            for(var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for (var block = 0; block < 8; block++) {
                        sessionStorage.setItem(track + "," + sector + "," + block, JSON.stringify(FileSystemDeviceDriver.cell));
                    }
                }
            }




            //console.log(FileSystemDeviceDriver.diskData.toString());

        }

        public static writeDisk(type: string, content: number[]){
            switch (type){
                case "create":
                    this.sectorLocation = this.fileSector;
                    this.blockLocation = this.fileBlock;
                    this.trackLocation = 0;
                    var retrievedData = sessionStorage.getItem("0," + this.sectorLocation +"," + this.blockLocation).toString();
                    var block = JSON.parse(retrievedData);
                    block[0] = "1";
                    block[1] = "1";
                    block[2] = this.sectorLocation;
                    block[3] = this.blockLocation;
                    sessionStorage.setItem("0,"+ this.sectorLocation +"," + this.blockLocation, JSON.stringify(block));
                    break;

                case "write":
                    this.trackLocation = 1;
                    var retrievedData = sessionStorage.getItem("1," + this.sectorLocation + "," + this.blockLocation).toString();
                    var block = JSON.parse(retrievedData);
                    block[0] = "1";
                    sessionStorage.setItem("1," + this.sectorLocation +"," + this.blockLocation, JSON.stringify(block));
                    break;

                case "swapping":
                    break;

            }

            retrievedData = sessionStorage.getItem(this.trackLocation + "," + this.sectorLocation +"," + this.blockLocation).toString();
            block = JSON.parse(retrievedData);

            console.log("Location: " + this.trackLocation + "," + this.sectorLocation +"," + this.blockLocation);

            for(var i = 0; i < content.length; i++) {
                block[i+4] = content[i].toString();
                console.log("Content: " + block[i+4]);
                sessionStorage.setItem(this.trackLocation + "," + this.sectorLocation + "," + this.blockLocation, JSON.stringify(block));
            }

            if(FileSystemDeviceDriver.fileBlock < 8) {
                FileSystemDeviceDriver.fileBlock++;
                _StdOut.putText("Disk written successfully");
            } else if (FileSystemDeviceDriver.fileBlock >= 8 && FileSystemDeviceDriver.fileSector < 8){
                FileSystemDeviceDriver.fileBlock = 0;
                FileSystemDeviceDriver.fileSector++;
                _StdOut.putText("Disk written successfully");
            } else {
                _StdOut.putText("Disk write failure");

            }


            for(var i = 0; i < 2; i++) {
                for(var j = 0; j < 8; j++){
                    for(var p = 0; p < 8; p++){
                        console.log("Location: " + i + "," + j + "," + p + " Content: " + sessionStorage.getItem((i + "," + j + "," + p)));

                    }
                }
            }

            Control.clearDisk();
            Control.loadDisk();

        }

        public static findFile(fileName: number[]){
            var found = false;
            for(var sector = 0; sector < 8; sector++){
                for(var block = 0; block < 8; block++){
                    for(var cell = 0; cell < 64; cell++){

                        var retrievedData = sessionStorage.getItem("0," + sector + "," + block);
                        var retrievedBlock = JSON.parse(retrievedData);
                        for(var i = 0; i < fileName.length; i++) {
                            if (fileName[i].toString() == retrievedBlock[cell + i]) {
                                found = true;
                            } else {
                                found = false;
                            }
                        }

                        if(found) {
                            this.sectorLocation = sector;
                            this.blockLocation = block;
                            return "," + sector + "," + block;
                        }

                        console.log("sec: " + this.sectorLocation + " block: " + this.blockLocation);
                    }
                }
            }
            return false;
        }

        public static readDisk(fileName: number[]){

            console.log("1," + this.findFile(fileName));

            var retrievedData = sessionStorage.getItem("1" + this.findFile(fileName));
            var parsedData = JSON.parse(retrievedData);
            var dataUntil = 5;

            for(var i = 4; i < parsedData.length; i++){
                if(parsedData[i] == "00"){
                    dataUntil = i;
                    break;
                }
            }

            if(dataUntil > 4){
                for(var j = 4; j <= dataUntil; j++){
                    _StdOut.putText(String.fromCharCode(parseInt(parsedData[j], 16)));
                }
            } else {
                _StdOut.putText("File not found");
            }

        }

        public static deleteDisk(fileName: number[]){
            FileSystemDeviceDriver.cell.fill("00");
            var location = TSOS.FileSystemDeviceDriver.findFile(fileName);
            sessionStorage.setItem("0" + location, JSON.stringify(FileSystemDeviceDriver.cell));
            sessionStorage.setItem("1" + location, JSON.stringify(FileSystemDeviceDriver.cell));

            console.log("Deleting: 1" + location);
            console.log("Deleted: " + sessionStorage.getItem("1" + location));
            _StdOut.putText("File deleted");

            Control.clearDisk();
            Control.loadDisk();
        }

    }
}
