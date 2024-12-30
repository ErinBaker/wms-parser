import { StyleData } from '../types';
import { getElementText } from './xmlUtils';

export function parseStyles(layerElement: Element): StyleData[] {
  // Only get direct child Style elements
  const styles: StyleData[] = [];
  for (const child of Array.from(layerElement.children)) {
    if (child.tagName === 'Style') {
      const style: StyleData = {
        name: getElementText(child, 'Name'),
        title: getElementText(child, 'Title'),
        legendUrl: parseLegendUrl(child),
      };
      styles.push(style);
    }
  }
  return styles;
}

function parseLegendUrl(styleElement: Element): string | undefined {
  const legendUrlElement = styleElement.getElementsByTagName('LegendURL')[0];
  if (!legendUrlElement) return undefined;

  const onlineResourceElement = legendUrlElement.getElementsByTagName('OnlineResource')[0];
  if (!onlineResourceElement) return undefined;

  return onlineResourceElement.getAttribute('xlink:href') || undefined;
}