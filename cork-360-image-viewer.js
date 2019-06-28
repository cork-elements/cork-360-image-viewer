import {PolymerElement, html} from "@polymer/polymer"
import template from "./cork-360-image-viewer.html"

export class Cork360ImageViewer extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      frame : {
        type : Number,
        value : 0,
        observer : 'render'
      },
      totalFrames : {
        type : Number,
        value : 1
      },
      // mouse pixels that must be moved per frame
      dragRatio : {
        type : Number,
        value : 100
      },
      spinFps : {
        type : Number,
        value : 1
      }
    }
  }

  constructor() {
    super();

    this._onWindowMouseMove = this._onWindowMouseMove.bind(this);
    this._onWindowMouseUp = this._onWindowMouseUp.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._attachEventHandlers();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachEventHandlers();
  }

  _attachEventHandlers() {
    window.addEventListener('mousemove', this._onWindowMouseMove);
    window.addEventListener('mouseup', this._onWindowMouseUp);
    this.addEventListener('mousedown', this._onMouseDown);
    this.addEventListener('mousewheel', this._onScroll);
    this.$.img.addEventListener('DOMMouseScroll', this._onScroll);
  }

  _detachEventHandlers() {
    window.removeEventListener('mousemove', this._onWindowMouseMove);
    window.removeEventListener('mouseup', this._onWindowMouseUp);
    this.removeEventListener('mousedown', this._onMouseDown);
    this.removeEventListener('mousewheel', this._onScroll);
    this.$.img.removeEventListener('DOMMouseScroll', this._onScroll);
  }

  _onWindowMouseUp() {
    this.mousedown = false;
  }

  _onMouseDown(e) {
    this.mousedown = true;
    this.startMouseEvent = e;
    this.startFrame = this.frame;
    this.stopSpin();
  }

  _onWindowMouseMove(e) {
    if( !this.mousedown ) return;
    

    let delta = e.clientX - this.startMouseEvent.clientX;
    let pxPerFrame = this.dragRatio / this.totalFrames;

    let numFramesMoved = Math.round(delta / pxPerFrame);
    this.frame = this.startFrame + numFramesMoved;
  }

  _onScroll(e) {
    if( this.mousedown ) return;
    this.stopSpin();

    let delta = e.deltaY !== undefined ? e.deltaY/10 : e.detail * 12;
    let pxPerFrame = this.dragRatio / this.totalFrames;

    let numFramesMoved = Math.round(delta / pxPerFrame);
    this.frame = this.frame + numFramesMoved;
  }

  spin() {
    this.spinTimer = setInterval(() => this.frame++, (1 / this.spinFps) * 1000);
    this.dispatchEvent(new CustomEvent('spin-start'));
  }

  stopSpin() {
    if( !this.spinTimer ) return;
    clearInterval(this.spinTimer);
    this.spinTimer = null;
    
    this.dispatchEvent(new CustomEvent('spin-stop'));
  }

  preload() {
    return new Promise((resolve, reject) => {
      let done = 0;
      function loaded() {
        done++;
        if( done !== this.totalFrames ) return;
        resolve();
      };

      for( let i = 0; i < this.totalFrames; i++ ) {
        let img = new Image();
        img.src = this.frameToImgPath(i);
        img.onload = loaded.bind(this);
        img.onerror = loaded.bind(this);
      }
    });
  }

  render() {
    let currentFrame = this.frame % this.totalFrames;
    if( currentFrame < 0 ) currentFrame = this.totalFrames + currentFrame;
    if( !this.frameToImgPath(currentFrame) ) return;
    this.$.img.src = this.frameToImgPath(currentFrame);
    this.dispatchEvent(new CustomEvent('frame-render', {detail: {frame: currentFrame}}));
  }

  frameToImgPath(frame) {
    // Implement Me!
  }

}

window.customElements.define('cork-360-image-viewer', Cork360ImageViewer);