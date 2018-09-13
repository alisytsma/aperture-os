///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public storeText = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                this.storeText = text;
                //create array to store lines that go off page
                var lines = [];
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                //if text will go off canvas
                if (offset + this.currentXPosition > _Canvas.width - 20) {
                    //loop through all text
                    for (var i = 0; i < text.length; i++) {
                        //set offset to be the spliced text instead of the regular text
                        var spliceOffset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text.slice(0, i));
                        //add both pre-spliced text and post-spliced text to array lines and set x position back to 0
                        if (this.currentXPosition + spliceOffset > _Canvas.width - 20) {
                            lines.push(text.slice(0, i - 1));
                            text = text.slice(i - 1);
                            lines.push(text);
                            this.currentXPosition = 0;
                        }
                    }
                    //print array lines with line break
                    for (var i = 0; i < lines.length - 1; i++) {
                        this.putText(lines[i]);
                        this.advanceLine();
                    }
                }

                //draw rest of text
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                this.currentXPosition = this.currentXPosition + offset;

            }
        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            //find line height
            var lineHeight = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;

            //move y position down by line height
            this.currentYPosition += lineHeight;

            //if the text would go off the canvas
            if (this.currentYPosition >= _Canvas.height) {
                //copy the currently displayed text by getting the image data
                var getDisplayedText = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                //move the y position up one so the text fits (minus the top line)
                this.currentYPosition -= lineHeight;
                //re-display the text by putting the image data back on the canvas
                _DrawingContext.putImageData(getDisplayedText, 0, -lineHeight);
            }
        }
    }
}
