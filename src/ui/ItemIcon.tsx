import type { CSSProperties } from 'react';
import { items } from '../data/items';
import { getItemIcon } from './iconMaps';

export function ItemIcon({ itemId, quantity, muted = false }: { itemId: string; quantity?: number; muted?: boolean }) {
  const item = items[itemId];
  if (!item) return null;
  const Icon = getItemIcon(itemId);

  return (
    <span className={`item-icon ${muted ? 'muted' : ''}`} title={item.name} style={{ '--item-color': item.color } as CSSProperties}>
      <Icon size={18} strokeWidth={2.4} />
      {typeof quantity === 'number' && quantity > 1 && <small>{quantity}</small>}
    </span>
  );
}
