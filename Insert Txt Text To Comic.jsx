    //Based on this cript by tokuredit 
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
	
	var speakerFontPairs = {};
	
	//Swap in instances of which fonts go to which speaker text.
	//Put ALLCAPS at the end of the font name to force caps
	//Add HORIZONTALSCALING### for horizontal scaling
	//Add VERTICALSCALING### for vertical scaling
	//Using multiple in one font is OK.
	var speakerFontPairsStyle1 = {
		 defaultFont: "CCJoeKubert",
		 "SFX": "CCJeffCampbell",
		 "FX": "CCJeffCampbell",
		 "Handwritten": "CCDearDiary",
		 "Hand": "CCDearDiary",
		 "T/N": "HighwayGothicNarrow",
		 "Thought": "SanDiego2005BB",
		 "Thoughts": "SanDiego2005BB",
		 "Text": "WashedPurple1",
	};
	
	var speakerFontPairsStyle2 = {
		defaultFont: "WildWordsCustomRoman",
		"SFX": "BottenbrekerT.V.ALLCAPS",
		"FX": "BottenbrekerT.V.ALLCAPS",
		"Handwritten": "WashedPurple1",
		"Hand": "WashedPurple1"
	};	
	
	
	var speakerFontSizePairs = {};
	
	var speakerFontSizePairsStyle1 = {
		 defaultFontSize: 16,
		 "SFX": 18,
		 "Handwritten": 18,
		 "Hand": 18,
		 "Narr": 18,
		 "Narration": 18
	};
	
	var speakerFontSizePairsStyle2 = {
		 defaultFontSize: 16,
		 "SFX": 18,
		 "FX": 18,
		 "Handwritten": 14,
		 "Hand": 14
	};
	
    main();
    function main(){  		
	
		//Set fonts that map to speakers. 
		//Use lowercase speakers and "PostScript Names" for fonts
		//Different manga can use differen styles, hardcoded above
		speakerFontPairs = speakerFontPairsStyle1;
		
		//Set custom sizes for each speaker. 
		//Defaults to "defaultFontSIze".
		speakerFontSizePairs = speakerFontSizePairsStyle1;
			
		//Select PSDs to import text to
		var selectedPSDs = [];
		selectedPSDs = File.openDialog("Please select your psds to import text to.","*.PSD; *PSD", true); 
		if (selectedPSDs == null) return;
		if (selectedPSDs.length == 0) return;
		
		//Select translation script
		var txtFile = File.openDialog("Please select translation txt.","TXT File:*.txt");  			
		if (txtFile == null) return;  
		if (txtFile.length == 0) return;
		
		txtFile.open('r');  		
		var txtFileData = txtFile.read();  
		txtFile.close();  		
			
		for (var i in selectedPSDs){  
		
			//Open file
			open(selectedPSDs[i]);  
			
			//Import text for that page
			app.activeDocument.suspendHistory("[M] Insert Txt Text to Comic " + i, "importText(txtFileData)");
			
			//Save and close
			psdSaveOptions = new PhotoshopSaveOptions
			activeDocument.saveAs(selectedPSDs[i], psdSaveOptions, true, Extension.LOWERCASE);
			activeDocument.close(SaveOptions.DONOTSAVECHANGES);
			
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
		var currentPageLines = constructLineObjectsForPage(currentPage.split('\n'));
		
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
	
    function createTextLayer(speaker, line, lineIndex, currentPageLinesLength) {    
		var startRulerUnits = app.preferences.rulerUnits;  
		
		//Set units to pixels
		app.preferences.rulerUnits = Units.PIXELS;  
				
		//Add Text layer
		var thisLayer = activeDocument.artLayers.add();   
		thisLayer.kind = LayerKind.TEXT;    
		var textProperty = thisLayer.textItem;   
		textProperty.kind = TextType.PARAGRAPHTEXT;  
		
		//Font Size  
		textProperty.size = getFontSize(speaker);
		
		//Check for forced ALL CAPS (Fontname will have ALLCAPS at the end)
		var fontName = getFontName(speaker, line);   
		if(!fontName)
			fontName = speakerFontPairs.defaultFont;
		textProperty.capitalization = getCapitalization(fontName);
		
		//Check for forced horizontal/vertical scaling. (Fontname will have VERTICALSCALING### or HORIZONTALSCALING### at the end)
		textProperty.horizontalScale = getHorizontalScaling(fontName);
		textProperty.verticalScale = getVerticalScaling(fontName);
		
		//Set Font name (Strip out the properties for caps/scaling)
		textProperty.font = getRegularFontName(fontName);
		
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
		textProperty.width = getTextboxWidth(doc, line);
		textProperty.height = getTextboxHeight(doc, line);
		textProperty.position = getTextboxPositionXY(lineIndex, currentPageLinesLength); //Array with two values (X,Y)
		textProperty.justification = Justification.CENTER
		
		//Layer name defaults to the contents value
		textProperty.contents = line;   
		
		//Set units back to original value
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
		
	//Creates array of objects holding the speaker, line text, and extra text in square brackets
	function constructLineObjectsForPage(currentPageArrayOfLines) {
		
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
					lineText = speakerText + ': ' + lineText;
				}
				
			}
			
			//Store extra text that isn't part of the line from square brackets			
			extraTextMatches = currentPageLine.match(/\[(.*?)\]/);

			if (extraTextMatches) {
				extraText = extraTextMatches[1];
			}
			
			//Only keep track of lines with text
			if(lineText.length > 0) pageLines.push(new TextLine(speakerText,lineText,extraText));  
		}
		
		return pageLines;
		
	}	
	
	//Origin (0,0) is the upper left corner
	//Box height is 300, width is 1/4th of the canvas
	//Textboxes should order from right to left
	function getTextboxPositionXY(index,totalLines) {
		
		var doc = activeDocument;
		var numberOfColumns = getNumberOfColumns(totalLines);
		var documentWidth = doc.width.value;
		var textboxWidth = documentWidth / numberOfColumns;
		var horizontalOrder = (index) % numberOfColumns;

		var outputX = documentWidth - ((horizontalOrder * textboxWidth) + 150);
		
		var documentHeight = doc.height.value;
		var numberOfRows = Math.ceil(totalLines / numberOfColumns);
		var currentRow = Math.floor(index / numberOfColumns); //First row is 0
		var distanceBetweenRows = documentHeight/numberOfRows;
				
		var outputY =  ((currentRow) * distanceBetweenRows + 50);	
		
		return Array(outputX, outputY);
		
	}	
	
	function getNumberOfColumns(totalLines) {
		
		if (totalLines <= 10) {
			return 2;
		} else if (totalLines <= 15) {
			return 3;
		}
		
		return 4;		
	}	
	
	function getTextboxWidth(doc, lineText)
	{
		//Assume if the line is longer then the textbox should be wider
		if (lineText.length < 10)
		{
			return doc.width.value / 14;
		} else if (lineText.length < 20)
		{
			return doc.width.value / 12;
		}
		else if (lineText.length < 35)
		{
			return doc.width.value / 10;
		}
		else if (lineText.length < 70)
		{
			return doc.width.value / 8;
		}		
		return doc.width.value / 6;
	}
	
	function getTextboxHeight(doc, lineText)
	{
		//Assumes most textboxes are tall rectangles
		if (lineText.length < 10)
		{
			return doc.height.value / 14;
		} else if (lineText.length < 30)
		{
			return doc.height.value / 12;
		} else if (lineText.length < 90)
		{
			return doc.height.value / 8;
		}
		
		if ((lineText.length * 2.5 + 20) < 400)
		{
			return doc.height.value / 6;
		}
		
		return doc.height.value / 5;
	}
	
	function getFontSize(speaker) {
		
		var fontSize = speakerFontSizePairs.defaultFontSize;
		
		//Allow for dynamically changing font size on speaker text
		for(var key in speakerFontSizePairs) {
			var mappedFontSize = speakerFontSizePairs[key];
			if (speaker.toLowerCase() == key.toLowerCase()) {
				fontSize = mappedFontSize;
			}
		}
		
		return fontSize;
	
	}
	
	
	function getFontName(speaker, line) {
		
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
	
	//Strips out added options like ALLCAPSS and VERTICALSCALING and HORIZONTALSCALING
	function getRegularFontName(fontName) {
		
		if (fontName.toLowerCase().indexOf("allcaps") > 0)
		{
			fontName = fontName.slice(0, fontName.toLowerCase().indexOf("allcaps"));			
		}		
		
		if (fontName.toLowerCase().indexOf("verticalscaling") > 0)
		{
			fontName = fontName.slice(0, fontName.toLowerCase().indexOf("verticalscaling"));
		}	
		
		if (fontName.toLowerCase().indexOf("horizontalscaling") > 0)
		{
			fontName = fontName.slice(0, fontName.toLowerCase().indexOf("horizontalscaling"));
		}	
		
		return fontName;
			
	}
	
	function getCapitalization(fontName) {
		
		if (fontName.toLowerCase().indexOf("allcaps") > 0)
		{
			return TextCase.ALLCAPS;			
		}	
		
		return TextCase.NORMAL;
		
	}
	
	function getHorizontalScaling(fontName) {	
	
		//Assume the scale number is 3 digits
		if (fontName.toLowerCase().indexOf("horizontalscaling") > 0)
		{
			var startingIndex = fontName.toLowerCase().indexOf("horizontalscaling") + 17;
			var endingIndex = fontName.toLowerCase().indexOf("horizontalscaling") + 20
			return parseInt(fontName.slice(startingIndex, endingIndex));
		}
		
		return 100;
		
	}
	
	function getVerticalScaling(fontName) {		
	
		//Assume the scale number is 3 digits
		if (fontName.toLowerCase().indexOf("verticalscaling") > 0)
		{
			var startingIndex = fontName.toLowerCase().indexOf("verticalscaling") + 15;
			var endingIndex = fontName.toLowerCase().indexOf("verticalscaling") + 18
			return parseInt(fontName.slice(startingIndex, endingIndex));
		}
		
		return 100;
		
	}