//*******************************************************************************/
//*  Rocket Software makes no warranty, express or implied, with regard to      */
//*  this material, including fitness for use. Additionally, Rocket is not      */
//*  responsible for maintaining compatibility of this information with future  */
//*  releases.  Rocket provides this as an example only.                        */
//*  Customers using this information do so at their own risk.                  */
//*  The items provided to you are identified as Type II material               */
//*  as per the Professional Services Agreement. For the                        */
//*  avoidance of doubt, this means that Rocket owns the IP in                  */
//*  any such deliverables.                                                     */
//*******************************************************************************/

/**
 * Attaches a Formatting and Masking handler to a Widget on a webpage
 * 
 * This example will format a 16 digit credit card number to four groups of
 * 4 digits separated by space for the user display. The host contents will 
 * consist of 16 digits with no separator characters.  
 * 
 * @param widgetId {string} widget Id from the web page
 * @param scriptWindow {object} Script window object reference
 */
function attachFormattingAndMaskingCode(widgetId, scriptWindow) {
    var backspaceFlag = false;
    
    // Wait for widget to be ready for use on same page as scriptWindow
    scriptWindow.rs.waitForWidgetById(widgetId, function(widget) {

        // This function is called when host sends some data and before setting it to the widget
        widget.processHostValue = function(value) {
            return formatValue(value);
        };

        // Format the value when the host provided an initial value to the widget 
        if(widget.getValue()) { 
            widget.setValue(formatValue(widget.getValue()));
        }

        // This function is called when user finishes editing (on enter press or on focus out), 
        // before sending it to the host.
        // The function should return the new value and new cursor position within the field
        widget.processUserValue = function(value, cursorPosition) {
            var processedValue = value ? value.replace(/ /g, "") : value,
                newCursorPosition = cursorPosition;

            if(processedValue !== value) {
                newCursorPosition = processedValue.length;
            }
            return {
                "value": processedValue,
                "cursorPos": newCursorPosition
            };
        };

        // This event is fired right after value has changed with typing or pasting.
        // event.getData() contains data after the change
        widget.addListener("input", function(event) {
            var currentString = event.getData(),
                currentCursor = widget.getTextSelectionEnd(),
                newString;

            newString = formatValue(currentString);

            if(currentString !== newString) {
                widget.setValue(newString);
                //calculate new cursor position and set it if needed
                if(currentCursor !== currentString.length) {
                    for(var i = 0; i < newString.length; i+=1) {
                        if(newString[i] === " ") {
                            if(backspaceFlag) {
                                backspaceFlag = false;
                            } else if(currentCursor === i + 1) {
                                currentCursor += 1;
                            }
                        }
                    }

                    widget.setTextSelection(currentCursor, currentCursor);
                }
            }
        });

        // This event is fired before value has changed, so some information can be extracted in advance
        // or some keys can be prevented, etc
        widget.addListener("keydown", function(event) {
            var keyIdentifier = event.getKeyIdentifier();
            if(keyIdentifier === "Backspace") {
                backspaceFlag = true;
            }
        }, widget);
    });
}

/**
 * format value according to the credit card pattern
 * 1234 5678 8765 4321
 * 
 * @param value {string} unformatted value 
 * @return {string} value formatted in 4 digit groups separated by spaces
 */
function formatValue(value) {
    var newValue = value.replace(/[^0-9]/g, ""); //strip all non-numeric characters
    newValue = newValue.replace(/(\d{4})(?=\w)/g, "$1 "); //and then reformat

    return newValue;
}
