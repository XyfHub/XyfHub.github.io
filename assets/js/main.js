// 返回顶部按钮
const backToTopButton = document.createElement('a');
backToTopButton.href = '#';
backToTopButton.className = 'back-to-top';
backToTopButton.setAttribute('aria-label', '返回顶部');
backToTopButton.innerHTML = '↑';
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', function () {
  if (window.pageYOffset > 300) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
});

backToTopButton.addEventListener('click', function (e) {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// 文章目录：从正文 h2/h3 生成，并滚动联动高亮
(function initArticleToc() {
  const container = document.getElementById('article-toc');
  const articleBody = document.querySelector('.article-body');
  if (!container || !articleBody) return;

  const headings = articleBody.querySelectorAll('h2, h3');
  if (!headings.length) {
    container.closest('.sidebar-toc').classList.add('sidebar-toc--empty');
    return;
  }

  const frag = document.createDocumentFragment();
  headings.forEach(function (el, index) {
    if (!el.id) {
      el.id = 'heading-' + index + '-' + Math.random().toString(36).slice(2, 8);
    }
    const a = document.createElement('a');
    a.href = '#' + el.id;
    a.textContent = el.textContent.trim();
    a.className = 'toc-nav__link toc-nav__link--' + el.tagName.toLowerCase();
    a.addEventListener('click', function (e) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + el.id);
    });
    frag.appendChild(a);
  });
  container.appendChild(frag);

  const links = container.querySelectorAll('a');
  if (!('IntersectionObserver' in window) || !links.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    }
  );

  headings.forEach(function (h) {
    observer.observe(h);
  });
})();

// 首屏与卡片进入视口时的轻微显现（避免与 CSS hover 冲突，不用内联改 transform）
(function initReveal() {
  const nodes = document.querySelectorAll('.fade-in-up, .article-card, .sidebar');
  if (!nodes.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  nodes.forEach(function (n) {
    io.observe(n);
  });
})();
