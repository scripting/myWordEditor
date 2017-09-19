/* The MIT License (MIT)
	
	Copyright (c) 2015 Dave Winer
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	
	structured listing: http://scripting.com/listings/mywordeditor.html
	*/

var appConsts = {
	productname: "myWordEditor",
	productnameForDisplay: "MyWord Editor",
	"description": "A simple silo-free blogging tool that creates beautiful essay pages.",
	urlTwitterServer: "http://twitter.myword.io/", //backup, in case config.json is missing
	domain: "myword.io", //the real value is set in startup () 
	version: "0.73"
	};
var appPrefs = {
	authorName: "", authorWebsite: "",
	ctStartups: 0, minSecsBetwAutoSaves: 3,
	flAutoPublish: true,
	flMarkdownProcess: false,
	textFont: "Ubuntu", textFontSize: 18, textLineHeight: 24,
	flDisqusComments: true, disqusGroupName: "smallpict",
	flRssPrefsInitialized: false, rssTitle: "", rssDescription: "", rssLink: "", rssMaxItemsInFeed: 25, rssLanguage: "en-us", 
	rssHistory: [], rssFeedUrl: "",
	flUseDefaultImage: false, defaultImageUrl: "",
	nameDefaultTemplate: "default", //3/29/15 by DW
	flDisqusComments: true, disqusGroupName: "mywordcomments", //3/31/15 by DW
	nameTextEditor: "html4", //4/1/15 by DW
	lastTweetText: "", lastUserName: "davewiner",
	fileSerialnum: 0,
	lastFilePath: "",
	lastPublishedUrl: ""
	};
var flStartupFail = false;
var flPrefsChanged = false, flFeedChanged = false, flHistoryChanged = false;
var whenLastUserAction = new Date ();
var myTextFilename = "myTextFile.txt";
var globalDefaultImageUrl = "http://scripting.com/2015/03/06/allmans.png";

var theData = { //the file being edited now
	title: "",
	description: "",
	authorname: "", 
	authorwebsite: "", 
	when: new Date (0),
	img: "", 
	subs: [],
	whenLastSave: new Date (0),
	ctSaves: 0,
	publishedUrl: "",
	linkJson: "", //3/24/15 by DW
	nameTemplate: appPrefs.nameDefaultTemplate //3/28/15 by DW
	};
var urlTemplateFile = "templates/default.html";
var jsontextForLastSave;
var whenLastUserAction = new Date (), whenLastKeystroke = whenLastUserAction;
var randomMysteryString, ctCloseAttempts = 0;
var fnameconfig = "config.json"; //3/20/15 by DW
var config; //3/28/15 by DW
var defaultEditorButtons = ["bold", "italic", "underline", "strikethrough", "anchor", "h2", "h3", "quote"]; //7/27/15 by DW
var defaultTemplates = {
	"Default": "http://myword.io/templates/default.html",
	"Plain": "http://myword.io/templates/plain/template.html"
	};
var disqusCode =  //3/31/15 by DW
	"<div id=\"disqus_thread\"></div>\n<script type=\"text/javascript\">var disqus_shortname = '[%disqusgroupname%]';\n(function() {\nvar dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;\ndsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';\n(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);\n})();\n</script>";

function patchPrefs () {
	console.log ("patchPrefs");
	//7/24/15 by DW -- advent of the flPgfLevelMarkdown field of rssHistory objects
		for (var i = 0; i < appPrefs.rssHistory.length; i++) {
			var obj = appPrefs.rssHistory [i];
			if (obj.flPgfLevelMarkdown === undefined) {
				obj.flPgfLevelMarkdown = true;
				prefsChanged ();
				}
			}
	//3/27/15 by DW -- some early files in rssHistory have incorrect filepath fields
		for (var i = 0; i < appPrefs.rssHistory.length; i++) {
			var obj = appPrefs.rssHistory [i];
			if (endsWith (obj.filepath, ".html")) {
				obj.filepath = stringMid (obj.filepath, 1, obj.filepath.length - 5) + ".json";
				prefsChanged ();
				}
			}
	}
