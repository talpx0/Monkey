export type UIHandles = {
  panel: HTMLDivElement;
  convertBtn: HTMLButtonElement;
  progressBar: HTMLDivElement;
  statusText: HTMLElement;
};

export function createPanel(): UIHandles {
  const panel = document.createElement('div');
  panel.id = 'formula-helper';
  panel.classList.add('collapsed');
  panel.innerHTML = `
    <button id="collapse-btn" title="Toggle">
      <svg viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
    <div class="content-wrapper">
      <button id="convert-btn">🔄 (0)</button>
      <div id="progress-container">
        <div id="progress-bar"></div>
      </div>
      <div id="status-text">就绪</div>
    </div>
  `;
  document.body.appendChild(panel);

  const statusText = panel.querySelector('#status-text') as HTMLElement;
  const convertBtn = panel.querySelector('#convert-btn') as HTMLButtonElement;
  const progressBar = panel.querySelector('#progress-bar') as HTMLDivElement;
  const collapseBtn = panel.querySelector('#collapse-btn') as HTMLButtonElement;

  let isCollapsed = true;
  let hoverTimer: number | null = null;

  function toggleCollapse(): void {
    isCollapsed = !isCollapsed;
    panel.classList.toggle('collapsed', isCollapsed);
  }

  collapseBtn.addEventListener('click', toggleCollapse);

  panel.addEventListener('mouseenter', () => {
    if (hoverTimer !== null) window.clearTimeout(hoverTimer);
    if (isCollapsed) {
      hoverTimer = window.setTimeout(() => {
        panel.classList.remove('collapsed');
        isCollapsed = false;
      }, 150);
    }
  });

  panel.addEventListener('mouseleave', () => {
    if (hoverTimer !== null) window.clearTimeout(hoverTimer);
    const processing = convertBtn.classList.contains('processing');
    if (!isCollapsed && !processing) {
      hoverTimer = window.setTimeout(() => {
        panel.classList.add('collapsed');
        isCollapsed = true;
      }, 800);
    }
  });

  return { panel, convertBtn, progressBar, statusText };
}


/* ► progress bar needs the element that’s inside UIHandles ◄ */
export function updateProgress(
  bar: HTMLDivElement,
  current: number,
  total: number
): void {
  const pct = total > 0 ? (current / total) * 100 : 0;
  bar.style.width = `${pct}%`;
}

/* ► same for status text ◄ */
export function updateStatus(
  textEl: HTMLElement,
  text: string,
  timeout = 0
): void {
  textEl.textContent = text;
  if (timeout) {
    setTimeout(() => (textEl.textContent = '就绪'), timeout);
  }
  console.log('[状态]', text);
}