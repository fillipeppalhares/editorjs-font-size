![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Font Size Tool
Inline tool for changing the font size of text fragments in [Editor.js](https://github.com/codex-team/editor.js)

![](editorjs-fontsize.gif)

## Installation

### Install via NPM or Yarn

Get the package

```shell
npm install @fillipeppalhares/editorjs-font-size
```

```shell
yarn add @fillipeppalhares/editorjs-font-size
```

Include module at your application

```javascript
import FontSize from '@fillipeppalhares/editorjs-font-size';
```

### Download to your project's source dir

1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
import EditorJs from '@editorjs/editorjs';
import FontSize from '@fillipeppalhares/editorjs-font-size';

var editor = new EditorJS({
  // ...
  tools: {
    // ...
    fontSize: FontSize
  },
});
```

## Config Params

This Tool has no config params

## Output data

Selected text will be wrapped with a `span` tag with an `cdx-font-size` class and an inline `font-size` style set to the chosen value.

```json
{
    "type" : "text",
    "data" : {
        "text" : "Create a directory for your module, enter it and run <span class=\"cdx-font-size\" style=\"font-size: 24px;\">npm init</span> command."
    }
}
```
