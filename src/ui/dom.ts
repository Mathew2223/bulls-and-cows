type Handler = (event: Event) => void;
export type Attrs = Readonly<Record<string, string | boolean | Handler>>;

/**
 * Мини-хелпер для построения DOM без innerHTML:
 * обработчики — атрибуты вида `onclick`, булевы атрибуты — `disabled: true`.
 * Строки-дети добавляются как текстовые узлы (безопасно).
 */
export const h = (tag: string, attrs: Attrs = {}, ...children: ReadonlyArray<Node | string>): HTMLElement => {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([name, value]) => {
    if (typeof value === 'function') element.addEventListener(name.replace(/^on/, ''), value);
    else if (value === true) element.setAttribute(name, '');
    else if (value !== false) element.setAttribute(name, value);
  });
  element.append(...children);
  return element;
};
