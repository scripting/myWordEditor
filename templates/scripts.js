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
	*/
var appConsts = {
	productname: "myWord",
	productnameForDisplay: "MyWord Editor",
	productLink: "http://myword.io/editor/",
	domain: "myword.io", 
	version: "0.53"
	}
var defaultImageUrl = "http://scripting.com/2015/03/06/allmans.png";
var mySnap, flSnapDrawerOpen = false;

document.write ('<script src="http://api.nodestorage.io/ui/jquery-1.9.1.min.js"></script>');
document.write ('<link href="http://api.nodestorage.io/ui/bootstrap.css" rel="stylesheet">');
document.write ('<script src="http://api.nodestorage.io/ui/bootstrap.min.js"></script>');
document.write ('<link rel="stylesheet" href="http://fargo.io/code/fontAwesome/css/font-awesome.min.css"/>');
document.write ('<link href="http://api.nodestorage.io/ui/ubuntuFont.css" rel="stylesheet" type="text/css">');

document.write ('<script src="http://api.nodestorage.io/ui/utils.js"></script>');
document.write ('<script src="http://api.nodestorage.io/ui/alertdialog.js"></script>');
document.write ('<script src="http://api.nodestorage.io/ui/markdownConverter.js"></script>');
document.write ('<script src="http://api.nodestorage.io/ui/emojify.js"></script>');

document.write ("<link href='http://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic' rel='stylesheet' type='text/css'>"); //3/23/15 by DW
document.write ('<link href="http://fonts.googleapis.com/css?family=Open+Sans:400,800" rel="stylesheet" type="text/css">');

document.write ("<script src='http://fargo.io/code/shared/xml.js'></script>");
document.write ("<script src='http://fargo.io/cms/snap/snap.js'></script>");
document.write ("<link rel='stylesheet' type='text/css' href='http://fargo.io/cms/snap/snap.css' />");

document.write ('<link href="http://myword.io/templates/styles.css" rel="stylesheet" type="text/css">');

function viewPagetable () {
	console.log (jsonStringify (pagetable));
	}
function readLinksFromRss (url, idBlogPosts, callback) { //3/25/15 by DW
	var htmltext = "", indentlevel = 0, whenstart = new Date ();
	var thisPageUrl = stringNthField (window.location.href, "?", 1);
	function getSub (item, name) {
		var url;
		$(item).children (name).each (function () {
			url = $(this).text ();
			});
		return (url);
		}
	function add (s) {
		htmltext += s + "\r\n";
		}
	$("#" + idBlogPosts).empty ();
	readHttpFile (url, function (xmltext) {
		var xstruct = $($.parseXML (xmltext));
		var adrchannel = xmlGetAddress (xstruct, "channel");
		add ("<ul>"); indentlevel++;
		$(adrchannel).children ("item").each (function () {
			var pubDate = getSub (this, "pubDate"), urlPermalink = getSub (this, "guid"), title = getSub (this, "title");
			var linkJson = getSub (this, "source\\:linkJson"), link = getSub (this, "link");
			if (link != undefined) {
				var theScript = "viewListItem ('" + linkJson + "')";
				var theUrl = link + "?tocOpen=true", theLink;
				if (link == thisPageUrl) {
					theLink = "<h4>" + title + "</h4>";
					}
				else {
					theLink = "<a href=\"" + theUrl + "\">" + title + "</a>";
					}
				add ("<li>" + theLink + "</i>");
				}
			
			});
		add ("</ul>"); indentlevel--;
		$("#" + idBlogPosts).append (htmltext);
		if (callback != undefined) {
			callback ();
			}
		});
	}
function handleHamburgerClick () { //3/25/15 by DW
	console.log ("handleHamburgerClick: flSnapDrawerOpen == " + flSnapDrawerOpen);
	console.log ("handleHamburgerClick: window.location.href == " + window.location.href);
	if (flSnapDrawerOpen) {
		mySnap.close ("left");
		if (stringContains (window.location.href, "?tocOpen=true")) { //redirect
			window.location.href = stringNthField (window.location.href, "?", 1);
			}
		flSnapDrawerOpen = false;
		}
	else {
		mySnap.open ("left");
		flSnapDrawerOpen = true;
		}
	}
