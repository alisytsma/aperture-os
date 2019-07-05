///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   FileSystemDeviceDriver.tss
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

            for(var i = 0; i < content.length; i++) {
                block[i+4] = content[i].toString();
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

        public static rollInWrite(input: string, track: number, block: number, startingPos: number): void {
            // get data from disk and parse it
            var retrievedData = sessionStorage.getItem(track + ",0," + block);
            var parsedData = JSON.parse(retrievedData);
            // data starts at position 3
            var position = 3;
            for (var i = startingPos; position < 64; i++) {
                // replace the parsed data with the input if it's not a space
                if(input.charAt(i) != " ") {
                    parsedData[position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                    if(input.charAt(i) == null){
                        break;
                    }
                }
            }
            // set the data at the right position
            sessionStorage.setItem(track.toString() + ",0," + block, JSON.stringify(parsedData));
        }

        public static rollIn(input: string, track: number): void {

            this.rollInWrite(input, track, 0, 0);
            this.rollInWrite(input, track, 1, 183);
            this.rollInWrite(input, track, 2, 366);
            this.rollInWrite(input, track, 3, 549);

            // update disk
            Control.clearDisk();
            Control.loadDisk();

        }

        public static rollOut(track: number, replacing: number){

            // set segment of disk pcb equal to first open memory spot
            _Kernel.pcbDiskList[0].segment = TSOS.MemoryManager.allocateMemory();


            var retrievedData0 = sessionStorage.getItem(track + ",0,0");
            var retrievedData1 = sessionStorage.getItem(track + ",0,1");
            var retrievedData2 = sessionStorage.getItem(track + ",0,2");
            var retrievedData3 = sessionStorage.getItem(track + ",0,3");

            // parse the retrieved data
            var parsedData0 = JSON.parse(retrievedData0);
            var parsedData1 = JSON.parse(retrievedData1);
            var parsedData2 = JSON.parse(retrievedData2);
            var parsedData3 = JSON.parse(retrievedData3);

            // delete the first 3 bits (pointer)
            parsedData0.splice(0,3);
            parsedData1.splice(0,3);
            parsedData2.splice(0,3);
            parsedData3.splice(0,3);

            console.log("Stringify: " + JSON.stringify(parsedData0 + parsedData1 + parsedData2 + parsedData3));

            var stringify0 = JSON.stringify(parsedData0);
            var stringify1 = JSON.stringify(parsedData1);
            var stringify2 = JSON.stringify(parsedData2);
            var stringify3 = JSON.stringify(parsedData3);

            // add this data to memory in the right segment
            TSOS.MemoryManager.updateMemory(stringify0 + stringify1 + stringify2 + stringify3, _Kernel.pcbDiskList[0].segment);
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