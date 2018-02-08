# AsciiMath plugin for TinyMCE 4

A plugin for TinyMCE 4 which enables user to input and preview mathematical expressions with AsciiMath markup language.

There is a [very good plugin for TinyMCE 3](http://www.imathas.com/editordemo/demo.html), which supports even graphics, but unfortunately it was not updated for version 4 of the editor.

Please note that **this plugin is in development** (suspended D: until I have time for it).

## Demonstration

The demonstration is avaliable in https://pedrosancao.github.io/asciimath-tinymce4/demo.html.

## Usage

Download the [plugin.js](https://raw.githubusercontent.com/pedrosancao/asciimath-tinymce4/master/plugin.js) file in the following directory structure.

```
tinymce
|-- plugins
    |-- asciimath4
        |-- plugin.js
```

If you are using the minified version of TinyMCE, rename it to `plugin.min.js`.

Add the plugin and the optionally the button in the TinyMCE init:

```
tinymce.init({
  selector: 'textarea'
, plugins: 'asciimath4'
, toolbar: 'asciimath4'
});
```

### Configuration

There some parameters avaliable you can use on `tinymce.init`:

- `asciimath4_syntax` - link for the AsciiMathML syntax reference, default: `'http://asciimath.org/#syntax'`
- `asciimath4_highlight_bg` - background color for the highlight, default: `'#FFC'`
- `asciimath4_highlight_border` - border color for the highlight, default: `'#FCC'`

### Dependencies

This plugins uses [MathJax](http://www.mathjax.org/), but it automatically downloads what is needed from CDN. So don't worry about dependencies.

### License

GNU General Public Licence v2, see [LICENSE](https://raw.githubusercontent.com/pedrosancao/asciimath-tinymce4/master/LICENSE)
