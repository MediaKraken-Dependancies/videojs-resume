'use strict';

let videojs = require('video.js');
let store = require('store');
let Button = videojs.getComponent('Button');
let Component = videojs.getComponent('Component');
let ModalDialog = videojs.getComponent('ModalDialog');

class ResumeButton extends Button {

  constructor(player, options) {
    super(player, options);
    this.resumeFromTime = options.resumeFromTime
  }

  buildCSSClass() {
    return 'vjs-resume';
  }

  createEl() {
    return super.createEl('button', {
      innerHTML: `${this.options_.buttonText}`
    });
  }

  handleClick() {
    this.player_.resumeModal.close();
    this.player_.currentTime(this.resumeFromTime);
    this.player_.play();
  }
}
ResumeButton.prototype.controlText_ = 'Resume';

class ResumeCancelButton extends Button {

  constructor(player, options) {
    super(player, options);
  }

  buildCSSClass() {
    return 'vjs-no-resume';
  }

  createEl() {
    return super.createEl('button', {
      innerHTML: `${this.options_.buttonText}`
    });
  }

  handleClick() {
    this.player_.resumeModal.close();
  }
}
ResumeButton.prototype.controlText_ = 'No Thanks';

class ModalButtons extends Component {

  constructor(player, options) {
    super(player, options);
    this.addChild('ResumeButton', {
      buttonText: options.resumeButtonText,
      resumeFromTime: options.resumeFromTime
    });
    this.addChild('ResumeCancelButton', {
      buttonText: options.cancelButtonText,
    });
  }

  createEl() {
    return super.createEl('div', {
      className: 'vjs-resume-modal-buttons',
      innerHTML: `
        <p>${this.options_.title}</p>
      `
    });
  }
}

class ResumeModal extends ModalDialog {

  constructor(player, options) {
    super(player, options);
    this.player_.resumeModal = this;
    this.open();
    this.addChild('ModalButtons', {
      title: options.title,
      resumeButtonText: options.resumeButtonText,
      cancelButtonText: options.cancelButtonText,
      resumeFromTime: options.resumeFromTime
    });
  }

  buildCSSClass() {
    return `vjs-resume-modal ${super.buildCSSClass()}`;
  }
}
videojs.registerComponent('ResumeButton', ResumeButton);
videojs.registerComponent('ResumeCancelButton', ResumeCancelButton);
videojs.registerComponent('ModalButtons', ModalButtons);
videojs.registerComponent('ResumeModal', ResumeModal);

let Resume = function(options) {

  if (!store) return console.error('store.js is not available');
  if (!store.enabled) return console.error('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');

  let player = this;
  let videoId = options.uuid;
  let title = options.title || 'Resume from where you left off?';
  let resumeButtonText = options.resumeButtonText || 'Resume';
  let cancelButtonText = options.cancelButtonText || 'No Thanks';
  let playbackOffset = options.playbackOffset || 0;
  let key = 'videojs-resume:' + videoId;

  player.on('timeupdate', function() {
    store.set(key, player.currentTime());
  });

  player.on('ended', function() {
    store.remove(key);
  });


  player.ready(function() {
    let resumeFromTime = store.get(key);

    if (resumeFromTime) {
      if (resumeFromTime >= 5) resumeFromTime -= playbackOffset;
      if (resumeFromTime <= 0) resumeFromTime = 0;
      player.addChild('ResumeModal', {
        title: title,
        resumeButtonText: resumeButtonText,
        cancelButtonText: cancelButtonText,
        resumeFromTime: resumeFromTime
      });
    }
  });
};

videojs.plugin('Resume', Resume);