function keyupTextArea () {
	}
function runStartupCode () { //4/3/15 by DW
	if (config != undefined) {
		if (config.startupCode != undefined) {
			if (config.startupCode.length > 0) {
				var s = config.startupCode.replace ("\n", "");
				eval (s);
				}
			}
		}
	}
function getAllPosts (callback) {
	var postArray = [];
	function readOne (ix) {
		if (ix > 0) {
			var path = "essays/" + padWithZeros (ix, 3) + ".json";
			twGetFile (path, true, true, function (error, data) {
				if (data != undefined) {
					postArray [ix - 1] = JSON.parse (data.filedata);
					}
				readOne (ix - 1);
				});
			}
		else {
			twUploadFile ("files.json", jsonStringify (postArray), "application/json", false, function (data) {
				if (callback !== undefined) {
					callback (postArray, data.url);
					}
				});
			}
		}
	readOne (appPrefs.fileSerialnum);
	}
function getPostsInJson () {
	getAllPosts (function (postArray, urlJsonFile) {
		confirmDialog ("View the JSON file?", function () {
			window.open (urlJsonFile);
			});
		});
	}
function closeFileOpenDialog () {
	$("#idFileOpenDialog").modal ("hide"); 
	}
function openThisFile (id) {
	console.log ("openThisFile: id == " + id);
	appPrefs.lastFilePath = id;
	openEssayFile (function () {
		prefsChanged ();
		closeFileOpenDialog ();
		});
	}
function fileOpenDialog () {
	getAllPosts (function (postArray, urlJsonFile) {
		var htmltext = "<div class=\"divFileList\"><ul>";
		for (var i = 0; i < postArray.length; i++) {
			var obj = postArray [i];
			console.log (obj.title + ": " + obj.filePath);
			htmltext += "<li><a onclick=\"openThisFile ('" + obj.filePath + "');\">" + obj.title + "</a></li>";
			}
		htmltext += "</ul></div>";
		$("#idFileOpenDialog").modal ("show"); 
		$("#idWhereToDisplayFileList").html (htmltext);
		});
	}
function publishAllPosts () { //3/24/15 by DW
	confirmDialog ("Publish all posts?", function () {
		var savedFilePath = appPrefs.lastFilePath;
		function publishOne (ix, callback) {
			if (ix > 0) {
				appPrefs.lastFilePath = "essays/" + padWithZeros (ix, 3) + ".json";
				openEssayFile (function () {
					console.log ("publishAllPosts: publishing " + appPrefs.lastFilePath);
					publishButtonClick (false, function () {
						publishOne (ix - 1, callback);
						});
					});
				}
			else {
				if (callback !== undefined) {
					callback ();
					}
				}
			}
		publishOne (appPrefs.fileSerialnum, function () {
			appPrefs.lastFilePath = savedFilePath;
			openEssayFile ();
			});
		});
	}
function fieldsToHistory () { //copy from theData into the current history array element
	function getBodyText () {
		//Changes
			//3/26/15; 12:37:43 PM by DW
				//We're now passing the text through a markdown processor as the feed is built, so we need to use markdown conventions for paragraphs.
		var s = "";
		for (var i = 0; i < theData.subs.length; i++) {
			s += theData.subs [i] + "\n\n";
			}
		return (s);
		}
	for (var i = 0; i < appPrefs.rssHistory.length; i++) {
		var obj = appPrefs.rssHistory [i];
		if (obj.filepath == theData.filePath) {
			console.log ("fieldsToHistory: copying data into history array element #" + i);
			obj.guid.flPermalink = true;
			obj.guid.value = theData.publishedUrl;
			obj.title = theData.title;
			obj.link = theData.publishedUrl;
			obj.text = getBodyText ();
			obj.twitterScreenName = twGetScreenName ();
			obj.when = theData.when;
			obj.filepath = theData.filePath;
			obj.linkJson = theData.linkJson;
			obj.flMarkdown = true; //3/26/15 by DW
			obj.flPgfLevelMarkdown = true; //7/24/15 by DW
			historyChanged (); //3/27/15 by DW
			break;
			}
		}
	}
