/**
 * AsciiMath plugin for TinyMCE 4
 * 
 * @author   Pedro Sanção <dev at sancao dot co>
 * @license  GNU GPL v 2, see LICENCE
 * @version  Alpha 1.0
 */

tinymce.PluginManager.add('asciimath4', function(editor) {
    var name = 'asciimath4', className = name + '-root-node', selector = 'span.' + className
    , attrData = 'data-' + name, attrState = attrData + '-state'
	, popup
    , init = function(ev) {
        var editor = ev.target
        , win = editor.getWin()
        , doc = editor.getDoc()
        , script = doc.createElement('script');
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
        prepareNodes();
        doc.getElementsByTagName('head')[0].appendChild(script);
        editor.on('NodeChange', changeNode);
    }
    , prepareNodes = function() {
        var replace = '<span class="' + className + '" ' + attrData + '="$2">$1</span>';
        editor.setContent(editor.getContent().replace(/(`([^`]*?)`)/g, replace));
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
                renderMath(nodes);
            }
            if (node) {
                editor.dom.setAttrib(node, attrState, 1);
                enableEdit(node);
            }
        }
    }
	, createNode = function(formula) {
		editor.insertContent(editor.dom.createHTML('span', {class: className}, formula));
	}
    ;

    editor.addCommand(name + '_main', function() {
		var node = getRootNode(editor.selection.getNode())
		, formula;
		if (node) {
			formula = node.textContent || node.innerText;
		} else {
			// get text from selection
		}
		popup = editor.windowManager.open({
			title: 'Insert formula'
		,	body: [
				{
					type: 'textbox'
				,   name: 'asciimath'
				,   label: 'AsciiFormula'
				,   size: 60
				,   value: formula
				}
			]
		,   onSubmit: function(e) {
				if (node) {
					node.innerHTML = e.data.asciimath;
				} else {
					createNode(e.data.asciimath);
				}
			}
		});
    });

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
