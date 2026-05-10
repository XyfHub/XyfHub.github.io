(function () {
  'use strict';

  // 1. Back-to-top button
  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', '返回顶部');
  btn.innerHTML = '&#8593;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    btn.classList.toggle('is-visible', window.pageYOffset > 300);
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2. Article TOC (h2/h3 scroll-spy)
  var tocContainer = document.getElementById('article-toc');
  var articleBody = document.querySelector('.article-body');
  if (tocContainer && articleBody) {
    var headings = articleBody.querySelectorAll('h2, h3');
    if (headings.length) {
      headings.forEach(function (el, i) {
        if (!el.id) el.id = 'heading-' + i + '-' + Math.random().toString(36).slice(2, 8);
        var a = document.createElement('a');
        a.href = '#' + el.id;
        a.textContent = el.textContent.trim();
        a.className = 'toc-nav__link toc-nav__link--' + el.tagName.toLowerCase();
        a.addEventListener('click', function (e) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + el.id);
        });
        tocContainer.appendChild(a);
      });

      var links = tocContainer.querySelectorAll('a');
      if (links.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = entry.target.id;
            links.forEach(function (link) {
              link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
          });
        }, { rootMargin: '-10% 0px -60% 0px', threshold: 0 });
        headings.forEach(function (h) { observer.observe(h); });
      }
    }
  }

  // 3. Fade-in on scroll
  var fadeNodes = document.querySelectorAll('.fade-in');
  if (fadeNodes.length && 'IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    fadeNodes.forEach(function (n) { fadeObserver.observe(n); });
  }
})();