function addToHistory () {
	var obj = new Object ();
	appPrefs.rssHistory.unshift (obj);
	while (appPrefs.rssHistory.length > appPrefs.rssMaxItemsInFeed) {
		appPrefs.rssHistory.pop ();
		}
	obj.guid = new Object ();
	obj.filepath = theData.filePath; //otherwise fieldsToHistory won't find it! oy
	fieldsToHistory ();
	}
function buildHistoryMenu () { //3/27/15 by DW
	var maxCharsHistoryMenuItem = 25;
	$("#idHistoryMenuList").empty ();
	for (var i = 0; i < appPrefs.rssHistory.length; i++) {
		var obj = appPrefs.rssHistory [i];
		var liMenuItem = $("<li></li>");
		var menuItemNameLink = $("<a></a>");
		
		//set text of menu item
			var itemtext = obj.title;
			itemtext = maxLengthString (itemtext, maxCharsHistoryMenuItem);
			
			if (obj.filepath == appPrefs.lastFilePath) { 
				itemtext = "<i class=\"fa fa-check iMenuCheck\"></i>" + itemtext;
				}
			
			if (itemtext.length === 0) {
				itemtext = "&nbsp;";
				}
			menuItemNameLink.html (itemtext);
		
		menuItemNameLink.attr ("onclick", "openThisFile ('" + obj.filepath + "')");
		menuItemNameLink.attr ("target", "_blank");
		liMenuItem.append (menuItemNameLink);
		$("#idHistoryMenuList").append (liMenuItem);
		}
	}
function rssCloudPing (urlServer, urlFeed) { //7/25/15 by DW
	$.post (urlServer, {url: urlFeed}, function (data, status) {
		console.log ("rssCloudPing: urlServer == " + urlServer + ", urlFeed == " + urlFeed + ", status == " + status);
		});
	}
function myWordBuildRssFeed () {
	var now = new Date (), flcloud = false;
	var headElements = {
		title: appPrefs.rssTitle,
		link: appPrefs.rssLink,
		description: appPrefs.rssDescription,
		language: appPrefs.rssLanguage,
		generator: appConsts.productnameForDisplay + " v" + appConsts.version,
		docs: "http://cyber.law.harvard.edu/rss/rss.html",
		twitterScreenName: twGetScreenName (),
		maxFeedItems: appPrefs.rssMaxItemsInFeed,
		appDomain: appConsts.domain
		}
	if (config.rssCloud !== undefined) { //7/25/15 by DW
		if (getBoolean (config.rssCloud.enabled)) {
			headElements.flRssCloudEnabled = true;
			headElements.rssCloudDomain = config.rssCloud.domain;
			headElements.rssCloudPort = config.rssCloud.port;
			headElements.rssCloudPath = config.rssCloud.path;
			headElements.rssCloudRegisterProcedure = "";
			headElements.rssCloudProtocol = "http-post";
			flcloud = true;
			}
		}
	var xmltext = buildRssFeed (headElements, appPrefs.rssHistory);
	twUploadFile ("rss.xml", xmltext, "text/xml", false, function (data) {
		console.log ("myWordBuildRssFeed: " + data.url + " (" + secondsSince (now) + " seconds)");
		if (appPrefs.rssFeedUrl != data.url) {
			appPrefs.rssFeedUrl = data.url;
			prefsChanged ();
			}
		if (flcloud) { //7/25/15 by DW
			var urlRssCloudServer = "http://" + headElements.rssCloudDomain + ":" + headElements.rssCloudPort + "/ping";
			rssCloudPing (urlRssCloudServer, data.url);
			}
		});
	}
function viewPrefs () {
	console.log (jsonStringify (appPrefs));
	}
function viewPublishedFile () {
	var url = theData.publishedUrl;
	if (url.length == 0) {
		alertDialog ("Can't view the file because the current essay hasn't been published yet.");
		}
	else {
		window.open (url);
		}
	}
