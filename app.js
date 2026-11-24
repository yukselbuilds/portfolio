'use strict';

const showcase = document.querySelector('.showcase');
const title = document.querySelector('#showcase-title');
const image = document.querySelector('#showcase-image');
const video = document.querySelector('#showcase-video');
const closeButton = showcase.querySelector('.close-button');
const mediaError = showcase.querySelector('.media-error');
const fallbackLink = mediaError.querySelector('a');
let openedBy = null;

function openShowcase(event) {
  if (
    event.defaultPrevented || event.button !== 0 ||
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
  ) return;

  event.preventDefault();
  const link = event.currentTarget;
  const playingVideo = link.hasAttribute('data-video');
  openedBy = link;

  showcase.classList.toggle('is-video', playingVideo);
  showcase.classList.toggle('is-portrait', link.hasAttribute('data-portrait'));
  image.hidden = playingVideo;
  video.hidden = !playingVideo;
  mediaError.hidden = true;

  if (playingVideo) {
    title.textContent = link.dataset.video;
    video.poster = link.dataset.poster;
    fallbackLink.href = link.href;
    const captions = document.createElement('track');
    captions.kind = 'captions';
    captions.src = link.dataset.track;
    captions.srclang = link.dataset.language;
    captions.label = link.dataset.trackLabel;
    captions.default = true;
    video.append(captions);
    video.src = link.href;
  } else {
    title.textContent = link.dataset.image;
    image.alt = link.querySelector('img')?.alt || link.dataset.image;
    image.src = link.href;
  }

  showcase.showModal();
  closeButton.focus();
  if (playingVideo) video.play().catch(() => {});
}

if (typeof showcase.showModal === 'function') {
  for (const link of document.querySelectorAll('[data-image], [data-video]')) {
    link.addEventListener('click', openShowcase);
  }

  for (const archive of document.querySelectorAll('details')) {
    archive.addEventListener('toggle', () => {
      if (!archive.open && showcase.open && archive.contains(openedBy)) showcase.close();
    });
  }
}

video.addEventListener('error', () => {
  if (!video.hidden && showcase.open) mediaError.hidden = false;
});

showcase.addEventListener('click', (event) => {
  if (event.target !== showcase) return;
  const { left, right, top, bottom } = showcase.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
    showcase.close();
  }
});

showcase.addEventListener('close', () => {
  if (video.hasAttribute('src')) {
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.replaceChildren();
    video.load();
  }
  image.removeAttribute('src');
  if (openedBy?.getClientRects().length) {
    openedBy.focus({ preventScroll: true });
  } else {
    openedBy?.closest('details')?.querySelector('summary').focus({ preventScroll: true });
  }
  openedBy = null;
});
