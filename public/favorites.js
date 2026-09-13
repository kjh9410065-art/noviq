(() => {
  // 로그인 없이 브라우저에만 즐겨찾기와 최근 사용 기록을 저장합니다.
  const FAVORITES_KEY = 'noviq-favorites';
  const RECENTS_KEY = 'noviq-recents';
  const MAX_RECENTS = 8;

  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const getFavorites = () => read(FAVORITES_KEY);
  const isFavorite = (url) => getFavorites().includes(url);

  function toggleFavorite(url) {
    const favorites = getFavorites();
    const next = favorites.includes(url)
      ? favorites.filter(item => item !== url)
      : [...favorites, url];
    write(FAVORITES_KEY, next);
    return next.includes(url);
  }

  function addRecent(url) {
    const recents = read(RECENTS_KEY).filter(item => item !== url);
    recents.unshift(url);
    write(RECENTS_KEY, recents.slice(0, MAX_RECENTS));
  }

  function injectStyle() {
    if (document.getElementById('noviq-favorites-style')) return;
    const style = document.createElement('style');
    style.id = 'noviq-favorites-style';
    style.textContent = `
      .noviq-card-wrap{position:relative}
      .noviq-favorite{position:absolute;right:12px;top:12px;width:38px;height:38px;border:1px solid var(--border);border-radius:50%;background:var(--card);color:var(--muted);font-size:20px;line-height:1;cursor:pointer;z-index:2}
      .noviq-favorite:hover{color:var(--primary);transform:scale(1.05)}
      .noviq-favorite.active{color:#f59e0b;border-color:#f59e0b}
      .noviq-detail-favorite{display:inline-flex;align-items:center;gap:6px;margin:8px 0 14px;padding:9px 14px;border:1px solid var(--border);border-radius:999px;background:var(--card);color:var(--text);font-weight:800;font-size:13px;cursor:pointer}
      .noviq-detail-favorite.active{color:#f59e0b;border-color:#f59e0b}
      .noviq-recent{margin:0 0 14px;padding:14px;border:1px solid var(--border);border-radius:16px;background:var(--card)}
      .noviq-recent-title{font-size:13px;font-weight:900;margin-bottom:9px}
      .noviq-recent-list{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none}
      .noviq-recent-list::-webkit-scrollbar{display:none}
      .noviq-recent a{flex:0 0 auto;padding:8px 11px;border:1px solid var(--border);border-radius:999px;color:var(--text);text-decoration:none;font-size:12px}
      .noviq-recent a:hover{border-color:var(--primary);color:var(--primary)}
      .noviq-favorites-section{margin:0 0 16px}
      .noviq-favorites-title{font-size:15px;font-weight:900;margin:0 0 9px}
    `;
    document.head.appendChild(style);
  }

  function setupCard(card) {
    if (card.dataset.favoriteReady === '1') return;
    const url = card.getAttribute('href');
    if (!url || !url.endsWith('.html')) return;

    card.dataset.favoriteReady = '1';
    card.classList.add('noviq-card-wrap');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'noviq-favorite';
    button.setAttribute('aria-label', '즐겨찾기');

    const update = () => {
      const active = isFavorite(url);
      button.textContent = active ? '★' : '☆';
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    };

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(url);
      update();
      renderFavoriteSection();
    });

    card.appendChild(button);
    card.addEventListener('click', () => addRecent(url));
    update();
  }

  function setupCards() {
    document.querySelectorAll('a.card').forEach(setupCard);
  }

  function getCardInfo(url) {
    const card = [...document.querySelectorAll('a.card')]
      .find(item => item.getAttribute('href') === url && !item.closest('#noviq-favorites-section'));
    if (!card) return null;
    return {
      url,
      name: card.querySelector('.title')?.textContent?.trim() || url
    };
  }

  function renderRecent() {
    const old = document.getElementById('noviq-recent');
    if (old) old.remove();

    const items = read(RECENTS_KEY).map(getCardInfo).filter(Boolean);
    if (!items.length) return;

    const target = document.querySelector('.grid');
    if (!target) return;

    const section = document.createElement('section');
    section.id = 'noviq-recent';
    section.className = 'noviq-recent';
    section.innerHTML = '<div class="noviq-recent-title">🕘 최근 사용한 계산기</div><div class="noviq-recent-list"></div>';

    const list = section.querySelector('.noviq-recent-list');
    items.forEach(item => {
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.name;
      list.appendChild(link);
    });

    target.parentNode.insertBefore(section, target);
  }

  function renderFavoriteSection() {
    const old = document.getElementById('noviq-favorites-section');
    if (old) old.remove();

    const items = getFavorites().map(getCardInfo).filter(Boolean);
    if (!items.length) return;

    const target = document.querySelector('.grid');
    if (!target) return;

    const section = document.createElement('section');
    section.id = 'noviq-favorites-section';
    section.className = 'noviq-favorites-section';
    section.innerHTML = '<h2 class="noviq-favorites-title">⭐ 내 즐겨찾기</h2><div class="grid"></div>';

    const grid = section.querySelector('.grid');
    items.forEach(item => {
      const source = [...document.querySelectorAll('a.card')]
        .find(card => card.getAttribute('href') === item.url && !card.closest('#noviq-favorites-section'));

      if (!source) return;

      // cloneNode(true)는 이벤트 리스너를 복제하지 않으므로,
      // 원본의 즐겨찾기 버튼/초기화 플래그를 제거한 뒤 새 카드로 다시 초기화합니다.
      const clone = source.cloneNode(true);
      clone.removeAttribute('data-favorite-ready');
      clone.querySelector('.noviq-favorite')?.remove();
      grid.appendChild(clone);
    });

    target.parentNode.insertBefore(section, target);
    // 복제 카드에도 새 즐겨찾기 버튼과 클릭 이벤트를 다시 연결합니다.
    setupCards();
  }

  function setupDetailPage() {
    const file = location.pathname.split('/').pop() || '';
    // 목록/법률/오류 페이지에는 개별 계산기용 버튼을 만들지 않습니다.
    if (!file.endsWith('.html') || ['index.html', 'calculator-list.html', 'privacy.html', 'terms.html', 'contact.html', '404.html'].includes(file)) return;
    if (document.getElementById('noviq-detail-favorite')) return;

    const url = location.pathname;
    const heading = document.querySelector('h1') || document.querySelector('main') || document.body.firstElementChild;
    if (!heading) return;

    const button = document.createElement('button');
    button.id = 'noviq-detail-favorite';
    button.type = 'button';
    button.className = 'noviq-detail-favorite';
    button.setAttribute('aria-label', '즐겨찾기');

    const update = () => {
      const active = isFavorite(url);
      button.textContent = active ? '★ 즐겨찾기 저장됨' : '☆ 즐겨찾기';
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    };

    button.addEventListener('click', () => {
      toggleFavorite(url);
      update();
    });

    heading.insertAdjacentElement('afterend', button);
    addRecent(url);
    update();
  }

  function init() {
    injectStyle();
    setupCards();
    setupDetailPage();
    renderFavoriteSection();
    renderRecent();

    // DOM 변경 감지는 새 카드의 즐겨찾기 이벤트 연결에만 사용합니다.
    // renderFavoriteSection/renderRecent를 여기서 호출하면 자기 자신이 DOM을 바꿔
    // MutationObserver를 다시 실행시키는 무한 반복이 발생하므로 호출하지 않습니다.
    const observer = new MutationObserver(() => {
      setupCards();
      setupDetailPage();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