function viewFeed () {
	if (appPrefs.rssFeedUrl.length == 0) {
		alertDialog ("Can't view the feed because no essays have been posted.");
		}
	else {
		window.open (appPrefs.rssFeedUrl);
		}
	}
function applyPrefs () {
	theData.authorname = appPrefs.authorName;
	theData.authorwebsite = appPrefs.authorWebsite;
	
	appPrefs.defaultImageUrl = trimWhitespace (appPrefs.defaultImageUrl); //3/8/15 by DW
	
	prefsChanged ();
	}
function newFileData () { //set fields of theData to represent a new file
	theData.body = "";
	theData.title = "";
	theData.description = "";
	theData.nameTemplate = appPrefs.nameDefaultTemplate; //3/28/15 by DW
	theData.subs = [];
	
	theData.authorname = appPrefs.authorName;
	theData.authorwebsite = appPrefs.authorWebsite;
	
	theData.img = "";
	theData.when = new Date ();
	theData.whenLastSave = new Date (0);
	theData.ctSaves = 0;
	theData.filePath = "essays/" + padWithZeros (++appPrefs.fileSerialnum, 3) + ".json";
	theData.publishedUrl = "";
	theData.linkJson = ""; //3/24/15 by DW
	
	addToHistory ();
	
	appPrefs.lastFilePath = theData.filePath;
	appPrefs.lastPublishedUrl = "";
	viewPublishedUrl ();
	prefsChanged ();
	}

function setBackgroundImage () {
	askDialog ("URL of background image:", theData.img, "Enter the URL of your background image here.", function (s, flcancel) {
		if (!flcancel) {
			theData.img = s;
			prefsChanged ();
			}
		});
	}
function setEditorFields (titletext, descriptiontext, bodytext) {
	$("#idTitleEditor").html (titletext);
	var editorTitle = new MediumEditor (".divTitleEditor", {
		placeholder: {
			text: "Title"
			},
		toolbar: {
			buttons: defaultEditorButtons,
			},
		buttonLabels: "fontawesome",
		disableReturn: true
		});
	
	$("#idDescriptionEditor").html (descriptiontext);
	var editorDescription = new MediumEditor (".divDescriptionEditor", {
		placeholder: {
			text: "Description"
			},
		toolbar: {
			buttons: defaultEditorButtons,
			},
		buttonLabels: "fontawesome",
		disableReturn: true
		});
	
	$("#idBodyEditor").html (bodytext);
	var editorBody = new MediumEditor (".divBodyEditor", {
		placeholder: {
			text: "Tell your story..."
			},
		toolbar: {
			buttons: defaultEditorButtons,
			},
		buttonLabels: "fontawesome"
		});
	}
function subsToText (subs) {
	var s = "";
	for (var i = 0; i < subs.length; i++) {
		s += "<p>" + subs [i] + "</p>\n";
		}
	return (s);
	}

function dataToFields () {
	
	setEditorFields (theData.title, theData.description, subsToText (theData.subs));
	
	
	}
function fieldsToData () {
	theData.title = $("#idTitleEditor").html ();
	theData.description = $("#idDescriptionEditor").html ();
	theData.body = $("#idBodyEditor").html ();
	theData.subs = theData.body.split ("\n\n"); //4/2/15 by DW
	
	}
function saveButtonClick (callback) {
	var now = new Date ();
	
	fieldsToData ();
	fieldsToHistory ();
	
	theData.whenLastSave = now;
	theData.ctSaves++;
	jsontextForLastSave = jsonStringify (theData);
	
	$("#idSavedStatus").html ("");
	twUploadFile (appPrefs.lastFilePath, jsontextForLastSave, "text/plain", true, function (data) {
		console.log ("saveButtonClick: " + data.url + " (" + secondsSince (now) + " seconds)");
		$("#idSavedStatus").html ("SAVED");
		if (callback != undefined) {
			callback ();
			}
		});
	}
function newButtonClick () {
	confirmDialog ("Erase all fields, starting a new web page?", function () {
		newFileData ();
		dataToFields ();
		saveButtonClick ();
		});
	}
