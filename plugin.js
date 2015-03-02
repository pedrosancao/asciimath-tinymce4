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

tinymce.PluginManager.add('asciimath4', function(editor) {
    var name = 'asciimath4', className = name + '-root-node', selector = 'span.' + className
    , attrData = 'data-' + name, attrState = attrData + '-state'
    , popup
    , init = function(ev) {
        var editor = ev.target;
        prepareNodes();
        loadMathjaxOn(editor.getWin());
        editor.on('NodeChange', changeNode);
		addHighlightStyle();
    }
	, addHighlightStyle = function() {
		var settings = editor.settings
		, bgSetting = name + '_highlight_bg'
		, borderSetting = name + '_highlight_border'
		, background = settings[bgSetting] ? settings[bgSetting] : '#ffc'
		, border = settings[borderSetting] ? settings[borderSetting] : '#fcc'
		, style = 'background: ' + background + '; border: 1px ' + border + ' solid; padding: 5px;';
		editor.dom.addStyle(selector +'.active{' + style + '}');
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
        var settings = editor.settings, config = name + '_syntax'
        , link = settings[config] ? editor.settings.asciimath4_syntax : 'http://asciimath.org/#syntax'
        , text = editor.translate('Ascii syntax') + ': ';
        text += ('<a href="%s">%s</a>').replace(/%s/g, link);
        return '<p>' + text + '</p>';
    }
    ;

    editor.addCommand(name + '_main', function() {
        var node = getRootNode(editor.selection.getNode()), formula
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
                {type: 'label', text: 'AsciiMath Formula'}
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
		,   onchange: previewFormula
		,   onkeyup: previewFormula
        });
        hub.Queue(['Typeset', hub, editor.dom.select('#' + id, popup.getEl())]);
        hub.Queue(function(){
			previewNode = hub.getAllJax(id)[0];
		}, previewFormula);
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

})();
