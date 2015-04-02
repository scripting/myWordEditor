//See this blog post for info on replacing this code. 
//http://myword.smallpict.com/2015/04/02/towardEditorPlugins.html
function getEditorText (s) {
	return ($("#idTextArea").val ());
	}
function setEditorText (s) {
	$("#idTextArea").val (s);
	}
function initEditor () {
	var placeholder = "Obviously this is a good place to write something.";
	$("#idEditorContainer").append ('<textarea class="myTextArea" id="idTextArea" onKeyUp="keyupTextArea ()" placeholder="' + placeholder + '"></textarea>');
	}

