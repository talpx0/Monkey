import { sleep } from "./utils";



interface FoundFormula {
        formula: string;
        index: number;
    }

    interface FindButtonOptions {
        buttonText?: string[];
        hasSvg?: boolean;
        attempts?: number;
    }


export function findFormulas(text: string): FoundFormula[] {
    const formulas: FoundFormula[] = [];
    const combinedRegex = /\$\$(.*?)\$\$|\$([^\$\n]+?)\$|\\\((.*?)\\\)/gs;

    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = combinedRegex.exec(text)) !== null) {
    const [fullMatch] = match;
    if (fullMatch) {
        formulas.push({
        formula: fullMatch,
        index: match.index,
        });
    }
    }
    return formulas;
}


export async function findOperationArea(): Promise<HTMLElement | null> {
    const selector = '.notion-overlay-container';
    for (let i = 0; i < 5; i++) {
    const areas = document.querySelectorAll(selector);
    const area = Array.from(areas).find(
        (a) => (a as HTMLElement).style.display !== 'none' && a.querySelector('[role="button"]'),
    ) as HTMLElement | undefined;

    if (area) {
        console.log('找到操作区域');
        return area;
    }
    await sleep(50);
    }
    return null;
}

// 按钮查找
export async function findButton(
    area: Document | Element,
    options: FindButtonOptions = {},
): Promise<HTMLElement | null> {
    const { buttonText = [], hasSvg = false, attempts = 8 } = options;

    const buttons = area.querySelectorAll('[role="button"]');
    const cachedButtons = Array.from(buttons) as HTMLElement[];

    for (let i = 0; i < attempts; i++) {
    const button = cachedButtons.find((btn) => {
        if (hasSvg && btn.querySelector('svg.squareRootSmall')) return true;
        const text = (btn.textContent || '').toLowerCase();
        return buttonText.some((t) => text.includes(t));
    });

    if (button) {
        return button;
    }
    await sleep(50);
    }
    return null;
}


export async function simulateClick(element: Element): Promise<void> {
  const { left, top, width, height } = (element as HTMLElement).getBoundingClientRect();
  const clientX = left + width / 2;
  const clientY = top + height / 2;

  const types = ['mousemove', 'mouseenter', 'mousedown', 'mouseup', 'click'] as const;

  // Build events via map, then dispatch them in order with small delays
  const events = types.map(
    (type) => new MouseEvent(type, { bubbles: true, clientX, clientY })
  );

  for (const evt of events) {
    (element as HTMLElement).dispatchEvent(evt);
    await sleep(20);
  }
}