function viewPublishedUrl () {
	$("#idPublishedUrl").html ("<a href=\"" + appPrefs.lastPublishedUrl + "\" target=\"_blank\">" + appPrefs.lastPublishedUrl + "</a>");
	}
function publishButtonClick (flInteract, callback) {
	//Changes
		//3/24/15; 6:53:47 PM by DW
			//New optional param, flInteract. If false, we don't put up a dialog asking if the user wants to see the rendered file. 
		//3/21/15; 5:31:07 PM by DW
			//There is one specific circumstance where we have to upload twice. If appPrefs.lastPublishedUrl is the empty string, we upload the first time to set the value, then upload again, so that it can be correct in the pagetable. The Facebook metadata needs the canonical URL for the page to be correct. 
	function markdownProcess (s) {
		if (appPrefs.flMarkdownProcess) {
			var md = new Markdown.Converter (), theList = s.split ("</p><p>"), markdowntext = "";
			for (var i = 0; i < theList.length; i++) {
				var lt = theList [i];
				if ((lt.length > 0) && (lt != "<p>") && (lt != "</p>")) {
					markdowntext += "<p>" + md.makeHtml (lt) + "</p>";
					}
				}
			return (markdowntext);
			}
		else {
			return (s);
			}
		}
	var now = new Date (), urlTemplate;
	if (flInteract === undefined) {
		flInteract = true;
		}
	fieldsToData ();
	//set urlTemplate, unicase search
		var lowername = stringLower (theData.nameTemplate);
		for (var x in config.templates) {
			if (stringLower (x) == lowername) {
				urlTemplate = config.templates [x];
				break;
				}
			}
		if (urlTemplate === undefined) { //not found, use the first as default
			for (var x in config.templates) {
				urlTemplate = config.templates [x];
				break;
				}
			}
		
		
	function uploadOnce (templatetext, callback) {
		var username = twGetScreenName (), commentstext = "";
		var filepath = replaceAll (theData.filePath, ".json", ".html");
		var urlpage = appPrefs.lastPublishedUrl; //"http://myword.io/users/" + username + filepath;
		var urlimage = theData.img;
		if (urlimage.length == 0) {
			if (appPrefs.flUseDefaultImage && (appPrefs.defaultImageUrl.length > 0)) { //user has specified a default image, use it
				urlimage = appPrefs.defaultImageUrl;
				}
			else {
				urlimage = globalDefaultImageUrl;
				}
			}
		
		if (appPrefs.flDisqusComments) {//3/31/15 by DW
			commentstext = replaceAll (disqusCode, "[%disqusgroupname%]", appPrefs.disqusGroupName);
			}
		
		var pagetable = { //3/30/15 by DW -- add appPrefs and appConsts to the pagetable
			flFromEditor: true,
			authorname: theData.authorname,
			authorwebsite: theData.authorwebsite,
			when: theData.when,
			body: theData.body,
			pagetitle: theData.title,
			ogtitle: theData.title,
			ogdescription: theData.description,
			ogimage: urlimage,
			ogurl: urlpage,
			twscreenname:  "@" + username,
			twtitle:  theData.title,
			twdescription:  theData.description,
			twimage:  urlimage,
			rssfeedurl: appPrefs.rssFeedUrl,
			nametemplate: theData.nameTemplate, //3/28/15 by DW
			urltemplate: urlTemplate, //3/29/15 by DW
			username: username, //8/7/15 PM by DW -- the user's screenname without the leading @
			urltwitterprofile: "https://twitter.com/" + username, //8/7/15 by DW
			appConsts: new Object (), //3/30/15 by DW
			appPrefs: new Object () //3/30/15 by DW
			};
		copyScalars (appConsts, pagetable.appConsts);
		copyScalars (appPrefs, pagetable.appPrefs);
		pagetable.pagetableinjson = jsonStringify (pagetable);
		pagetable.disquscomments = commentstext; //3/31/15 by DW
		pagetable.commenttext = commentstext; //4/1/15 by DW -- grandfathered, first version of default template used this name
		pagetable.renderedtext = markdownProcess (pagetable.body); //for substitution in the template -- 3/26/15 by DW
		
		var renderedtext = multipleReplaceAll (templatetext, pagetable, false, "[%", "%]");
		twUploadFile (theData.filePath, pagetable.pagetableinjson, "application/json", false, function (data) {
			theData.linkJson = data.url;
			twUploadFile (filepath, renderedtext, "text/html", false, function (data) {
				console.log ("publishButtonClick: " + data.url + " (" + secondsSince (now) + " seconds)"); 
				theData.publishedUrl = data.url;
				appPrefs.lastPublishedUrl = data.url; //7/29/15 by DW
				callback (data);
				});
			});
		}
	function afterUpload (data) {
		viewPublishedUrl ();
		prefsChanged ();
		feedChanged ();
		saveButtonClick (function () {
			if (flInteract) {
				confirmDialog ("View the published essay?", function () {
					window.open (data.url);
					if (callback != undefined) {
						callback ();
						}
					});
				}
			else {
				if (callback != undefined) {
					callback ();
					}
				}
			});
		}
	readHttpFile (urlTemplate, function (templatetext) {
		console.log ("publishButtonClick: read " + templatetext.length + " chars from " + urlTemplate);
		uploadOnce (templatetext, function (data) {
			if (appPrefs.lastPublishedUrl.length == 0) { //have to upload a second time
				appPrefs.lastPublishedUrl = data.url;
				theData.publishedUrl = data.url;
				uploadOnce (templatetext, function (data) {
					afterUpload (data);
					});
				}
			else {
				afterUpload (data);
				}
			});
		});
	}
