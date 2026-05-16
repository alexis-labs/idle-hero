import { Backpack, Hammer, Swords, Trophy, Settings, ShoppingBag, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useGame } from '../app/useGameStore';
import { actionsById } from '../data/actions';
import { skillGroups, skills } from '../data/skills';
import { getLevelProgress, getSkillLevel } from '../systems/formulas';
import type { SkillId, ViewId } from '../types/game';
import { getSkillIcon } from './iconMaps';

const navItems: { view: ViewId; label: string; icon: LucideIcon }[] = [
  { view: 'skills', label: 'Skills', icon: Hammer },
  { view: 'combat', label: 'Combat', icon: Swords },
  { view: 'bank', label: 'Bank', icon: Backpack },
  { view: 'shop', label: 'Shop', icon: ShoppingBag },
  { view: 'achievements', label: 'Goals', icon: Trophy },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { state, dispatch } = useGame();

  return (
    <aside className="sidebar">
      <nav className="view-nav" aria-label="Main views">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.view} className={state.activeView === item.view ? 'active' : ''} onClick={() => dispatch({ type: 'selectView', view: item.view })} title={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="skill-scroll">
        {skillGroups.map((group) => {
          const groupSkills = skills.filter((skill) => skill.category === group.id);
          return (
            <section key={group.id} className="skill-group">
              <h2>{group.label}</h2>
              {groupSkills.map((skill) => {
                const SkillIcon = getSkillIcon(skill.id);
                const level = getSkillLevel(state, skill.id);
                const progress = getLevelProgress(state, skill.id);
                const isActive = state.selectedSkill === skill.id && state.activeView === 'skills';
                const isRunning = state.activeActionId ? actionsById[state.activeActionId]?.skillId === skill.id : false;
                return (
                  <button
                    key={skill.id}
                    className={`skill-nav-item ${isActive ? 'active' : ''} ${!skill.implemented ? 'locked' : ''}`}
                    onClick={() => dispatch({ type: 'selectSkill', skillId: skill.id as SkillId })}
                    style={{ '--skill-color': skill.color } as CSSProperties}
                    title={skill.lockedNote ?? skill.description}
                  >
                    <span className="skill-icon-wrap"><SkillIcon size={17} strokeWidth={2.35} /></span>
                    <span className="skill-label">{skill.name}</span>
                    <span className="skill-level">{skill.implemented ? level : 'Soon'}</span>
                    <span className="skill-mini-track"><span style={{ transform: `scaleX(${skill.implemented ? progress : 0})` }} /></span>
                    {isRunning && <span className="running-pip" />}
                  </button>
                );
              })}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
