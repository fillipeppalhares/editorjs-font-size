/**
 * Build styles
 */
import './index.css';
import {IconChevronLeft, IconChevronRight, 	IconText, IconBracketsVertical} from '@codexteam/icons'
import {type API, type InlineTool, type SanitizerConfig} from "@editorjs/editorjs";
import {type InlineToolConstructorOptions} from "@editorjs/editorjs/types/tools/inline-tool";

/**
 * FontSize Tool for the Editor.js
 *
 * Allows to wrap inline fragment and style it somehow.
 */
export default class FontSize implements InlineTool {
  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS(): string {
    return 'cdx-font-size';
  };

  /**
   * Toolbar Button
   *
   * @type {HTMLButtonElement}
   */
  private button: HTMLButtonElement | undefined

  /**
   * size picker wrapper
   *
   * @type {HTMLDivElement}
   */
  private sizePickerWrapper: HTMLDivElement | undefined

  /**
   * size picker input
   *
   * @type {HTMLInputElement}
   */
  private sizePicker: HTMLInputElement | undefined

  /**
   * Tag represented the term
   *
   * @type {string}
   */
  private tag: string = 'SPAN';

  /**
   * API InlineToolConstructorOptions
   *
   * @type {API}
   */
  private api: API

  /**
   * State
   *
   * @type {boolean}
   */
  private state: boolean | undefined

  /**
   * CSS classes
   *
   * @type {object}
   */
  private iconClasses: {base: string, active: string}

  /**
   * @param options InlineToolConstructorOptions
   */
  public constructor(options: InlineToolConstructorOptions) {
    this.api = options.api;

    /**
     * CSS classes
     */
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    };
  }

  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @returns {boolean}
   */
  public static isInline = true;

  /**
   * Create button element for Toolbar
   *
   * @returns {HTMLElement}
   */
  public render(): HTMLElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = this.toolboxIcon;

    return this.button;
  }

  /**
   * Create input element for Toolbar
   *
   * @returns {HTMLElement}
   */
  public renderActions(): HTMLElement {
    if (!this.sizePickerWrapper) {
      this.sizePickerWrapper = document.createElement('div');
      this.sizePickerWrapper.id = 'editorjs-font-size-picker-wrapper';

      this.sizePickerWrapper.appendChild(this.datalist());
      this.sizePickerWrapper.appendChild(this.decrementButton());
      this.sizePickerWrapper.appendChild(this.sizePickerInput());
      this.sizePickerWrapper.appendChild(this.incrementButton());
    }

    return this.sizePickerWrapper;
  }

  /**
   * datalist element
   *
   * @returns {HTMLDataListElement}
   */
  public datalist(): HTMLDataListElement {
    const datalist = document.createElement('datalist');
    datalist.id = 'font-size-list';

    ['8', '9', '10', '11', '12', '14', '16', '18', '24', '30', '36', '48', '60', '72', '96'].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      datalist.appendChild(option);
    })

    return datalist;
  }

  /**
   * size picker input
   *
   * @returns {HTMLInputElement}
   */
  public sizePickerInput(): HTMLInputElement {
    this.sizePicker = document.createElement('input');
    this.sizePicker.id = 'editorjs-font-size-picker';
    this.sizePicker.type = 'number';
    this.sizePicker.step = '1';
    this.sizePicker.setAttribute('list', 'font-size-list');

    return this.sizePicker;
  }

  /**
   * decrement button
   *
   * @returns {HTMLButtonElement}
   */
  public decrementButton(): HTMLButtonElement {
    const decrementButton = document.createElement('button');
    decrementButton.type = 'button';
    decrementButton.classList.add('cdx-settings-button');
    decrementButton.innerHTML = this.decrementButtonIcon;

    decrementButton.onclick = () => {
      this.sizePicker!.stepDown();
      this.sizePicker!.dispatchEvent(new Event('input'));
    }

    return decrementButton;
  }

  /**
   * increment button
   *
   * @returns {HTMLButtonElement}
   */
  public incrementButton(): HTMLButtonElement {
    const incrementButton = document.createElement('button');
    incrementButton.type = 'button';
    incrementButton.classList.add('cdx-settings-button');
    incrementButton.innerHTML = this.incrementButtonIcon;

    incrementButton.onclick = () => {
      this.sizePicker!.stepUp();
      this.sizePicker!.dispatchEvent(new Event('input'));
    }

    return incrementButton;
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   */
  public surround(range: Range): void {
    if (!range) {
      return;
    }

    const termWrapper = this.api.selection.findParentTag(this.tag, FontSize.CSS);

    /**
     * If start or end of selection is in the highlighted block
     */
    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(range);
    }
  }

  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  public wrap(range: Range) {
    /**
     * Create a wrapper for highlighting
     */
    const span = document.createElement(this.tag);

    span.classList.add(FontSize.CSS);

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    span.appendChild(range.extractContents());
    range.insertNode(span);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(span);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  public unwrap(termWrapper: HTMLElement): void {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    const sel = window.getSelection();
    if (!sel) {
      return;
    }
    const range = sel.getRangeAt(0);
    if (!range) {
      return
    }

    const unwrappedContent = range.extractContents();
    if (!unwrappedContent) {
      return
    }

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode?.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Shows input element
   *
   * @returns {void}
   */
  public showActions(span: HTMLElement | null): void {
    if (this.sizePicker && span) {
      this.sizePicker.oninput = () => {
        span.style.fontSize = this.sizePicker?.value + 'px';
      }

      this.sizePicker.setAttribute('value', span.style.fontSize.replace('px', '') || '16');
      this.sizePicker.focus();
    }
  }

  /**
   * Hides input element
   *
   * @returns {void}
   */
  public hideActions(): void {
    if (this.sizePicker) {
      this.sizePicker.onchange = null;
    }
  }

  /**
   * Check and change Term's state for current selection
   */
  public checkState(selection: Selection): boolean {
    const termTag = this.api.selection.findParentTag(this.tag, FontSize.CSS);

    this.state = !!termTag;

    if (this.state) {
      this.showActions(termTag);
    } else {
      this.hideActions();
    }

    if (this.button) {
      this.button.classList.toggle(this.iconClasses.active, this.state);
    }

    return this.state;
  }

  /**
   * Get Tool icon's SVG
   *
   * @returns {string}
   */
  public get toolboxIcon(): string {
    return	IconText + IconBracketsVertical;
  }

  /**
   * Get decrement button icon's SVG
   *
   * @returns {string}
   */
  public get decrementButtonIcon(): string {
    return IconChevronLeft;
  }

  /**
   * Get increment button icon's SVG
   *
   * @returns {string}
   */
  public get incrementButtonIcon(): string {
    return IconChevronRight;
  }

  /**
   * Sanitizer rule
   *
   * @returns {{span: {class: string}}}
   */
  public static get sanitize(): SanitizerConfig {
    return {
      span: {
        class: FontSize.CSS,
      },
    };
  }
}
