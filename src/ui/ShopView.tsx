import { ShoppingBag } from 'lucide-react';
import { useGame } from '../app/useGameStore';
import { shopUpgrades } from '../data/shop';
import { formatNumber } from '../systems/formulas';
import { Coins } from './iconMaps';

export function ShopView() {
  const { state, dispatch } = useGame();

  return (
    <section className="main-view shop-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Town services</span>
          <h2>Shop</h2>
          <p>Spend GP on permanent account upgrades.</p>
        </div>
        <div className="bank-value-pill stat-chip money-chip"><Coins size={16} />{formatNumber(state.gp, state.settings.compactNumbers)} GP</div>
      </div>

      <div className="shop-grid">
        {shopUpgrades.map((upgrade) => {
          const purchases = state.shopPurchases[upgrade.id] ?? 0;
          const maxed = purchases >= upgrade.maxPurchases;
          return (
            <article key={upgrade.id} className="shop-card">
              <div className="shop-icon"><ShoppingBag size={24} /></div>
              <h3>{upgrade.name}</h3>
              <p>{upgrade.description}</p>
              <div className="stat-grid">
                <span>Cost</span><strong className="inline-icon-value"><Coins size={14} />{upgrade.cost} GP</strong>
                <span>Owned</span><strong>{purchases} / {upgrade.maxPurchases}</strong>
                <span>Effect</span><strong>{upgrade.effectLabel}</strong>
              </div>
              <button className="primary-button" disabled={maxed || state.gp < upgrade.cost} onClick={() => dispatch({ type: 'buyUpgrade', upgradeId: upgrade.id })}>{maxed ? 'Maxed' : 'Buy'}</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
