    //Based on this script by tokuredit 
	//From here: https://community.adobe.com/t5/Photoshop/Script-that-adds-a-layer-of-text-with-the-name-of-the-selected/td-p/9152502
	//Useful for textlayer values http://jongware.mit.edu/pscs5js_html/psjscs5/pc_TextItem.html
	//Javascript docs: https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2015.pdf
	//======
	//Use this format
	//Page ##:
	//Speaker: Line
	//[Skip line for new page]
	//======
	#target photoshop;  
	
	var speakerTextsToKeepInLineText = [ 'T/N',
	'Note'];
	
	//Use lowercase speakers and "PostScript Names" for fonts
	var speakerFontPairs = {
		defaultFont: "WildWordsCustomRoman",
		"SFX": "BottenbrekerT.V.",
		"FX": "BottenbrekerT.V.",
		"Handwritten": "WashedPurple1",
		"Hand": "WashedPurple1"
	};
	
    main();
    function main(){  		
		//Select PSDs to import text to
		var selectedPSDs = [];
		selectedPSDs = File.openDialog("Please select your psds to import text to.","*.PSD; *PSD", true); 
		if (selectedPSDs == null) return;
		if (selectedPSDs.length == 0) return;
		
		//Select script
		var txtFile = File.openDialog("Please select input text txt.","TXT File:*.txt");  			
		if (txtFile == null) return;  
		if (txtFile.length == 0) return;
		
		txtFile.open('r');  		
		var txtFileData = txtFile.read();  
		txtFile.close();  		
			
		for (var i in selectedPSDs){  
		
			//Open file
			open(selectedPSDs[i]);  
			
			//Import text for that page
			importText(txtFileData);	
		}  
					
			
    };  	
    function importText(txtFileData) {    
		//Get array of pages based on double newlines
		txtFileData = cleanTxtFile(txtFileData);		
		var pages = txtFileData.toString().split('\n\n');
		
		//Get index of the current open document's text from the array based on the filename and the first line of each page
		var currentPageNumberIndex = getCurrentPageNumberIndex(pages);
		
		if (currentPageNumberIndex < 0)
		{
			alert('Page not found in the input text txt.');
			return;
		}
		
		var currentPage = pages[currentPageNumberIndex];
				
		//Clean and construct lines		
		var currentPageLines = constructLines(currentPage.split('\n'));
		
		//Create a text layer for each line
		for (i = 0; i < currentPageLines.length; i++){
			createTextLayer(currentPageLines[i].speaker, currentPageLines[i].line, i, currentPageLines.length);  
		}  
	}
	
	function cleanTxtFile(txtFileData) {
		txtFileData = txtFileData.replace("([\r\n]){2,}", ""); //Replace extra line-breaks (Two or more blank lines get set to one)
		txtFileData = txtFileData.replace(/ *\[[^\]]*]/, ''); //Remove all-bracket [] lines
		txtFileData = txtFileData.replace(/^\s+|\s+$/g, ''); //Remove any starting or trailing blank lines
		return txtFileData;
	}
	
    function createTextLayer(speaker, line, lineIndex, currentPageLinesCount) {    
		var startRulerUnits = app.preferences.rulerUnits;  
		app.preferences.rulerUnits = Units.PIXELS;  
				
		var thisLayer = activeDocument.artLayers.add();   
		thisLayer.kind = LayerKind.TEXT;   
		thisLayer.name = line;   
		var textProperty = thisLayer.textItem;   
		textProperty.kind = TextType.PARAGRAPHTEXT;  
		
		//Font Size  
		textProperty.size = 14;   
		textProperty.font = getFontName(speaker);   
		var newColor = new SolidColor();   
		
		//Font Color  
		newColor.rgb.red = 0;   
		newColor.rgb.green = 0;   
		newColor.rgb.blue = 0;   
		textProperty.color = newColor;   
		thisLayer.blendMode = BlendMode.NORMAL;   
		thisLayer.opacity = 100;   
		
		//Size and position
		var doc = activeDocument;
		textProperty.width = getTextboxWidth(doc, speaker, line);
		textProperty.height = getTextboxHeight(doc, speaker, line);
		textProperty.position = getTextboxPositionXY(lineIndex, currentPageLinesCount); //Array with two values (X,Y)
		textProperty.justification = Justification.CENTER
		
		textProperty.contents = line;   
		
		app.preferences.rulerUnits = startRulerUnits;  
    }; 
	
	//Ask user for a value via a popup if the program can't detect something automatically
	function getValueFromUser(dialogBoxName, defaultInput) {
		// New UI window
		var cal = new Window ("dialog", dialogBoxName);
		var cal_char = cal.add("edittext", [25,40,135,60], defaultInput);

		// Buttons
		var btnGroup = cal.add ("group");
		btnGroup.orientation = "row";
		btnGroup.alignment = "center";
		btnGroup.add ("button", undefined, "OK");
		btnGroup.add ("button", undefined, "Cancel")
		cal.center();

		var myReturn = cal.show();

		if (myReturn == 1)
		{
			return cal_char.text;
		}
	}
	
	//Get the index in the array of pages from the filename, or from user input
	function getCurrentPageNumberIndex(pages)
	{
		//Try to get the page number from the end of the filename
		//If there's a - or _ in the name like for a double page spread, assume the last number
		var fname = activeDocument.name.replace('.psd','');
		var matches = fname.match(/\d+(?=\D*$)/);
				
		var currentPageNumber = -1;
		if (matches) {
			//Remove leading zeroes
			currentPageNumber = matches[0].replace(/^0+/, '');
		}
						
		//If a page number wasn't found in the filename, then ask the user what page number it was
		if (currentPageNumber < 0) { 
			currentPageNumber = getValueFromUser('Enter Page Number', 1);		
		}

		//Check if one of the pages has this same number to get the index in the array
		var currentPageNumberIndex = -1;
		for (i = 0; i < pages.length; i++){  
			var page = pages[i].toString();
			
			//Check the first line of each page
			var firstLineOfPage = page.split('\n')[0];
			
			//If there's a - or _ in the name like for a double page spread, assume the last number
			var firstLineMatches = firstLineOfPage.match(/\d+(?=\D*$)/);
			if (firstLineMatches) {
							
				//If the page starts with the same page number, then that's the right page
				//Remove leading zeroes
				if (currentPageNumber == firstLineMatches[0].replace(/^0+/, ''))
				{
					currentPageNumberIndex = i;
					break;
				}
				
			}
			
		}
				
		return currentPageNumberIndex;	
		
	}	
	
	//Object to wrap data for an individual line
	function TextLine(speaker, line, extraText)
	{
		this.speaker = speaker;
		this.line = line;
		this.extraText = extraText;
	}
		
	function constructLines(currentPageArrayOfLines) {
		
		var pageLines = [];
		var speakerText = '';
		var lineText = '';
		var extraText = '';
		
		for (i = 0; i < currentPageArrayOfLines.length; i++){  
		
			var currentPageLine = currentPageArrayOfLines[i].toString();
			
			//Store speaker and line into an array (speaker,line);
			if (currentPageLine.indexOf(":") !== -1) {
				//Update speaker if line has a ':'
				speakerText = currentPageLine.substring(0, currentPageLine.indexOf(":")).replace(/^\s+|\s+$/g,'');
			}
			
			lineText = currentPageLine.substring(currentPageLine.indexOf(":") + 1).replace(/^\s+|\s+$/g,'');

			//Remove square bracket statements
			lineText = lineText.replace(/ *\[[^\]]*]/, '');
			
			//Don't remove speaker text lines that need it, like notes.
			for (j = 0; j < speakerTextsToKeepInLineText.length; j++){  
				if (speakerTextsToKeepInLineText[j].toLowerCase() == speakerText.toLowerCase()) {
					lineText = speakerText + ':' + lineText;
				}
				
			}
			
			//Store extra text that isn't part of the line from square brackets			
			extraTextMatches = currentPageLine.match(/\[(.*?)\]/);

			if (extraTextMatches) {
				extraText = extraTextMatches[1];
			}
			
			//Only keep track of lines with text
			if(lineText.length > 1) pageLines.push(new TextLine(speakerText,lineText,extraText));  
		}
		
		return pageLines;
		
	}	
	
	//Origin (0,0) is the upper left corner
	//Box height is 300, width is 1/4th of the canvas
	//Textboxes should order from right to left
	function getTextboxPositionXY(index, currentPageLinesCount) {
		
		var doc = activeDocument;
		var documentWidth = doc.width.value;
		var textboxWidth = documentWidth / 4;
		var horizontalOrder = (index) % 4;

		var outputX = documentWidth - ((horizontalOrder * textboxWidth) + 150);
		
		var doc = activeDocument;
		var documentHeight = doc.height.value;
		var numberOfRows = Math.ceil(currentPageLinesCount / 4);
		var currentRow = Math.floor(index / 4); //First row is 0
				
		var outputY =  ((currentRow) * 300 + 50);	
		
		return Array(outputX, outputY);
		
	}	
	
	
	function getTextboxHeight(doc, speaker, line) {
		
		if (line.length < 30)
		{
			return 80;
		}
		
		return Math.floor(line.length/20) + 80;
		
	}
	
	function getTextboxWidth(doc, speaker, line) {
		
		if (line.length < 10)
		{
			return 30;
		} else if (line.length < 80)
		{
			return 40;
		} else if (line.length < 140)
		{
			return 50;
		}
		
		return (doc.width.value / 6);
	}
	
	function getFontName(speaker) {
		
		//Font name (May allow user to change this if we want)
		//Must be "PostScript Name".
		var fontName = speakerFontPairs.defaultFont;
		
		//Allow for dynamically changing font based on speaker text
		for(var key in speakerFontPairs) {
			var mappedFont = speakerFontPairs[key];
			if (speaker.toLowerCase() == key.toLowerCase()) {
				fontName = mappedFont;
			}
		}
		
		return fontName;
					
	}