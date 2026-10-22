/* Docsify lifecycle enhancements; no additional runtime dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var system = matchMedia('(prefers-color-scheme: dark)');
  var observer;
  var onScroll;
  var collapseState = new Map();
  var sequence = 0;
  // Docsify refreshes sidebar HTML after doneEach; delegate to survive that refresh.
  document.addEventListener('click', function (event) {
    var button = event.target.closest('.nav-disclosure');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    var list = document.getElementById(button.getAttribute('aria-controls'));
    if (!list) return;
    var open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
    collapseState.set(button.dataset.key, open);
  }, true);
  function applyTheme(mode) {
    root.dataset.mode = mode;
    root.dataset.theme = mode === 'system' ? (system.matches ? 'dark' : 'light') : mode;
  }
  var initial = 'system';
  try { initial = localStorage.getItem('knowledge-theme') || initial; } catch (_) {}
  applyTheme(['light', 'dark', 'system'].includes(initial) ? initial : 'system');
  system.addEventListener('change', function () {
    if (root.dataset.mode === 'system') applyTheme('system');
  });
  window.addEventListener('storage', function (event) {
    if (event.key !== 'knowledge-theme') return;
    var mode = ['light', 'dark', 'system'].includes(event.newValue) ? event.newValue : 'system';
    applyTheme(mode);
    var select = document.querySelector('#theme-mode');
    if (select) select.value = mode;
  });
  function installThemeControl() {
    if (document.querySelector('.theme-control')) return;
    var control = document.createElement('div');
    control.className = 'theme-control';
    control.innerHTML = '<label for="theme-mode">外观</label><select id="theme-mode" aria-label="选择外观模式"><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select>';
    document.body.appendChild(control);
    var select = control.querySelector('select');
    select.value = root.dataset.mode;
    select.addEventListener('change', function () {
      applyTheme(select.value);
      try { localStorage.setItem('knowledge-theme', select.value); } catch (_) {}
    });
  }
  function enhanceNavigation() {
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return;
    nav.setAttribute('aria-label', '知识库导航');
    nav.querySelectorAll('li').forEach(function (item) {
      var children = Array.from(item.children);
      var list = children.find(function (child) { return child.tagName === 'UL'; });
      if (!list || item.querySelector(':scope > .nav-disclosure')) return;
      item.classList.add('has-children');
      var anchor = item.querySelector(':scope > a, :scope > p > a');
      if (!anchor) {
        var label = document.createElement('span');
        label.className = 'folder-label';
        Array.from(item.childNodes).forEach(function (child) {
          if (child.nodeType === Node.TEXT_NODE || (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'P')) label.appendChild(child);
        });
        item.insertBefore(label, list);
        anchor = label;
      }
      var name = anchor.textContent.trim();
      var key = anchor.getAttribute('href') || name;
      var button = document.createElement('button');
      button.className = 'nav-disclosure';
      button.type = 'button';
      button.setAttribute('aria-label', '展开或收起 ' + name);
      list.id = 'nav-group-' + (++sequence);
      button.setAttribute('aria-controls', list.id);
      button.dataset.key = key;
      var expanded = list.querySelector('li.active') ? true : collapseState.get(key) !== false;
      button.setAttribute('aria-expanded', String(expanded));
      list.hidden = !expanded;
      item.insertBefore(button, list);
    });
    nav.querySelectorAll('li.active').forEach(function (active) {
      var parent = active.parentElement;
      while (parent && parent !== nav) {
        if (parent.tagName === 'UL' && parent.hidden) {
          parent.hidden = false;
          var button = parent.parentElement.querySelector(':scope > .nav-disclosure');
          if (button) button.setAttribute('aria-expanded', 'true');
        }
        parent = parent.parentElement;
      }
    });
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (_) { /* Permission denied: fall back to selection copying. */ }
    var field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(field);
    field.select();
    var ok = document.execCommand('copy');
    field.remove();
    if (!ok) throw new Error('copy failed');
  }
  function enhanceCode(article) {
    article.querySelectorAll('pre').forEach(function (pre) {
      var code = pre.querySelector('code');
      if (!code || pre.closest('.code-block')) return;
      var wrap = document.createElement('div');
      wrap.className = 'code-block';
      var toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';
      var language = document.createElement('span');
      var match = code.className.match(/language-([\w-]+)/);
      language.textContent = match ? match[1] : (pre.getAttribute('data-lang') || 'text');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = '复制';
      button.setAttribute('aria-label', '复制代码');
      button.setAttribute('aria-live', 'polite');
      button.addEventListener('click', async function () {
        try { await copyText(code.textContent); button.textContent = '已复制'; }
        catch (_) { button.textContent = '复制失败，请手动选择'; }
        button.focus({ preventScroll: true });
        setTimeout(function () { button.textContent = '复制'; }, 2200);
      });
      toolbar.append(language, button);
      pre.parentNode.insertBefore(wrap, pre);
      wrap.append(toolbar, pre);
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', language.textContent + ' 代码，可横向滚动');
    });
  }
  function buildToc(article) {
    if (observer) observer.disconnect();
    if (onScroll) window.removeEventListener('scroll', onScroll);
    document.querySelectorAll('.article-toc').forEach(function (old) { old.remove(); });
    var headings = Array.from(article.querySelectorAll('h2, h3'));
    var toc = document.createElement('details');
    toc.className = 'article-toc';
    toc.open = matchMedia('(min-width: 1280px)').matches;
    var summary = document.createElement('summary');
    summary.textContent = '本页目录';
    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', '本页目录');
    var links = new Map();
    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = 'section-' + index;
      var source = heading.querySelector('a.anchor');
      var link = document.createElement('a');
      link.href = source ? source.getAttribute('href') : location.hash.split('?')[0] + '?id=' + encodeURIComponent(heading.id);
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.className = 'toc-sub';
      nav.appendChild(link);
      links.set(heading, link);
    });
    if (!headings.length) {
      var empty = document.createElement('span'); empty.className = 'toc-empty'; empty.textContent = '本页暂无章节'; nav.appendChild(empty);
    }
    toc.append(summary, nav);
    article.prepend(toc);
    if (!headings.length) return;
    function updateCurrent() {
      var current = headings[0];
      headings.forEach(function (heading) { if (heading.getBoundingClientRect().top <= 120) current = heading; });
      links.forEach(function (link, heading) {
        if (heading === current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }
    observer = new IntersectionObserver(updateCurrent, { rootMargin: '-32px 0px -65% 0px', threshold: [0, 1] });
    headings.forEach(function (heading) { observer.observe(heading); });
    var scheduled = false;
    onScroll = function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () { updateCurrent(); scheduled = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateCurrent();
  }
  function themePlugin(hook) {
    hook.doneEach(function () {
      installThemeControl(); enhanceNavigation();
      var article = document.querySelector('.markdown-section');
      if (!article) return;
      article.tabIndex = -1;
      enhanceCode(article); buildToc(article);
      var title = article.querySelector('h1');
      document.title = title ? title.textContent + ' · 我的知识库' : '我的知识库';
    });
  }
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(themePlugin);
})();
