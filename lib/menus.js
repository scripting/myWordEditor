function initMenus () {
	document.getElementById ("idMenuProductName").innerHTML = appConsts.productnameForDisplay; 
	document.getElementById ("idMenuAboutProductName").innerHTML = appConsts.productnameForDisplay; 
	$("#idMenubar .dropdown-menu li").each (function () {
		var li = $(this);
		var liContent = li.html ();
		liContent = liContent.replace ("Cmd-", getCmdKeyPrefix ());
		li.html (liContent);
		});
	}
function initTwitterMenuItems () {
	twUpdateTwitterMenuItem ("idTwitterConnectMenuItem");
	twUpdateTwitterUsername ("idTwitterUsername");
	$("#idTwitterIcon").html (twittericon);
	}
function initFacebookMenuItems () {
	fbUpdateFacebookMenuItem ("idFacebookConnectMenuItem");
	}