function buildTemplateMenu () { //3/28/15 by DW
	$("#idTemplateSelect").empty ();
	for (x in config.templates) {
		$("#idTemplateSelect").append ("<option value=\"" + stringLower (x) + "\">" + x + "</option>");
		}
	}
function templateMenuSelect () { //3/28/15 by DW
	console.log ("templateMenuSelect: you chose == " + $("#idTemplateSelect").val () + " template.");
	}
function openEssayFile (callback) {
	if (appPrefs.lastFilePath.length == 0) { //first run
		newFileData ();
		dataToFields ();
		jsontextForLastSave = jsonStringify (theData);
		if (callback !== undefined) {
			callback ();
			}
		}
	else {
		console.log ("openEssayFile: appPrefs.lastFilePath == " + appPrefs.lastFilePath);
		twGetFile (appPrefs.lastFilePath, true, true, function (error, data) {
			if (data != undefined) {
				try {
					theData = JSON.parse (data.filedata);
					if (theData.nameTemplate === undefined) {
						theData.nameTemplate = appPrefs.nameDefaultTemplate;
						}
					console.log ("openEssayFile: " + data.filedata.length + " chars.");
					}
				catch (err) {
					newFileData ();
					console.log ("openEssayFile: error == " + err.message);
					}
				}
			else {
				newFileData ();
				console.log ("openEssayFile: error == " + jsonStringify (error));
				}
			dataToFields ();
			jsontextForLastSave = jsonStringify (theData);
			if (callback != undefined) {
				callback ();
				}
			});
		}
	}
function showHideEditor () {
	var homeDisplayVal = "none", aboutDisplayVal = "none", startupFailDisplayVal = "none";
	
	if (twIsTwitterConnected ()) {
		if (flStartupFail) {
			startupFailDisplayVal = "block";
			}
		else {
			homeDisplayVal = "block";
			}
		}
	else {
		aboutDisplayVal = "block";
		}
	
	$("#idEditor").css ("display", homeDisplayVal);
	$("#idLogonMessage").css ("display", aboutDisplayVal);
	$("#idStartupFailBody").css ("display", startupFailDisplayVal);
	}
function prefsChanged () {
	flPrefsChanged = true;
	}
function historyChanged () {
	flHistoryChanged = true;
	}
function feedChanged () {
	flFeedChanged = true;
	}
function settingsCommand () {
	twStorageToPrefs (appPrefs, function () {
		prefsDialogShow ();
		});
	}
