// JavaScript source code
//HTML elements and all such
var output = document.getElementById("output");
var startSlider = document.getElementById("start-slider");
var seaSlider = document.getElementById("sea-slider");
var customRuleEl = document.getElementById("custom-rule-input")
var seaStaticInput = document.getElementById("sea-static-input");
var typeInput = document.getElementById("type-input");
//Classes
class TriRow {
    constructor(values, sea, rule, staticSea, rowNum) {
        this.values = values;
        this.sea = sea;
        this.staticSea = staticSea;
	    this.rowNum = rowNum;
        this.rule = rule.bind(this);
    }
    nextRow() {
        //Start with the first value, the sea plus the first value
        var newValues = [this.rule(this.sea, this.values[0], this.sea, this.rowNum, 1)];
        //Loop through the rest
        for (var i = 1; i <= (this.values.length) - 1; i++) {
            var valLeft = this.values[i - 1];
            var valRight = this.values[i];
	    let newValueAttempt = this.rule(valLeft, valRight, this.sea, this.rowNum, i + 1);
            //Check if the rule is invalid, if so, display it as NaN
            if (typeof newValueAttempt !== "number" && typeof newValueAttempt !== "boolean" ) {
                newValues.push(NaN);
            }
            else {
                newValues.push(newValueAttempt);
            }
        }
	    let lastVal = this.rule(this.values[this.values.length - 1], this.sea, this.sea, this.rowNum, newValues.length + 1);
        //add the last value
        newValues.push(lastVal);

        let newSea = this.staticSea ? this.sea : this.rule(this.sea, this.sea, this.sea, this.rowNum, 0)

        //Return a new triRow, with the newValues and a sea value equal to double our sea
        return new TriRow(newValues, newSea, this.rule, this.staticSea, this.rowNum + 1);
    }
}
class Triangle {
    constructor(start, sea, rowCount, rule, staticSea) {
        this.rows = this.calc(start, sea, rowCount, rule, staticSea);
    }
    

    calc(start, sea, rowCount, rule, staticSea) {
        var rowList = [new TriRow([start], sea, rule, staticSea, 1)];
        for (var i = 1; i < rowCount; i++) {
            rowList.push(rowList[i - 1].nextRow());
        }
        return rowList;
    }

    boxText(text) {
        var classText = text.length > 5 ? " class=\"vsmallText\"" : (text.length > 3) ? " class=\"smallText\"" : "";
	var output = "<pre" + classText + ">" + text + "</pre>";
	return output;
    }
    boxBool(bool) {
        var classText = bool ? " class=\"true-bool bool-box\"" : " class=\"bool-box\"";
	var output = "<pre" + classText + "> </pre>";
	return output;
    }
    toOutput(outputType) {
        var output = this.toSeaOutput(outputType) + "<div id=\"triangle-div\">";
        for (var row of this.rows) {
            var rowText =  "" ;
            for (var val of row.values) {
		if (outputType == "boolean") {
			rowText += this.boxBool(val);
		}
		else {
                	rowText +=  this.boxText(val.toString());
		}

            }
            output += rowText + "<br />";
        }
        return output + "</div>";
    }
    toSeaOutput(outputType) {
        var output = "<div id=\"sea-indicator\">";
        for (var row of this.rows) {
	    if (outputType == "boolean") {
		output += this.boxBool(row.sea)+ "<br />";
	    }
	    else {
                output += this.boxText("(" + row.sea + ")") + "<br />";
	    }
            
        }
        return output  + "</div>";
    }

    hasRuleIssue(desiredType) {
	for (var row of this.rows) {
        for (var val of row.values) {
                console.log(val);
                if (Number.isNaN(val)|| typeof val != desiredType) {
                    
			        return true;
		        }

            }
        }
	return false;
    }
}

//The Update function
var customRule;
var CurrTri;
function update() {

    //Multiply by 1 to convert these to integers
    var startValue = startSlider.value * 1;
    var seaValue = seaSlider.value * 1;
  
    //Clear errors
    document.getElementById("custom-rule-error").innerHTML = "";
    //Check if bool mode
    var boolMode = typeInput.value === "boolean";



    // Check if we can use custom rule
    try {
        //get the custom rule
        customRule = new Function("l", "r", "s", "n", "i", "let q = Math.ceil(Math.random() * 10); return " + customRuleEl.value);
	    // Run it, just to check for errors
	    customRule(boolMode?false:0,boolMode?false:0);
    }
    catch {
        document.getElementById("custom-rule-error").innerHTML = "Invalid Rule (code error)";
        return;
    }
    
    //Get our rule
    var rule = function (l, r, s, n, i) { return customRule(l, r, s, n, i); }
    //GET THE TRIANGLE
    let currTri = new Triangle(boolMode ? !!startValue : startValue, boolMode ? !!seaValue : seaValue, boolMode ? 22 : 10, rule, seaStaticInput.checked)

    //Check for issues
    if (currTri.hasRuleIssue(typeInput.value)) {
	    document.getElementById("custom-rule-error").innerHTML = "Invalid Rule (illegal value appeared on triangle)";
        return;
    }
    //LETS DRAW THIS BABY
    output.innerHTML = currTri.toOutput(typeInput.value);
    console.log(currTri);
    
}

function updateDisps() {
    //Check if bool mode
    var boolMode = typeInput.value === "boolean";
    //Multiply by 1 to convert these to integers
    var startValue = startSlider.value * 1;
    var seaValue = seaSlider.value * 1;
    //Update displays 
    if (boolMode) {
        document.getElementById("start-disp").innerHTML = !!startValue;
        document.getElementById("sea-disp").innerHTML = !!seaValue;
        seaSlider.max = 1;
        seaSlider.min = 0;
        startSlider.max = 1;
        startSlider.min = 0;
    }
    else {
        document.getElementById("start-disp").innerHTML = startValue;
        document.getElementById("sea-disp").innerHTML = seaValue;
        seaSlider.max = 3;
        seaSlider.min = -3;
        startSlider.max = 3;
        startSlider.min = -3;
    }
}
//The custom rule function

//Events
document.getElementById("gen-button").onclick = function (){
    update();
}
window.onkeydown = function (event) {
    
    if (event.key === "Enter" && !event.repeat) {
        update();
    }
}

customRuleEl.onkeydown = function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
    }
}

seaSlider.oninput = function () {
    updateDisps();
}
startSlider.oninput = function () {
    updateDisps();
}
typeInput.oninput = function () {
    updateDisps();
}

//Initial update
update();
