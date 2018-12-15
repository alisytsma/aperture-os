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
        public static fileBlock = 1;
        public static trackFree = true;


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

            FileSystemDeviceDriver.cell.fill("00");

            // populate with 0's
            for(var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for (var block = 0; block < 8; block++) {
                        sessionStorage.setItem(track + "," + sector + "," + block, JSON.stringify(FileSystemDeviceDriver.cell));
                    }
                }
            }
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

            var stringBuilder = "";

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
                for(var j = 4; j <= dataUntil; j++) {
                    if (String.fromCharCode(parseInt(parsedData[j], 16)) != "\""){
                        if (String.fromCharCode(parseInt(parsedData[j], 16)) != ",")
                            stringBuilder += String.fromCharCode(parseInt(parsedData[j], 16));
                        else
                            stringBuilder += " ";
                    }
                }
                _StdOut.putText(stringBuilder);
            } else {
                _StdOut.putText("File not found");
            }


        }

        public static deleteDisk(fileName: number[]){
            // fill location and pointer with 0's
            FileSystemDeviceDriver.cell.fill("00");
            var location = TSOS.FileSystemDeviceDriver.findFile(fileName);
            sessionStorage.setItem("0" + location, JSON.stringify(FileSystemDeviceDriver.cell));
            sessionStorage.setItem("1" + location, JSON.stringify(FileSystemDeviceDriver.cell));

            _StdOut.putText("File deleted");

            // update disk
            Control.clearDisk();
            Control.loadDisk();
        }

        // function to check if a track has data or not
        public static checkDisk(track: number){
            for(var j = 0; j < 8; j++){
                for(var p = 0; p < 8; p++){
                    var retrievedData = sessionStorage.getItem(track + "," + j + "," + p);
                    var retrievedBlock = JSON.parse(retrievedData);
                    console.log(retrievedBlock.toString());
                    for(var i = 0; i < retrievedBlock.length; i++) {
                        if (retrievedBlock[i] != "00") {
                            // if there's any data other than 00, not empty
                            return false;
                        }
                    }
                }
            }
            // if we make it through the whole track with only 00's, it's empty
            return true;
        }

        public static rollIn(input: string, track: number): void {

            // get data from disk and parse it
            var retrievedData = sessionStorage.getItem(track + ",0,0");
            var parsedData = JSON.parse(retrievedData);
            // data starts at position 3
            var position = 3;
            for (var i = 0; i < input.length; i++) {
                // replace the parsed data with the input if it's not a space
                if(input.charAt(i) != " ") {
                    parsedData[position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            // set the data at the right position
            sessionStorage.setItem(track.toString() + ",0,0", JSON.stringify(parsedData));

            // update disk
            Control.clearDisk();
            Control.loadDisk();

        }

        public static rollOut(track: number, replacing: number){

            // set segment of disk pcb equal to first open memory spot
            _Kernel.pcbDiskList[0].segment = TSOS.MemoryManager.allocateMemory();

            console.log("Roll " + _Kernel.pcbDiskList[0].processId + " out into memory segment " + _Kernel.pcbDiskList[0].segment);

            var retrievedData;
            retrievedData = sessionStorage.getItem(track + ",0,0");
            // parse the retrieved data
            var parsedData = JSON.parse(retrievedData);
            // delete the first 3 bits (pointer)
            parsedData.splice(0,3);
            // add this data to memory in the right segment
            TSOS.MemoryManager.updateMemory(JSON.stringify(parsedData), _Kernel.pcbDiskList[0].segment);
            if(_Kernel.readyQueue.length < 3) {
                // add to ready and running queues
                _Kernel.readyQueue.push(_Kernel.pcbDiskList[0]);
                _Kernel.runningQueue.push(_Kernel.pcbDiskList[0]);
            } else {
                _Kernel.readyQueue[replacing] = _Kernel.pcbDiskList[0];
                _Kernel.runningQueue[replacing] = _Kernel.pcbDiskList[0];
            }
            // clear the disk track
            this.formatDisk(track);
            // remove from disk list
            _Kernel.pcbDiskList.splice(0,1);
            // update disk
            Control.clearDisk();
            Control.loadDisk();

        }

        public static formatDisk(track: number){

            FileSystemDeviceDriver.cell.fill("00");

            // populate with 0's
            for (var sector = 0; sector < 8; sector++) {
                for (var block = 0; block < 8; block++) {
                    sessionStorage.setItem(track + "," + sector + "," + block, JSON.stringify(FileSystemDeviceDriver.cell));
                }
            }

            Control.clearDisk();
            Control.loadDisk();

        }
    }
}
