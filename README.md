# Insert Txt to Comic
Imports text from a .txt file to .psds for use in a comic.

Based originally on this script by tokuredit: https://community.adobe.com/t5/Photoshop/Script-that-adds-a-layer-of-text-with-the-name-of-the-selected/td-p/9152502

This is meant to help save time typesetting/lettering a comic/manga by importing a .txt file with all the text into each page.
It will place them in order (using the manga order, right to left, top to bottom) in separate text layers.

This program DOES NOT detect bubbles or where to place text. If I can find a way to do that I'll add it in a further update.
The output text will just be placed a grid shape with up to 4 lines per row in textboxes.

It knows which page to put which text based on having the same page numbers in the text as page numbers in the .psd filenames.

This is meant to save time for the typesetter for placing the text on the page in the right order in an easily-manipulable format. 

But styling and exact arrangement needs to be done manually. I recommend a tool like Typesetterer to help you out with that:

http://illuminati-manga.com/illiteracy/typesetterer/

Or use Actions to set common styles, or just do it all manually.


**Usage:

Add the script to your Photoshop scripts folder.

For Windows that's something like: C:\Program Files (x86)\Adobe\[Whatever version of Photosohp you have]\Presets\Scripts

You can then select this script from the File->Scripts menu in Photoshop.


You'll be prompted to select which .psds you want to typeset and then a script file.

Each of these .psds filenames should end with the page number. 

The beginning of the filename can be whatever you want, but the page numbers should correspond to the page numbers in the script (It's ok to have leading zeroes in the page numbers).

E.g.: Comic1_ch01_p001.psd


There should be only one input script file and it should follow this format.

Page 01:

Speaker: Line.

Another line by tyhe same speaker.

Speaker2: Another line. [Optional non-visible note]

**Skip a line between pages

Page 02:

New Speaker: New Line.

If you have text you don't want read, put it in square brackets ([]s). Those won't be output.

If there's whitespace or blank lines at the beginning or end of the file, those will be ignored.

If a line only has text surrounded by []s in it, that line will be ignored. So you can use that for headings or notes for the typesetter.


The program will match the page filenames with the page numbers in the script.
It assumes that the first line after a line break is the start of a new "page" and so it has a page number in it. 

It uses regex to just get the last numerical value and treats this as the "key". 
So if the script has a double-page spread like "003-004", then the code will just assume this as page 4 as the "key" to match the script page and the .psd.

The program will go through the pages in numerical order based on the order the .psds and insert each line. It will strip out the speaker text and the comment text in brackets, and will skip a line if there's no text in it after the comment is stripped out. It will add them in script order, so the bottom layer will be the first line. It will arrange them on the page in a "grid" shape with up to 4 lines per row in textboxes. This is meant to be a sort of "best guess" for where the lines go without analyzing the .psd's image itself. The font size is always 14 as of now. Most text will use the default font, but this can be overridden by using the speakerFontPairs variable noted below.


These two variables at the top of the script can be edited if you so choose, they're meant to automate some of the styling process.

`var speakerTextsToKeepInLineText = [ 'T/N',
'Note'];`


If for some reason you don't want the speaker text removed from the typeset text, you can add it to this array. 

Some folks like to put sound effects (SFX) in the margins so, in that case you would add 'SFX' and the line would be output as:

SFX: BANG

Rather than just "BANG".

If you know from the script what font something should be, you can add it to the "speakerFontPairs" list. 
The "defaultFont" should be the most commonly used font. If it's not in the list it will use that one.
Making sound effects have a separate font should save time figuring out which fonts are regular spoken lines and which are sound effects or signs.

`var speakerFontPairs = {
  defaultFont: "WildWordsCustomRoman",  
  "SFX": "BottenbrekerT.V.",  
  "FX": "BottenbrekerT.V.",  
  "Handwritten": "WashedPurple1",  
  "Hand": "WashedPurple1"  
};`

Put ALLCAPS at the end of the font name to force caps
Add HORIZONTALSCALING### for horizontal scaling
Add VERTICALSCALING### for vertical scaling
Using multiple of these cutsom options in one font is OK.

`	var speakerFontPairsStyle = {
		 defaultFont: "CCJoeKubertVERTICALSCALING120",
		 "SFX": "DKLiquidEmbraceVERTICALSCALING120",
		 "FX": "DKLiquidEmbraceVERTICALSCALING120",
		 "Handwritten": "CloudsplitterLCBB-BoldVERTICALSCALING140HORIZONTALSCALING120",
		 "Sign": "CCMarianChurchland-Regular",
		 "Title": "TetsubinGothic-RegularALLCAPSVERTICALSCALING120HORIZONTALSCALING95"
	};`

You can also do this for font sizes, to help save time if one font is always smaller/bigger than others.

`var speakerFontSizePairs = {
		 defaultFontSize: 16,
		 "SFX": 18,
		 "FX": 18,
		 "Handwritten": 16,
		 "Hand": 16
};`

I have some example styles I've used instantiated at the top of the file. Feel free to add your own or base off of those.
At the beginning of the "main()" function you can swap out a speakerFontPairs instance or speakerFontSizePairs instance. Functionally letting you have a bunch of presets you can easily swap in or out.


**Possible future updates/ideas:

This is meant to save time, so ultimately if something is faster to to manually I'm not going to add it here. 

I could add something like detecting which font/font size/position/textbox size to use based on text in []s at the end of a line, but I don't think it would really get used.

In an ideal world we could do some kind of neural net AI program to detect the positions and shapes of the bubbles to "best guess" where to put them, but as of now I don't know how to do that (Though I know some people who are trying).

Something like this: https://techcrunch.com/2016/07/21/google-now-uses-machine-learning-to-make-reading-comics-on-phones-and-tablets-easier/

Another possible option would be to recognize what font to use based on context. Like if you're translating a manga you could detect the original Japanese font and map it to a romanized font, but I have no way of doing that right now.

There's a group trying to do that here: https://mntr.jp/index_en.html

Possibly this could be done with a different program than this script itself and this script could be updated to read from an output file that program made (The textboxes are placed based on X,Y coordinates).

One way to do that would be to create a program that lets the user manually pick "points" on each input image to put the textboxes, but that wouldn't save much time over just dragging them.

Other ideas include trying to make the sizing/styling "smart" based on things like how many exclamation points it has. Similar to what I'm doing with speaker texts corresponding to fonts.


