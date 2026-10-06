'use strict';
const motionDemos = {
  driving: {src: 'assets/demos/motion-driving.mp4', poster: 'assets/demos/motion-driving.jpg', label: 'Motion Forcing: driving control inputs above two synchronized generated videos', caption: 'Compare left cut-in + braking with right cut-in. Control inputs stay visible above synchronized results.'},
  ego: {src: 'assets/demos/motion-ego.mp4', poster: 'assets/demos/motion-ego.jpg', label: 'Motion Forcing: left and right ego-motion controls above synchronized generated videos', caption: 'Same initial scene, left versus right ego motion. The requested trajectory and generated motion are shown together.'},
  robot: {src: 'assets/demos/motion-robot.mp4', poster: 'assets/demos/motion-robot.jpg', label: 'Motion Forcing: two robotic manipulation controls above synchronized generated videos', caption: 'Same robotic scene, two action controls. Compare each control arrow with its generated manipulation.'}
};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = Boolean(navigator.connection?.saveData);
function loadVideo(video, autoplay = false) {
  if (!video.getAttribute('src') && video.dataset.src) { video.src = video.dataset.src; video.load(); }
  if (autoplay && !reducedMotion && !saveData) video.play().catch(() => {});
}
function selectButton(buttons, selected) {
  buttons.forEach(button => { button.classList.toggle('selected', button === selected); button.setAttribute('aria-pressed', String(button === selected)); });
}
document.querySelectorAll('.project').forEach(project => {
  const video = project.querySelector('video');
  const error = project.querySelector('.video-error');
  video.addEventListener('error', () => { error.hidden = false; });
  video.addEventListener('loadeddata', () => { error.hidden = true; });
  const demoButtons = project.querySelectorAll('[data-demo]');
  demoButtons.forEach(button => button.addEventListener('click', () => {
    const demo = motionDemos[button.dataset.demo];
    selectButton(demoButtons, button);
    video.pause(); video.removeAttribute('src'); video.dataset.src = demo.src;
    video.poster = demo.poster;
    video.setAttribute('aria-label', demo.label); error.hidden = true;
    project.querySelector('.demo-caption').textContent = demo.caption;
    loadVideo(video);
    video.play().catch(() => {});
  }));
  const chapters = project.querySelectorAll('[data-chapter]');
  if (chapters.length) {
    let pendingSeek = null;
    let fullReel = true;
    function applySeek() {
      if (pendingSeek === null || video.readyState < 1) return;
      video.currentTime = Math.min(pendingSeek, video.duration);
      pendingSeek = null;
      video.play().catch(() => {});
    }
    video.addEventListener('loadedmetadata', applySeek);
    chapters.forEach(button => button.addEventListener('click', () => {
      fullReel = button.dataset.chapter === 'overview';
      selectButton(chapters, button);
      pendingSeek = Number(button.dataset.start);
      loadVideo(video);
      applySeek();
    }));
    video.addEventListener('timeupdate', () => {
      if (fullReel) return;
      const chapter = video.currentTime < Number(chapters[2].dataset.start) ? chapters[1] : chapters[2];
      selectButton(chapters, chapter);
    });
  }
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

// Decode the contact address only after a visitor clicks the email button.
document.querySelector('#email-contact').addEventListener('click', () => {
  const address = atob('dHh1NjQ3QGNvbm5lY3QuaGt1c3QtZ3ouZWR1LmNu');
  window.location.href = 'mailto:' + address;
});