function initSnap (flSnapOpenInitially) { //3/25/15 by DW
	var snapcontent, openicon;
	//add the hamburger in the upper-left corner
		$("#idSnapContent").prepend ("<div class=\"divSnapIcon\"><a href=\"#\" id=\"idSnapOpenIcon\" style=\"z-index: 20;  position: relative;\"></a></div>");
	snapcontent = document.getElementById ("idSnapContent");
	openicon = document.getElementById ("idSnapOpenIcon");
	if (snapcontent != null) {
		mySnap = new Snap ({
			element: snapcontent, touchToDrag: false, maxPosition: 400, minPosition: -400, transitionSpeed: 0
			});
		}
	if (flSnapOpenInitially) {
		if (mySnap !== undefined) {
			mySnap.open ("left");
			flSnapDrawerOpen = true;
			}
		}
	if (mySnap !== undefined) {
		mySnap.settings ({transitionSpeed: 0.3});
		}
	if (openicon != null) {
		openicon.addEventListener ("click", handleHamburgerClick);
		}
	}
function everySecond () {
	}
function initGoogleAnalytics () {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	
	ga('create', 'UA-39531990-1', appConsts.domain);
	ga('send', 'pageview');
	}
function emojifyString (s) {
	emojify.setConfig ({
		img_dir: "http://fargo.io/code/emojify/images/emoji",  
		});
	return (emojify.replace (s));
	}
function getFooterText (pagetable) {
	var rssLink = "<a href=\"" + pagetable.rssfeedurl + "\" target=\"_blank\"><i class=\"fa fa-rss spFooterRssIcon\"></i></a>";
	var dateString = new Date (pagetable.when).toLocaleDateString ();
	var timeString = new Date (pagetable.when).toLocaleTimeString ();
	var username = pagetable.authorname;
	var productlink = "<a href=\"" + appConsts.productLink + "\">" + appConsts.productnameForDisplay + "</a>";
	if (pagetable.authorwebsite.length > 0) {
		username = "<a href=\"" + pagetable.authorwebsite + "\">" + username + "</a>";
		}
	return ("<p>Created on " + dateString + " at " + timeString + " by " + username + ", using " + productlink + ". " + rssLink + "</p>");
	}
function viewPostFromEditor (pagetable) {
	var now = new Date (), markdown = new Markdown.Converter ();
	//background image
		var imgurl = trimWhitespace (pagetable.ogimage);
		if (imgurl.length > 0) {
			if ($("#idBackgroundImage")) {
				$("#idBackgroundImage").css ("background-image", "url(" + imgurl + ")");
				}
			}
	//byline
		if (pagetable.authorname != undefined) {
			if ($("#idPageByline")) {
				var author = pagetable.authorname, byline;
				if (pagetable.authorwebsite != undefined) {
					author = "<a href=\"" + pagetable.authorwebsite + "\">" + author + "</a>";
					}
				byline = "By " + author;
				if (pagetable.when != undefined) {
					var whenstring;
					if (sameDay (new Date (pagetable.when), now)) {
						whenstring = " at ";
						}
					else {
						whenstring = " on ";
						}
					byline += whenstring + viewDate (pagetable.when);
					}
				$("#idPageByline").html (byline + ".");
				}
			}
	//footer text
		if ($("#idPageFooter")) {
			$("#idPageFooter").html ("<div class=\"divFooterText\">" + getFooterText (pagetable) + "</div>");
			}
	//comments -- 7/25/15 by DW
		if (!getBoolean (pagetable.flDisqusComments)) {
			$("#idDisqusComments").css ("display", "none");
			}
	
	return; //7/23/15 by DW
	
	//title
		if (pagetable.ogtitle != undefined) {
			if ($("#idPageTitle")) {
				$("#idPageTitle").html (pagetable.ogtitle);
				}
			}
		if (pagetable.pagetitle != undefined) {
			var titleprefix;
			if (pagetable.appPrefs.authorName) {
				titleprefix = pagetable.appPrefs.authorName;
				}
			else {
				titleprefix = appConsts.productnameForDisplay;
				}
			document.title = titleprefix + ": " + pagetable.pagetitle;
			}
		
	//description
		if (pagetable.ogdescription != undefined) {
			if ($("#idPageDescription")) {
				$("#idPageDescription").html (pagetable.ogdescription);
				}
			}
	//essay text
		if (pagetable.body != undefined) {
			if ($("#idEssayText")) {
				var essaytext = "<div class=\"divMarkdownText\">" + markdown.makeHtml (emojifyString (pagetable.body)) + "</div>";
				$("#idEssayText").html (essaytext);
				}
			}
	}
