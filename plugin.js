/**
 * AsciiMath plugin for TinyMCE 4
 *
 * @author   Pedro Sanção <dev at sancao dot co>
 * @license  GNU GPL v 2, see LICENCE
 * @version  Alpha 1.0
 */

(function(){

	var loadMathjaxOn = function(win) {
		var script = win.document.createElement('script');
		script.src = '//cdn.mathjax.org/mathjax/latest/MathJax.js?config=AM_HTMLorMML&delayStartupUntil=configured';
		script.onload = function() {
			win.MathJax.Hub.Config({
				showMathMenu: false
				,   showMathMenuMSIE: false
				,   showProcessingMessages: false
				,   messageStyle: 'none'
			});
			win.MathJax.Hub.Configured();
		};
		win.document.getElementsByTagName('head')[0].appendChild(script);
	};
	loadMathjaxOn(window);

	tinymce.PluginManager.requireLangPack('asciimath4');
	tinymce.PluginManager.add('asciimath4', function(editor) {
		var name = 'asciimath4', className = name + '-root-node', selector = 'span.' + className
			, attrData = 'data-' + name, attrState = attrData + '-state'
			, init = function(e) {
				var editor = e.target;
				prepareNodes();
				loadMathjaxOn(editor.getWin());
				editor.on('NodeChange', changeNode);
				editor.on('GetContent', cleanup);
				editor.on('BeforeExecCommand', removeFormat);
				addHighlightStyle();
				// if the preview plugin is active overwrite command
				if (editor.getParam('plugins').match(/\bpreview\b/)) {
					overwritePreview();
				}
			}
			, addHighlightStyle = function() {
				var background = editor.getParam(name + '_highlight_bg', '#ffc')
					, border = editor.getParam(name + '_highlight_border', '#fcc')
					, style = 'background: ' + background + '; border: 1px ' + border + ' solid; padding: 5px;';
				editor.dom.addStyle(selector +'.active{' + style + '}');
			}
			, prepareNodes = function() {
				var replace = '<span class="' + className + '" ' + attrData + '="$2">$1</span>';
				editor.setContent(editor.getContent().replace(/(`([^`]*?)`)/g, replace));
			}
			, removeFormat = function(e) {
				if (e.command === 'RemoveFormat') {
					var selection = editor.selection
						, bookmark = selection.getBookmark()
						, range = selection.getRng(true)
						, parent = getRootNode(range.commonAncestorContainer)
						, nodes = parent ? [parent] : editor.dom.select(selector, range.commonAncestorContainer);
					tinymce.each(nodes, function(node) {
						node.outerHTML = editor.dom.getAttrib(node, attrData) || node.textContent || node.innerText;
					});
					selection.moveToBookmark(bookmark);
				}
			}
			, cleanup = function(e) {
				var html = editor.getBody().innerHTML;
				var div = document.createElement('div');
				div.innerHTML = html;

				var emptyNode = div.querySelectorAll('#MathJax_Hidden,#MathJax_Message,#MathJax_Font_Test')
					, nodes = div.querySelectorAll('span.asciimath4-root-node');

				tinymce.each(emptyNode, function(node) {
					var parent = node.parentNode;

					// already at highlevel dom element
					if(parent.parentNode == null) {
						parent.removeChild(node);
					}
					else {
						parent.parentNode.removeChild(parent);
					}
				});
				tinymce.each(nodes, function(node) {
					node.outerHTML = '`' + node.getAttribute(attrData) + '`';
				});
				if (e.format === 'text') {
					e.content = div.innerText || div.textContent;
				} else {
					e.content = div.innerHTML;
				}

				return e.content;
			}
			, enableEdit = function(node) {
				var value = editor.dom.getAttrib(node, attrData);
				if (value) {
					node.innerHTML = value;
					editor.dom.setAttrib(node, attrData, '');
					editor.selection.setCursorLocation(node.firstChild, 0);
					editor.nodeChanged();
				}
			}
			, renderMath = function(nodes) {
				var i, win = editor.getWin(), MathJax = win.MathJax
					, args = new win.Array('Typeset', MathJax.Hub, editor.getDoc());
				for (i in nodes) {
					editor.dom.setAttrib(nodes[i], attrData, nodes[i].innerHTML);
					nodes[i].innerHTML = '`' + nodes[i].innerHTML + '`';
				}
				MathJax.Hub.Queue(args);
			}
			, getRootNode = function(node) {
				if (editor.dom.is(node, selector)) {
					return node;
				}
				return editor.dom.getParent(node, selector);
			}
			, changeNode = function(event) {
				var node = getRootNode(event.element)
					, state = editor.dom.getAttrib(node, attrState);
				if (state !== '1') {
					var nodes = editor.dom.select(selector + '[' + attrState + '=1]');
					if (nodes.length) {
						editor.dom.setAttrib(nodes, attrState, '');
						editor.dom.removeClass(nodes, 'active');
						renderMath(nodes);
					}
					if (node) {
						editor.dom.setAttrib(node, attrState, 1);
						editor.dom.addClass(node, 'active');
						enableEdit(node);
					}
				}
			}
			, createNode = function(formula) {
				var span = editor.dom.createHTML('span', {class: className}, formula);
				editor.insertContent(editor.dom.createHTML('p', {}, span));
			}
			, getAbout = function() {
				var link = editor.getParam(name + '_syntax', 'http://asciimath.org/#syntax')
					, text = tinymce.i18n.translate('AsciiMath syntax') + ': ';
				text += ('<a href="%s" target="_blank">%s</a>').replace(/%s/g, link);
				return '<p>' + text + '</p>';
			}
			, command = function() {
				var popup, node = getRootNode(editor.selection.getNode()), formula
					, id = name + '-preview', previewStyle = 'height: 80px; border: 1px #ccc solid;'
					, preview = editor.dom.createHTML('div', {id: id, style: previewStyle}, '``')
					, previewNode, hub = MathJax.Hub, previewFormula = function() {
					hub.Queue(['Text', previewNode, popup.find('#' + name).value()]);
				};
				if (node) {
					formula = node.textContent || node.innerText;
				} else {
					formula = editor.selection.getContent({format: 'text'});
				}
				popup = editor.windowManager.open({
					title: 'Insert formula'
					,   body: [
						{type: 'label', text: 'AsciiMath formula'}
						,   {type: 'textbox', name: name, size: 60, value: formula}
						,   {type: 'label', text: 'Preview'}
						,   {type: 'container', html: preview, layout: 'flow'}
						,   {type: 'spacer'}
						,   {type: 'container', html: getAbout()}
					]
					,   onSubmit: function(e) {
						if (node) {
							node.innerHTML = e.data[name];
						} else {
							createNode(e.data[name]);
						}
					}
					,   onPostRender: function() {
						hub.Queue(['Typeset', hub, editor.dom.select('#' + id, this.getEl())]);
						hub.Queue(function(){
							previewNode = hub.getAllJax(id)[0];
						}, previewFormula);
					}
					,   onChange: previewFormula
					,   onKeyup: previewFormula
				});
			}
			, overwritePreview = function() {
				editor.addCommand('mcePreview', function() {
					editor.windowManager.open({
						title: 'Preview',
						width : parseInt(editor.getParam("plugin_preview_width", "650"), 10),
						height : parseInt(editor.getParam("plugin_preview_height", "500"), 10),
						html: '<iframe src="javascript:\'\'" frameborder="0"></iframe>',
						buttons: {
							text: 'Close',
							onclick: function() {
								this.parent().parent().close();
							}
						},
						onPostRender: function() {
							var win = this.getEl('body').firstChild.contentWindow
								, doc = win.document, previewHtml, headHtml = ''
								, base = editor.documentBaseURI.getURI();
							if (base) {
								headHtml += '<base href="' + base + '">';
							}

							tinymce.each(editor.contentCSS, function(url) {
								headHtml += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '">';
							});

							var bodyId = editor.settings.body_id || 'tinymce';
							if (bodyId.indexOf('=') > -1) {
								bodyId = editor.getParam('body_id', '', 'hash');
								bodyId = bodyId[editor.id] || bodyId;
							}

							var bodyClass = editor.settings.body_class || '';
							if (bodyClass.indexOf('=') > -1) {
								bodyClass = editor.getParam('body_class', '', 'hash');
								bodyClass = bodyClass[editor.id] || '';
							}

							previewHtml = (
								'<!DOCTYPE html>' +
								'<html>' +
								'<head>' +
								headHtml +
								'</head>' +
								'<body id="' + bodyId + '" class="mce-content-body ' + bodyClass + '">' +
								editor.getContent() +
								'</body>' +
								'</html>'
							);

							doc.open();
							doc.write(previewHtml);
							doc.close();
							loadMathjaxOn(win);
						}
					});
				});
			}
			;

		editor.addCommand(name + '_main', command);

		editor.addButton(name, {
			text: '\u03A3'
			,   tooltip: 'Formula'
			,   cmd: name + '_main'
			,   stateSelector: selector
		});

		editor.addMenuItem(name, {
			text: 'Formula'
			,   context: 'insert'
			,   cmd: name + '_main'
		});

		editor.on('init', init);

	});

})();
