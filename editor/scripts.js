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