function startup () {
	var urlparam = decodeURIComponent (getURLParameter ("url")), urlEssay = "essay.json", jstruct, imgurl = defaultImageUrl;
	var tocparam = decodeURIComponent (getURLParameter ("tocOpen")), flSnapOpenInitially = false;
	var markdown = new Markdown.Converter (), now = new Date (), flmarkdown;
	console.log ("startup");
	$("#idVersionNumber").html ("<a href=\"https://github.com/scripting/myWordEditor\" target=\"_blank\">v" + appConsts.version + "</a>");
	initGoogleAnalytics (); 
	hitCounter ();
	if (urlparam != "null") {
		urlEssay = urlparam;
		}
	if (tocparam != "null") { //3/25/15 by DW
		if (getBoolean (tocparam)) {
			flSnapOpenInitially = true;
			}
		}
	initSnap (flSnapOpenInitially);
	readLinksFromRss (pagetable.rssfeedurl, "idLinksToPosts");
	if ((pagetable !== undefined) && (pagetable.flFromEditor)) {
		viewPostFromEditor (pagetable);
		self.setInterval (everySecond, 1000); 
		}
	else {
		readHttpFile (urlEssay, function (s) {
			try {
				jstruct = JSON.parse (s);
				}
			catch (err) {
				alertDialog (err + ". Try using <a href=\"http://jsonlint.com/\" target=\"_blank\">jsonlint</a> to find the error in the JSON file.");
				return;
				}
			
			flmarkdown = getBoolean (jstruct.flMarkdown); //2/13/15 by DW
			
			//image
				if (jstruct.img != undefined) {
					imgurl = jstruct.img;
					}
				$("#idBackgroundImage").css ("background-image", "url(" + imgurl + ")");
			//title
				if (jstruct.title != undefined) {
					$("#idPageTitle").html (jstruct.title);
					document.title = appConsts.productnameForDisplay + ": " + jstruct.title;
					}
			//fonts
				if (jstruct.titlefont != undefined) {
					$("#idPageTopText").css ("font-family", jstruct.titlefont);
					}
				if (jstruct.bodyfont != undefined) {
					$("#idEssayText").css ("font-family", jstruct.bodyfont);
					}
				
			//byline
				if (jstruct.authorname != undefined) {
					var author = jstruct.authorname, byline;
					if (jstruct.authorwebsite != undefined) {
						author = "<a href=\"" + jstruct.authorwebsite + "\">" + author + "</a>";
						}
					byline = "By " + author;
					if (jstruct.when != undefined) {
						var whenstring;
						if (sameDay (new Date (jstruct.when), now)) {
							whenstring = " at ";
							}
						else {
							whenstring = " on ";
							}
						byline += whenstring + viewDate (jstruct.when);
						}
					$("#idPageByline").html (byline + ".");
					}
			//description
				if (jstruct.description != undefined) {
					$("#idPageDescription").html (jstruct.description);
					}
			//essay text
				var essaytext = "";
				function dolist (thelist) {
					for (var i = 0; i < thelist.length; i++) {
						var sub = thelist [i];
						if (typeof sub == "string") {
							if (flmarkdown) {
								essaytext += sub + "\n\n";
								}
							else {
								essaytext += "<p>" +  sub + "</p>";
								}
							}
						else {
							if (sub.title != undefined) {
								essaytext += "<div class=\"divSubhead\">" + sub.title + "</div>";
								}
							if (sub.subs != undefined) {
								dolist (sub.subs);
								}
							}
						}
					}
				dolist (jstruct.subs);
				
				if (flmarkdown) {
					console.log ("startup: essay text before Markdown processing == " + essaytext);
					essaytext = "<div class=\"divMarkdownText\">" + markdown.makeHtml (essaytext) + "</div>";
					}
				
				$("#idEssayText").html (essaytext);
			self.setInterval (everySecond, 1000); 
			});
		}
	}
