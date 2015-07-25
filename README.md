# myWordEditor

A simple silo-free blogging tool that creates beautiful essay pages. 

Here's an <a href="http://myword.io/users/davewiner/essays/030.html">example</a> of the kind of page you can create with MyWord Editor.

And the <a href="http://scripting.com/2015/03/23/mywordEditorIsOpenSource.html">blog post</a> announcing the release of MyWord Editor in open source.

#### Demo app

Here's the <a href="http://myword.io/editor/">demo app</a> for this project, MyWord Editor.

You can set up your own blogging environment and use it to host your writing and for other people, your friends, colleagues, members of a club, whatever you like.

My name is Dave Winer. I blog at <a href="http://scripting.com/">Scripting News</a>. I wrote some of the earliest blogging, RSS and podcasting software. 

#### It's radical software

These days blogging tools try to lock you into their business model, and lock other developers out. I have the freedom to do what I want, so I decided to take the exact opposite approach. I don't  want to operate a free public blogging tool and lock users in and make them dependent on me. Instead, I want to learn from thinkers and writers and developers. I want to engage with other minds. Making money, at this stage of my career, is not so interesting to me. I'd much rather make ideas, and new working relationships, and friends. 

So MyWord Editor is radically <a href="http://scripting.com/2015/03/19/mywordEditorWillBeSilofreeFromTheStart.html">silo-free</a>. 

#### How to clone this

This app runs on the user's computer, in a browser. It's a JavaScript app. It communicates via a simple <a href="http://api.nodestorage.io/api.js">API</a>, with a <a href="https://github.com/scripting/nodeStorage">nodeStorage</a> server, that uses Twitter for identity and Amazon S3 for storage. That server, like the app, is open source. The first part of creating your own blogging system is to set up a nodeStorage server. 

Once you've done that, download the contents of the myWordEditor repository, and put it in a folder that's publicly accessible over the web. I like using S3 buckets, but you could put it in a folder on an Apache or nginx server. 

Edit the config.json file so that the <i>urlTwitterServer</i> string is the URL of your nodeStorage server. 

You can also change the default image for your users' blog posts, or you can leave it as-is, with a nice picture from Wikipedia of the Grateful Dead. 

Test the installation by logging on. Follow the <a href="http://myword.smallpict.com/2015/03/06/welcomeToMywordEditor.html">instructions</a> on the MyWord Editor blog.

#### Updates

##### v0.69 -- 7/25/15 by DW

Added <a href="http://walkthrough.rsscloud.co/">rssCloud</a> support to the RSS feed produced by MWE. The feature can be turned on in <a href="https://github.com/scripting/myWordEditor/blob/master/config.json">config.json</a>, if you're running your own MWE. I'm using <a href="http://blog.andrewshell.org/what-is-rsscloud/">Andrew Shell's</a> rssCloud <a href="http://blog.andrewshell.org/rebooting-rsscloud/">server</a> for notification, rsscloud.io.

##### v0.67 -- 7/24/15 by DW

We now have a beautiful editor, integrated, <a href="https://github.com/yabwe/medium-editor">medium-editor</a>. Problem solved. :-)

You can read about the update in this <a href="http://myword.io/users/davewiner/essays/045.html">note</a>, and a <a href="http://scripting.com/2015/07/24/mywordEditorGetsMoreBeautiful.html">blog post</a>. 

##### v0.64 -- 4/3/15 by DW

Run config.startupCode at startup. See <a href="http://myword.smallpict.com/2015/04/03/codeThatRunsAtStartup.html">blog post</a> for details.

##### v0.63 -- 4/2/15 by DW

Took a step toward <a href="http://myword.smallpict.com/2015/04/02/towardEditorPlugins.html">editor plug-ins</a>. 

##### v0.62 -- 4/1/15 by DW

Support for Disqus comments. See this <a href="http://myword.smallpict.com/2015/04/01/disqusCommentsInMyword.html">blog post</a> for details.

##### v0.61 -- 3/31/15 by DW

Add scalars from appConsts and appPrefs to the pagetable in the rendered page. This allows scripts running in the page to know the title of the site, the version of MWE that created the page, etc.

In the title of essay pages, we use the author's name if it's available instead of the name of the product. So a story might say "Jordan Jones: What I want for Christmas" instead of "MyWord Editor: What I want for Christmas". 

##### v0.60 -- 3/30/15 by DW

This is the first release of MWE with <a href="http://myword.smallpict.com/2015/03/30/templatesInMyword.html">template</a> support. Be sure to read the note about breakage on that page. Any work you do with templates now is likely to break. 

##### v0.59 -- 3/27/15 by DW

First source release of the JavaScript code and CSS styles used in the rendered pages. Explained in this <a href="http://myword.smallpict.com/2015/03/27/mywordEditorV059.html">blog post</a>. 

##### v0.58 -- 3/27/15 by DW

The *Open file* command in the Editor menu is replaced by a new History menu. Explained in this <a href="http://myword.smallpict.com/2015/03/27/theHistoryMenu.html">blog post</a>.

##### v0.57 -- 3/26/15 by DW

There were lots of debugging calls to console.log that displayed huge data structures. I quieted them down, so we get simpler readouts from the console, now that this code isn't so new. Changed the <i>urlTemplateFile</i> constant to be a relative URL, relative to the folder MWE is running from. That way I can change the template on my server without changing it on everyone's. Still more of this kind of factoring to do. Must move carefully (slowly).

##### v0.56 -- 3/26/15 by DW

New supported value in config.json -- googleAnalyticsAccount. If specified, we use it in <a href="https://github.com/scripting/myWordEditor/blob/master/lib/ga.js">ga.js</a> to make calls to Google Analytics. 

##### v0.55 -- 3/26/15 by DW

Change notes in this <a href="http://myword.smallpict.com/2015/03/26/mywordEditorV055.html">blog post</a>.

##### v0.54 -- 3/24/15 by DW

A new command in the Editor menu: <i>Publish all posts.</i> After confirmation, it opens each of your posts and does exactly what clicking on the Publish button would do. I added this feature because I wanted a quick way to re-generate all the files. It'll be useful if there's a template change, or other change that requires a complete rebuild of a blog.

Also improved the <a href="http://scripting.com/2015/03/24/errorDialog.png">error dialog</a> on startup, if there was an error connecting to the server, it would report the problem as the user not being whitelisted. Usually the problem is the URL of the nodeStorage server was not correctly specified. I got bit by this myself. We needed a better message here. 

##### v0.53 -- 3/24/15 by DW

In addition to generating an HTML file for each essay, we also generate a JSON file. <a href="http://myword.io/users/davewiner/essays/017.json">Example</a>. I think this will be generally useful, I want to use it immediately to try to create a home page essay browser, using snap.js. There's a corresponding <a href="https://github.com/scripting/myWordEditor/blob/master/lib/buildrss.js#L146">element</a> in the RSS feed, called &lt;source:linkJson>. 

#### Support

If you're a developer, or running a server, please ask questions on the <a href="https://groups.google.com/forum/?fromgroups#!forum/server-snacks">server-snacks</a> mail list.

If you're a blogger, and need help writing with MWE, please join the <a href="https://groups.google.com/forum/?fromgroups#!forum/myword-editor">myword-editor</a> mail list.

In either case, please read the docs and scratch your head at least a little before <a href="http://scripting.com/2014/03/19/howToAskForHelpWithSoftware.html">asking for help</a>. 