function switchServer () { //3/19/15 by DW
	askDialog ("URL of new server:", twStorageData.urlTwitterServer, "Enter the URL of your server here.", function (s, flcancel) {
		if (!flcancel) {
			localStorage.urlTwitterServer = s;
			twStorageData.urlTwitterServer = s;
			twDisconnectFromTwitter ();
			twConnectToTwitter ();
			}
		});
	}
function initMenus () {
	var cmdKeyPrefix = getCmdKeyPrefix (); //10/6/14 by DW
	document.getElementById ("idMenuProductName").innerHTML = appConsts.productnameForDisplay; 
	document.getElementById ("idMenuAboutProductName").innerHTML = appConsts.productnameForDisplay; 
	$("#idMenubar .dropdown-menu li").each (function () {
		var li = $(this);
		var liContent = li.html ();
		liContent = liContent.replace ("Cmd-", cmdKeyPrefix);
		li.html (liContent);
		});
	twUpdateTwitterMenuItem ("idTwitterConnectMenuItem");
	twUpdateTwitterUsername ("idTwitterUsername");
	}
function tellOtherInstancesToQuit () {
	randomMysteryString = getRandomPassword (25);
	localStorage.youAreNotNeeded = randomMysteryString; 
	}
function initEditor () {
	}
function everySecond () {
	var now = clockNow ();
	twUpdateTwitterMenuItem ("idTwitterConnectMenuItem");
	twUpdateTwitterUsername ("idTwitterUsername");
	pingGoogleAnalytics ();
	showHideEditor ();
	
	//auto-save
		if (secondsSince (whenLastKeystroke) >= 1) {
			var jsontext;
			fieldsToData ();
			jsontext = jsonStringify (theData);
			if (jsontext != jsontextForLastSave) {
				saveButtonClick (function () {
					if (appPrefs.flAutoPublish) { //7/23/15 by DW
						publishButtonClick (false);
						}
					});
				}
			}
	
	if (flPrefsChanged) {
		twPrefsToStorage (appPrefs);
		flPrefsChanged = false;
		}
	if (flHistoryChanged) { //3/27/15 by DW
		buildHistoryMenu ();
		flHistoryChanged = false;
		}
	if (flFeedChanged) {
		myWordBuildRssFeed ();
		flFeedChanged = false;
		}
	
	//if another copy of MWE launched, we are not needed, we quit
		if (localStorage.youAreNotNeeded != undefined) {
			if (localStorage.youAreNotNeeded != randomMysteryString) {
				if (ctCloseAttempts < 2) { 
					ctCloseAttempts++;
					window.close ();
					}
				}
			}
	}
function onKeyup () {
	whenLastUserAction = new Date ();
	whenLastKeystroke = whenLastUserAction;
	}
function initCmdKeys () {
	myCombos = [
		{ //Cmd-P to publish
			"keys": "meta p",
			"is_ordered": true,
			"on_keydown": function (ev) {
				publishButtonClick ();
				event.stopPropagation ();
				event.preventDefault ();
				return (false);
				}
			}
		];
	keypress.register_many (myCombos);
	}
