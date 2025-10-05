/// <reference types="tampermonkey" />
declare function GM_addStyle(css: string): void;
import { convertFormulas } from './interpreter';
import {findFormulas} from './selector';
import css from './styles.css';
import { createPanel} from './ui';

(() => {
  'use strict';

  GM_addStyle(css);

  const ui = createPanel();                 // ⬅️ keep the whole object

  ui.convertBtn.addEventListener('click', () => {
    void convertFormulas(ui);               // ⬅️ pass it through
  });

  /* show pending-formula count once at start-up */
  setTimeout(() => {
    const n = findFormulas(document.body.textContent ?? '').length;
    ui.convertBtn.textContent = `🔄 (${n})`;
  }, 1000);

  console.log('Formula conversion tool loaded');
})();