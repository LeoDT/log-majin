export class TextHeightCalculator {
  measureEl: HTMLElement | null;

  constructor() {
    this.measureEl = null;
  }

  setMeasureEl(el: HTMLElement) {
    if (this.measureEl) {
      document.body.removeChild(this.measureEl);

      this.measureEl = null;
    }

    const style = getComputedStyle(el);
    const { width } = el.getBoundingClientRect();
    const measureStyle = {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      width: `${width}px`,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: -1,
      visibility: 'hidden',
    };
    const measureEl = document.createElement('div');
    Object.assign(measureEl.style, measureStyle);

    document.body.appendChild(measureEl);
    this.measureEl = measureEl;
  }

  calculate(t: string, defaultHeight: number) {
    if (this.measureEl) {
      this.measureEl.textContent = t;

      return this.measureEl.offsetHeight;
    }

    return defaultHeight;
  }
}

window.ccccc = new TextHeightCalculator();
