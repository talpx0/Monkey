import { findButton, findFormulas, findOperationArea, simulateClick } from "./selector";
import { updateProgress, updateStatus } from "./ui";
import { sleep } from "./utils";



export type UIHandles = {
  panel: HTMLDivElement;
  convertBtn: HTMLButtonElement;
  progressBar: HTMLDivElement;
  statusText: HTMLElement;
};


export async function convertFormula(
  editor: HTMLElement, 
  formula: string,
  ui: UIHandles    
): Promise<boolean | undefined> {
  const { statusText } = ui;   
  try {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;

    // eslint-disable-next-line no-cond-assign
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE && (node as Text).textContent?.includes(formula)) {
        textNodes.unshift(node as Text);
      }
    }

    if (!textNodes.length) {
      console.warn('未找到匹配的文本');
      return;
    }

    const targetNode = textNodes[0];
    const content = targetNode.textContent ?? '';
    const startOffset = content.indexOf(formula);
    if (startOffset < 0) {
      console.warn('目标文本中未定位到公式');
      return;
    }

    const range = document.createRange();
    range.setStart(targetNode, startOffset);
    range.setEnd(targetNode, startOffset + formula.length);

    const selection = window.getSelection();
    if (!selection) {
      throw new Error('无法获取选区');
    }
    selection.removeAllRanges();
    selection.addRange(range);

    (targetNode.parentElement as HTMLElement).focus();
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await sleep(50);

    const area = await findOperationArea();
    if (!area) throw new Error('未找到操作区域');

    const formulaButton = await findButton(area, {
      hasSvg: true,
      buttonText: ['equation', '公式', 'math'],
    });
    if (!formulaButton) throw new Error('未找到公式按钮');

    await simulateClick(formulaButton);
    await sleep(50);

    const doneButton = await findButton(document, {
      buttonText: ['done', '完成'],
      attempts: 10,
    });
    if (!doneButton) throw new Error('未找到完成按钮');

    await simulateClick(doneButton);
    await sleep(10);

    return true;
  } catch (err: any) {
    console.error('转换公式时出错:', err);
    updateStatus(statusText, `错误: ${err?.message ?? String(err)}`, 0);
    throw err;
  }
}



let isProcessing = false;                   // module-level guard

export async function convertFormulas(ui: UIHandles): Promise<void> {
  if (isProcessing) return;                 // already running
  isProcessing = true;

  const { panel, convertBtn, progressBar, statusText } = ui;
  convertBtn.classList.add('processing');

  try {
    updateStatus(statusText, '开始扫描文档…');

    /* gather all formulas first */
    const editors = Array.from(
      document.querySelectorAll<HTMLElement>('[contenteditable="true"]')
    );
    const jobs = editors.map(ed => ({ editor: ed, formulas: findFormulas(ed.textContent ?? '') }));
    const total = jobs.reduce((sum, j) => sum + j.formulas.length, 0);

    if (!total) {
      updateStatus(statusText, '未找到需要转换的公式', 3000);
      updateProgress(progressBar, 0, 0);
      return;
    }

    updateStatus(statusText, `找到 ${total} 个公式，开始转换…`);

    let done = 0;
    for (const { editor, formulas } of jobs.reverse()) {
      for (const { formula } of formulas.reverse()) {
        await convertFormula(editor, formula, ui);     // your existing helper
        done++;
        updateProgress(progressBar, done, total);
        updateStatus(statusText, `正在转换… (${done}/${total})`);
      }
    }

    updateStatus(statusText, `Done: ${done}`, 3000);
    convertBtn.textContent = `🔄 (${done})`;

    /* auto-collapse */
    setTimeout(() => {
      if (!panel.classList.contains('collapsed')) panel.classList.add('collapsed');
    }, 1000);

  } catch (err: any) {
    console.error('转换过程出错:', err);
    updateStatus(statusText, `发生错误: ${err?.message ?? String(err)}`, 5000);
    updateProgress(progressBar, 0, 0);
  } finally {
    isProcessing = false;
    convertBtn.classList.remove('processing');
    /* clear bar after a short pause */
    setTimeout(() => {
      if (!isProcessing) updateProgress(progressBar, 0, 0);
    }, 1000);
  }
}