function startup () {
	var flSkipConfigRead = false;
	function readConfigJson (flSkipServerSet, callback) { //3/20/15 by DW
		readHttpFile (fnameconfig, function (s) {
			if (s !== undefined) { //the file exists and was read correctly
				try {
					var jstruct = JSON.parse (s);
					console.log ("readConfigJson: " + fnameconfig + " contains " + jsonStringify (jstruct));
					if (!flSkipServerSet) {
						if (jstruct.urlTwitterServer !== undefined) {
							twStorageData.urlTwitterServer = jstruct.urlTwitterServer;
							console.log ("readConfigJson: twStorageData.urlTwitterServer == " + twStorageData.urlTwitterServer);
							}
						}
					if (jstruct.urlDefaultImage != undefined) { //3/21/15 by DW
						globalDefaultImageUrl = jstruct.urlDefaultImage;
						console.log ("readConfigJson: globalDefaultImageUrl == " + globalDefaultImageUrl);
						}
					if (jstruct.googleAnalyticsAccount !== undefined) { //3/26/15 by DW
						appConsts.googleAnalyticsAccount = jstruct.googleAnalyticsAccount;
						appConsts.domain = stringNthField (window.location.href, "/", 3); //3/22/15 by DW
						console.log ("readConfigJson: appConsts.domain == " + appConsts.domain);
						console.log ("readConfigJson: appConsts.googleAnalyticsAccount == " + appConsts.googleAnalyticsAccount);
						initGoogleAnalytics (); 
						}
					config = jstruct; //3/28/15 by DW -- keep it as a global
					if (config.templates === undefined) { //3/30/15 by DW
						config.templates = defaultTemplates;
						}
					buildTemplateMenu (); //3/28/15 by DW
					}
				catch (err) {
					console.log ("readConfigJson: err == " + err);
					}
				}
			callback ();
			});
		}
	console.log ("startup");
	hitCounter (); 
	initGoogleAnalytics (); 
	$("#idTwitterIcon").html (twStorageConsts.fontAwesomeIcon);
	$("#idVersionNumber").html ("v" + appConsts.version);
	$("#idTitleEditor").keyup (onKeyup);
	$("#idDescriptionEditor").keyup (onKeyup);
	$("#idBodyEditor").keyup (onKeyup);
	initCmdKeys ();
	initMenus ();
	tellOtherInstancesToQuit ();
	twGetOauthParams (); //redirects if OAuth params are present
	//determine the URL of the nodeStorage server -- 3/19/15 by DW
		if (localStorage.urlTwitterServer !== undefined) {
			twStorageData.urlTwitterServer = localStorage.urlTwitterServer;
			//if the user specified a server that happens to be our server, patch it up with the new URL
				twStorageData.urlTwitterServer = replaceAll (twStorageData.urlTwitterServer, "http://twitter.myword.io/", appConsts.urlTwitterServer); //5/9/15 by DW
			flSkipConfigRead = true; //the localStorage value takes precedence
			}
		else {
			twStorageData.urlTwitterServer = appConsts.urlTwitterServer;
			}
	readConfigJson (flSkipConfigRead, function () {
		if (twIsTwitterConnected ()) {
			twUserWhitelisted (twGetScreenName (), function (flwhitelisted) {
				if (flwhitelisted) {
					twStorageStartup (appPrefs, function (flGoodStart) {
						flStartupFail = !flGoodStart;
						patchPrefs (); //3/27/15 by DW
						if (flGoodStart) {
							initEditor (); //4/2/15 by DW
							openEssayFile (function () {
								showHideEditor ();
								viewPublishedUrl ();
								buildHistoryMenu (); //3/27/15 by DW
								appPrefs.ctStartups++;
								prefsChanged ();
								applyPrefs ();
								twGetTwitterConfig (function () { //twStorageData.twitterConfig will have information from twitter.com
									twGetUserInfo (twGetScreenName (), function (userData) {
										if (appPrefs.authorName.length == 0) {
											appPrefs.authorName = userData.name;
											theData.authorname = userData.name; //3/21/15 by DW
											prefsChanged ();
											}
										if (appPrefs.authorWebsite.length == 0) {
											appPrefs.authorWebsite = userData.url;
											theData.authorwebsite = userData.url; //3/21/15 by DW
											prefsChanged ();
											twDerefUrl (appPrefs.authorWebsite, function (longUrl) { //try to unshorten the URL
												appPrefs.authorWebsite = longUrl;
												theData.authorwebsite = longUrl; //3/21/15 by DW
												prefsChanged ();
												});
											}
										twitterToPrefs (userData); //fill in RSS prefs with info we got from Twitter
										});
									runStartupCode (); //4/3/15 by DW
									self.setInterval (everySecond, 1000); 
									});
								});
							}
						});
					}
				else {
					alertDialog ("Can't open the editor because there was an error connecting to the server, " + twStorageData.urlTwitterServer + ", or the user \"" + twGetScreenName () + "\" is not whitelisted.");
					}
				});
			}
		else {
			showHideEditor ();
			}
		});
	}
