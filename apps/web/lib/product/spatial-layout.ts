export type SpatialLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export function getElementCenter(
  element: HTMLElement,
  container: HTMLElement
): { x: number; y: number } {
  const nodeRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    x: nodeRect.left - containerRect.left + nodeRect.width / 2,
    y: nodeRect.top - containerRect.top + nodeRect.height / 2,
  };
}
