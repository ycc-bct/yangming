/* Presentation only: reuse the existing report, data, chart markup and event handler. */
(function () {
  const makeBeforeLayout = makeReport;
  const renderBeforeLayout = renderReports;
  const bindBeforeLayout = bindPage;
  const sectionOrder = [];
  function bindReportOrder(root, onChange = () => {}) {
    if (!root) return;
    let dragged = null;
    const sections = () => [...root.children].filter(el => el.tagName === 'SECTION');
    const update = () => {
      const nav = root.querySelector('.report-contents');
      if (nav) {
        for (const section of sections()) {
          const link = [...nav.querySelectorAll('a')].find(a => a.getAttribute('href') === '#' + section.id);
          if (link) nav.append(link);
        }
      }
      const indicator = root.querySelector('.report-section-indicator');
      if (indicator) {
        for (const section of sections()) {
          const link = [...indicator.querySelectorAll('[data-indicator-for]')].find(a => a.dataset.indicatorFor === section.id);
          if (link) indicator.append(link);
        }
      }
      onChange(sections().map(el => el.dataset.sectionKey));
    };
    sections().forEach(section => {
      section.addEventListener('dragstart', e => {
        dragged = section;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', section.id);
        section.classList.add('is-dragging');
      });
      section.addEventListener('dragend', () => {
        root.querySelectorAll('.is-drop-target,.is-dragging').forEach(el => el.classList.remove('is-drop-target','is-dragging'));
        dragged = null;
      });
      section.addEventListener('dragover', e => { if (dragged && dragged !== section) { e.preventDefault(); section.classList.add('is-drop-target'); } });
      section.addEventListener('dragleave', e => { if (!section.contains(e.relatedTarget)) section.classList.remove('is-drop-target'); });
      section.addEventListener('drop', e => {
        if (!dragged || dragged === section) return;
        e.preventDefault();
        const all = sections();
        if (all.indexOf(dragged) < all.indexOf(section)) section.after(dragged); else section.before(dragged);
        section.classList.remove('is-drop-target');
        update();
      });
      section.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        const all = sections(), i = all.indexOf(section);
        if (e.key === 'ArrowUp' && i > 0) all[i-1].before(section);
        if (e.key === 'ArrowDown' && i < all.length-1) all[i+1].after(section);
        update(); section.focus();
      });
    });
    update();
  }
  const cssFiles = ['pages.css', 'strategy.css', 'assessment.css', 'ui-theme.css', 'intelligence-model.css', 'report-layout.css'];
  let stylesPromise;
  async function reportStyles() {
    if (!stylesPromise) stylesPromise = Promise.all(cssFiles.map(async path => {
      const response = await fetch(path);
      if (!response.ok) throw Error('報告樣式讀取失敗，請重試。');
      return (await response.text()).replace(/@import[^;]+;/g, '');
    })).then(styles => styles.join('\n')).catch(error => { stylesPromise = null; throw error; });
    return stylesPromise;
  }
  async function dataURL(path) {
    const response = await fetch(path);
    if (!response.ok) throw Error('報告圖片讀取失敗，請重試。');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  renderReports = function () {
    return renderBeforeLayout()
      .replace('<section class="page-card"><div class="page-card-head"><h2>報告設定</h2>', '<section class="page-card report-setup-card"><div class="page-card-head"><h2>報告設定</h2>')
      .replace('type="submit" class="page-button">更新預覽', 'type="submit" id="updateReportPreview" form="reportForm" class="page-button">更新')
      .replace('產生報告連結</button>', '產生報告</button>');
  };
  makeReport = function () {
    makeBeforeLayout();
    const report = pageState.report, route = routes[report.route];
    const source = document.createElement('div');
    source.innerHTML = report.body;
    const title = source.querySelector('h1'), routeTitle = source.querySelector('h2');
    const brand = source.querySelector('small'), stamp = source.querySelector('p');
    const hero = document.createElement('div');
    hero.className = 'report-cover';
    hero.innerHTML = `<img class="report-cover-photo" src="assets/report-port.png" alt="港口貨櫃船與岸邊起重機"><div class="report-cover-copy"><div class="report-cover-brand"></div><div class="report-cover-title"></div><div class="report-cover-route"></div><div class="report-cover-meta"><span>主要風險節點 · ${escapeHTML(route.node)}</span><span class="report-level" data-level="${escapeHTML(route.level)}">風險 · ${escapeHTML(route.level)}</span></div><div class="report-cover-date"></div></div>`;
    hero.querySelector('.report-cover-brand').append(brand);
    hero.querySelector('.report-cover-title').append(title);
    hero.querySelector('.report-cover-route').append(routeTitle);
    hero.querySelector('.report-cover-date').append(stamp);
    source.prepend(hero);
    const sections = [...source.children].filter(el => el.tagName === 'SECTION');
    // Move the existing risk summary ahead of the executive summary. No source copy is removed.
    const risk = sections.find(el => el.querySelector('h2')?.textContent === '風險摘要');
    if (risk) {
      risk.classList.add('report-risk-lead');
      hero.after(risk);
      const news = events.filter(event => event.route === report.route);
      if (news.length) {
        const list = document.createElement('div');
        list.className = 'report-news';
        list.innerHTML = news.map(event => `<article><div class="report-news-meta"><span>${escapeHTML(event.type)}</span><span>${escapeHTML(event.status)}</span></div><h3>${escapeHTML(event.title)}</h3><p>${escapeHTML(event.impact)}</p><p class="report-news-evidence">${escapeHTML(event.evidence)}</p></article>`).join('');
        risk.append(list);
      }
    }
    source.querySelectorAll('.report-summary-copy').forEach(el => {
      const fragments = el.textContent.split(/\n\n/);
      const group = document.createElement('div');
      group.className = 'report-summary-parts';
      fragments.forEach(text => {
        const paragraph = document.createElement('p');
        // Retain every character of the original summary, including its punctuation.
        const colon = text.indexOf('：');
        if (colon >= 0) {
          const strong = document.createElement('strong');
          strong.textContent = text.slice(0, colon + 1);
          paragraph.append(strong, document.createTextNode(text.slice(colon + 1)));
        } else paragraph.textContent = text;
        group.append(paragraph);
      });
      el.replaceWith(group);
    });
    // Calculation notes follow all the evidence, without changing their content.
    const calculation = sections.find(el => el.querySelector('h2')?.textContent === '計算說明');
    if (calculation) {
      calculation.classList.add('report-calculation-note');
      source.append(calculation);
    }
    const ordered = [...source.children].filter(el => el.tagName === 'SECTION');
    ordered.forEach((el, i) => {
      const heading = el.querySelector('h2');
      el.dataset.sectionKey = heading.textContent;
      el.id = 'report-section-' + i;
      el.draggable = true;
      el.tabIndex = 0;
      el.setAttribute('aria-label', `Section：${heading.textContent}；可拖曳調整順序`);
    });
    if (sectionOrder.length) ordered.sort((a,b) => {
      const rank = el => { const index = sectionOrder.indexOf(el.dataset.sectionKey); return index < 0 ? 999 : index; };
      return rank(a)-rank(b);
    }).forEach(el => source.append(el));
    const countryFlags = {'墨西哥':'🇲🇽','智利':'🇨🇱','巴西':'🇧🇷','阿根廷':'🇦🇷','哥倫比亞':'🇨🇴','荷蘭':'🇳🇱','德國':'🇩🇪','巴拿馬':'🇵🇦','秘魯':'🇵🇪','英國':'🇬🇧','西班牙':'🇪🇸','義大利':'🇮🇹','美國':'🇺🇸'};
    const countrySections = new Set(['港口與內陸','國家風險']);
    ordered.filter(section => countrySections.has(section.querySelector('h2')?.textContent)).forEach(section => {
      section.querySelectorAll('table tr').forEach((row, index) => {
        if (index === 0) return;
        const countryCell = row.querySelector('td');
        if (!countryCell) return;
        const countries = countryCell.textContent.trim().split('、').map(country => country.trim());
        if (!countries.some(country => countryFlags[country])) return;
        countryCell.replaceChildren();
        countries.forEach((country, countryIndex) => {
          if (countryIndex) countryCell.append(document.createTextNode('、'));
          const label = document.createElement('span');
          label.className = 'country-label';
          const flag = document.createElement('span');
          flag.className = 'country-flag';
          flag.setAttribute('aria-hidden', 'true');
          flag.textContent = countryFlags[country] || '';
          if (flag.textContent) label.append(flag);
          label.append(document.createTextNode(country));
          countryCell.append(label);
        });
      });
    });
    source.querySelectorAll('th').forEach(cell => {
      const icon = document.createElement('span');
      icon.className = 'report-table-icon';
      icon.setAttribute('aria-hidden','true');
      icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 10v10"/></svg>';
      cell.prepend(icon);
    });
    const indicator = document.createElement('aside');
    indicator.className = 'report-section-indicator';
    indicator.setAttribute('aria-label', '報告章節進度');
    indicator.innerHTML = ordered.map(el => `<a href="#${el.id}" data-indicator-for="${el.id}"><span aria-hidden="true"></span><b>${escapeHTML(el.querySelector('h2').textContent)}</b></a>`).join('');
    source.append(indicator);
    const footer = document.createElement('div');
    footer.className = 'report-credit';
    footer.textContent = 'Banner 情境照片：使用者提供';
    source.append(footer);
    report.body = source.innerHTML;
    document.querySelector('#reportPreview').classList.add('report-document');
    document.querySelector('#reportPreview').innerHTML = report.body;
    // Existing share reader remains scriptless and isolated.
    const oldDocument = new DOMParser().parseFromString(report.html, 'text/html');
    const oldStyles = [...oldDocument.querySelectorAll('style')].map(el => el.outerHTML).join('');
    report.html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(report.title)}</title>${oldStyles}</head><body><article class="report-preview report-document">${report.body}</article></body></html>`;
    bindSafetyChartEvents(document.querySelector('#reportPreview .safety-event-chart'));
    bindReportIndicator(document.querySelector('#reportPreview'));
    bindReportOrder(document.querySelector('#reportPreview'), keys => {
      sectionOrder.splice(0, sectionOrder.length, ...keys);
      report.body = document.querySelector('#reportPreview').innerHTML;
      const doc = new DOMParser().parseFromString(report.html, 'text/html');
      doc.querySelector('.report-document').innerHTML = report.body;
      report.html = '<!doctype html>' + doc.documentElement.outerHTML;
      const link = document.getElementById('generatedReportLink');
      if (link) link.hidden = true;
    });
  };
  function bindReportIndicator(root) {
    if (!root) return;
    const indicator = root.querySelector('.report-section-indicator');
    const sections = [...root.children].filter(el => el.tagName === 'SECTION');
    if (!indicator || !sections.length) return;
    const links = [...indicator.querySelectorAll('[data-indicator-for]')];
    const setActive = id => links.forEach(link => {
      const active = link.dataset.indicatorFor === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    links.forEach(link => link.addEventListener('click', () => setActive(link.dataset.indicatorFor)));
    setActive(sections[0].id);
    let hideTimer;
    const showDuringScroll = () => {
      indicator.classList.add('is-scrolling');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => indicator.classList.remove('is-scrolling'), 700);
    };
    const scrollTarget = root.closest('.page-content') || document.scrollingElement;
    scrollTarget?.addEventListener('scroll', showDuringScroll, {passive: true});
    document.addEventListener('scroll', showDuringScroll, {passive: true, capture: true});
    if (!root.closest('.page-content')) window.addEventListener('scroll', showDuringScroll, {passive: true});
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      }, {root: root.closest('.page-content') || null, rootMargin: '-18% 0px -62% 0px', threshold: [0, .1, .5]});
      sections.forEach(section => observer.observe(section));
    }
  }
  // Build a self-contained, trusted local report. Never execute decoded share-link contents.
  async function buildPortable(report) {
    const [css, picture, fonts] = await Promise.all([reportStyles(), dataURL('assets/report-port.png'), ReportFonts.inlineFor(report.body)]);
    const body = report.body.replace('src="assets/report-port.png"', `src="${picture}"`);
    const eventsJSON = JSON.stringify(SAFETY_CHART_EVENTS).replace(/</g, '\\u003c');
    const script = `const escapeHTML=${escapeHTML.toString()};const SAFETY_CHART_EVENTS=${eventsJSON};${bindSafetyChartEvents.toString()};bindSafetyChartEvents(document.querySelector('.safety-event-chart'),SAFETY_CHART_EVENTS);${bindReportOrder.toString()};${bindReportIndicator.toString()};bindReportOrder(document.querySelector('.report-document'));bindReportIndicator(document.querySelector('.report-document'));`;
    return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escapeHTML(report.title)}</title><style>${fonts}\n${css}</style></head><body class="report-file"><article class="report-preview report-document">${body}</article><script>${script}<\/script></body></html>`;
  }
  window.ReportPresentation = { buildPortable };
  async function exportReport(preview) {
    if (!document.querySelector('#reportForm').reportValidity()) return;
    makeReport();
    const snapshot = {...pageState.report};
    const status = document.querySelector('#reportExportStatus');
    const buttons = ['downloadReportHTML', 'previewReportHTML'].map(id => document.getElementById(id));
    const previewWindow = preview ? window.open('', '_blank') : null;
    if (previewWindow) { previewWindow.opener = null; previewWindow.document.title = '正在準備報告…'; }
    buttons.forEach(button => { button.disabled = true; });
    status.textContent = '正在準備完整 HTML 報告…';
    try {
      const html = await buildPortable(snapshot);
      const url = URL.createObjectURL(new Blob([html], {type: 'text/html;charset=utf-8'}));
      if (previewWindow) previewWindow.location.replace(url);
      else {
        const link = document.createElement('a');
        link.href = url;
        link.download = snapshot.title.replace(/[\\/:*?"<>|]/g, '-') + '.html';
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = previewWindow ? '已開啟完整報告預覽。' : '已下載 HTML；圖片、字型與圖表互動可離線使用。';
    } catch (error) {
      if (previewWindow) previewWindow.close();
      status.textContent = error.message || '匯出失敗，請重試。';
    } finally { buttons.forEach(button => { button.disabled = false; }); }
  }
  bindPage = function (page) {
    bindBeforeLayout(page);
    document.querySelector('#pageContent').classList.toggle('report-workspace', page === 'reports');
    if (page !== 'reports') return;
    const updateButton = document.querySelector('#updateReportPreview');
    const generateButton = document.querySelector('#generateReport');
    const setupCard = document.querySelector('.report-grid>.page-card:first-child');
    const setupHeader = setupCard?.querySelector('.page-card-head');
    if (setupHeader) {
      const actions = document.createElement('div');
      actions.className = 'report-setup-actions';
      if (updateButton) actions.append(updateButton);
      if (generateButton) actions.append(generateButton);
      setupHeader.append(actions);
    }
    const previewCard = document.querySelector('.report-grid>.page-card:nth-child(2)');
    const previewHeader = previewCard?.querySelector('.page-card-head');
  };
  if (currentPage === 'reports') renderPage('reports');
})();
