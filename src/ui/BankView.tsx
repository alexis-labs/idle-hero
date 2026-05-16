import { Search, Shield, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGame } from '../app/useGameStore';
import { items } from '../data/items';
import { formatNumber, getUsedBankSlots } from '../systems/formulas';
import { Coins, getCategoryIcon } from './iconMaps';
import { ItemIcon } from './ItemIcon';

export function BankView() {
  const { state, dispatch } = useGame();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const entries = useMemo(() => {
    return Object.entries(state.bank)
      .map(([itemId, quantity]) => ({ item: items[itemId], itemId, quantity }))
      .filter((entry) => entry.item && entry.quantity > 0)
      .sort((left, right) => left.item!.name.localeCompare(right.item!.name));
  }, [state.bank]);

  const categories = ['all', ...Array.from(new Set(entries.map((entry) => entry.item!.category)))];
  const filtered = entries.filter((entry) => {
    const matchesCategory = category === 'all' || entry.item!.category === category;
    const matchesQuery = entry.item!.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const selected = selectedItemId ? entries.find((entry) => entry.itemId === selectedItemId) : null;

  return (
    <section className="main-view bank-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Inventory</span>
          <h2>Bank</h2>
          <p>{getUsedBankSlots(state)} / {state.bankSlots} slots used. Items feed skills, crafting, gear and combat loops.</p>
        </div>
        <div className="bank-value-pill stat-chip money-chip"><Coins size={16} />{formatNumber(state.gp, state.settings.compactNumbers)} GP</div>
      </div>

      <div className="bank-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bank" />
        </label>
        <div className="category-tabs">
          {categories.map((entry) => {
            const CategoryIcon = getCategoryIcon(entry);
            return (
              <button key={entry} className={category === entry ? 'active' : ''} onClick={() => setCategory(entry)}>
                <CategoryIcon size={15} />
                {entry}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bank-content">
        <div className="bank-grid">
          {filtered.map((entry) => (
            <button key={entry.itemId} className={`bank-slot ${selectedItemId === entry.itemId ? 'active' : ''}`} onClick={() => setSelectedItemId(entry.itemId)} title={entry.item!.name}>
              <ItemIcon itemId={entry.itemId} quantity={entry.quantity} />
              <span>{entry.item!.name}</span>
            </button>
          ))}
          {!filtered.length && <div className="empty-state compact"><h3>No items found</h3></div>}
        </div>

        <aside className="item-detail-panel">
          {selected?.item ? (
            <>
              <ItemIcon itemId={selected.itemId} quantity={selected.quantity} />
              <h3>{selected.item.name}</h3>
              <span className={`rarity-pill ${selected.item.rarity}`}>{selected.item.rarity}</span>
              <p>{selected.item.description}</p>
              <div className="stat-grid">
                <span>Quantity</span><strong>{formatNumber(selected.quantity, state.settings.compactNumbers)}</strong>
                <span>Sell each</span><strong className="inline-icon-value"><Coins size={14} />{selected.item.sellValue} GP</strong>
                <span>Type</span><strong>{selected.item.type}</strong>
              </div>
              {selected.item.equipment && (
                <button className="primary-button" onClick={() => dispatch({ type: 'equipItem', itemId: selected.itemId })}><Shield size={16} />Equip</button>
              )}
              {selected.item.healAmount && (
                <button className="secondary-button" onClick={() => dispatch({ type: 'useFood', itemId: selected.itemId })}><Utensils size={16} />Eat</button>
              )}
              {selected.item.sellValue > 0 && (
                <div className="split-actions">
                  <button className="secondary-button" onClick={() => dispatch({ type: 'sellItem', itemId: selected.itemId, quantity: 1 })}><Coins size={16} />Sell 1</button>
                  <button className="secondary-button" onClick={() => dispatch({ type: 'sellItem', itemId: selected.itemId, quantity: selected.quantity })}><Coins size={16} />Sell all</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state compact"><h3>No item selected</h3><p>Select an item to inspect, equip, use or sell.</p></div>
          )}
        </aside>
      </div>
    </section>
  );
}
