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
    , changeNode = function(event) {
        var node = (function() {
            if (editor.dom.is(event.element, selector)) {
                return event.element;
            }
            return editor.dom.getParent(event.element, selector);
        })()
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
    ;

    editor.addCommand(name + '_main', function() {
        // @todo implement
    });

    editor.addButton(name, {
        text: '\u03A3',
        tooltip: 'Formula',
        cmd: name + '_main'
    ,   stateSelector: selector
    });

    editor.addMenuItem(name, {
        text: 'Formula',
        context: 'insert',
        cmd: name + '_main'
    });

    editor.on('init', init);

});
