'use strict';
const media = {
  remind: {
    camera: {src: 'https://remind-applied.github.io/assets/videos/state/camera-pan/01.mp4?v=ba80d41', label: 'ReMind camera motion demonstration', caption: 'Hidden world state continues evolving as the camera moves away and returns.'},
    occlusion: {src: 'https://remind-applied.github.io/assets/videos/state/occlusion/01.mp4?v=ba80d41', label: 'ReMind occlusion demonstration', caption: 'Events continue behind an occluder and return with a coherent, evolved state.'}
  },
  motion: {
    driving: {src: 'https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/more_driving_scene1--ours-right-cut-in.mp4', poster: 'https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/more_driving_scene1--ours-right-cut-in.webp', label: 'Motion Forcing driving demonstration', caption: 'Control other-agent motion for physically coherent driving scenes.'},
    ego: {src: 'https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/driving_ego_action--ours-right.mp4', poster: 'https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/driving_ego_action--ours-right.png', label: 'Motion Forcing ego control demonstration', caption: 'Steer camera motion independently of other objects in the driving scene.'},
    robot: {src: 'https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/embodied_ai--case1--action1.mp4', poster: 'https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/embodied_ai--case1--action1.png', label: 'Motion Forcing robotic manipulation demonstration', caption: 'Transfer controllable generation to robotic-arm manipulation.'}
  }
};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = Boolean(navigator.connection?.saveData);
function loadVideo(video, autoplay = false) {
  if (!video.getAttribute('src') && video.dataset.src) { video.src = video.dataset.src; video.load(); }
  if (autoplay && !reducedMotion && !saveData) video.play().catch(() => {});
}
document.querySelectorAll('.project').forEach(project => {
  const video = project.querySelector('video');
  const error = project.querySelector('.video-error');
  video.addEventListener('error', () => { error.hidden = false; });
  video.addEventListener('loadeddata', () => { error.hidden = true; });
  project.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
    const demo = media[project.dataset.project][button.dataset.demo];
    project.querySelectorAll('[data-demo]').forEach(tab => { tab.classList.toggle('selected', tab === button); tab.setAttribute('aria-pressed', String(tab === button)); });
    video.pause(); video.removeAttribute('src'); video.dataset.src = demo.src;
    if (demo.poster) video.poster = demo.poster; else video.removeAttribute('poster');
    video.setAttribute('aria-label', demo.label); error.hidden = true;
    project.querySelector('.demo-caption').textContent = demo.caption;
    loadVideo(video, true);
  }));
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) loadVideo(entry.target, true); else entry.target.pause();
  }), {threshold: 0.2});
  document.querySelectorAll('video').forEach(video => observer.observe(video));
} else document.querySelectorAll('video').forEach(video => loadVideo(video));
document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause()); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(filter => { filter.classList.toggle('selected', filter === button); filter.setAttribute('aria-pressed', String(filter === button)); });
  let count = 0;
  document.querySelectorAll('.publication').forEach(publication => {
    const show = button.dataset.filter === 'all' || publication.dataset.topics.split(' ').includes(button.dataset.filter);
    publication.hidden = !show; if (show) count++;
  });
  document.querySelector('.filter-status').textContent = `${count} publications shown`;
}));
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = navigation.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
