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

(function () {
  'use strict';

  // 4. Dark mode toggle
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    var html = document.documentElement;
    var saved = localStorage.getItem('theme');

    function setTheme(theme, store) {
      html.dataset.theme = theme;
      toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      if (store !== false) localStorage.setItem('theme', theme);
    }

    if (saved) {
      setTheme(saved, false);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      toggle.innerHTML = '☀️';
    }

    toggle.addEventListener('click', function () {
      var current = html.dataset.theme;
      if (!current && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('light');
      } else {
        setTheme(current === 'dark' ? 'light' : 'dark');
      }
    });
  }
})();

(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results) return;

  var posts = [];
  var selectedIdx = -1;

  function render(items) {
    if (!items.length) {
      results.innerHTML = '<li class="search-results--empty">未找到相关文章</li>';
      return;
    }
    results.innerHTML = items.map(function (item, i) {
      return '<li class="search-results__item' + (i === selectedIdx ? ' is-selected' : '') + '">' +
        '<a href="' + item.url + '" class="search-results__link">' + item.title + '</a>' +
        '<div class="search-results__meta">' + item.date + '</div>' +
        '</li>';
    }).join('');
  }

  function search(q) {
    var lower = q.toLowerCase();
    return posts.filter(function (p) {
      return p.title.toLowerCase().indexOf(lower) !== -1 ||
             (p.excerpt && p.excerpt.toLowerCase().indexOf(lower) !== -1) ||
             (p.categories && p.categories.join(' ').toLowerCase().indexOf(lower) !== -1);
    });
  }

  function doSearch(q) {
    selectedIdx = -1;
    if (!q.trim()) { results.innerHTML = ''; return; }
    render(search(q));
  }

  fetch('/search.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { posts = data; })
    .catch(function () { posts = []; });

  input.addEventListener('input', function () {
    doSearch(this.value);
  });

  input.addEventListener('keydown', function (e) {
    var items = results.querySelectorAll('.search-results__item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      render(search(this.value));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      render(search(this.value));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var target = selectedIdx >= 0 ? items[selectedIdx] : items[0];
      if (target) {
        var link = target.querySelector('a');
        if (link) window.location.href = link.href;
      }
    }
  });

  document.addEventListener('click', function (e) {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.innerHTML = '';
    }
  });
})();
