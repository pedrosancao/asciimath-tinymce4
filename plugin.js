/**
 * AsciiMath plugin for TinyMCE 4
 * 
 * @author   Pedro Sanção <pedro at sancao dot co>
 * @license  GNU GPL v 2, see LICENCE
 * @version  Alpha 1.0
 */

tinymce.PluginManager.add('asciimath4', function(editor) {
    var name = 'asciimath4', nodeName = name + '-root-node'
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
        editor.selection.selectorChanged('span.' + nodeName, restoreNode);
    }
    , prepareNodes = function() {
        var replace = '<span class="' + nodeName + '" data-' + name + '="$2">$1</span>';
        editor.setContent(editor.getContent().replace(/(`([^`]*?)`)/g, replace));
    }
    , restoreNode = function(state, data) {
        if (state && data.node) {
            var value = editor.dom.getAttrib(data.node, 'data-' + name)
            , node = editor.getDoc().createTextNode('`' + value + '`');
            editor.dom.replace(node, data.node);
            editor.selection.setCursorLocation(node, 1);
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
    ,   stateSelector: 'span.MathJax'
    });

    editor.addMenuItem(name, {
        text: 'Formula',
        context: 'insert',
        cmd: name + '_main'
    });

    editor.on('init', init);

});
