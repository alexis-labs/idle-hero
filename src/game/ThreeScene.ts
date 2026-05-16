import * as THREE from 'three';
import { actionsById } from '../data/actions';
import { coordKey, generateMapTile } from '../data/map';
import { monstersById } from '../data/monsters';
import { skillsById } from '../data/skills';
import type { ActionVisualDefinition, GameState, MapTile } from '../types/game';
import { getPlayerCombatStats } from '../systems/formulas';

export class IdleHeroScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
  private readonly terrain = new THREE.Group();
  private readonly hero = new THREE.Group();
  private readonly target = new THREE.Group();
  private readonly effectStrips = new THREE.Group();
  private readonly particles = new THREE.Group();
  private readonly targetShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 32),
    new THREE.MeshBasicMaterial({ color: '#020617', transparent: true, opacity: 0.38 }),
  );
  private readonly progressFill: THREE.Mesh;
  private readonly progressTrackMaterial = new THREE.MeshBasicMaterial({ color: '#172033' });
  private readonly stageMaterial = new THREE.MeshBasicMaterial({ color: '#122033' });
  private readonly backgroundMaterial = new THREE.MeshBasicMaterial({ color: '#07111f' });
  private animationId = 0;
  private latestState: GameState | null = null;
  private targetKey = '';
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.z = 10;

    const background = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), this.backgroundMaterial);
    background.position.z = -5;
    this.scene.add(background);

    this.createWorldBackdrop();
    this.scene.add(this.terrain);

    const stage = new THREE.Mesh(new THREE.CircleGeometry(4.3, 64), this.stageMaterial);
    stage.scale.y = 0.45;
    stage.position.set(0, -0.8, -3);
    this.scene.add(stage);

    this.createHero();
    this.targetShadow.scale.y = 0.22;
    this.targetShadow.position.set(1.45, -1.12, -0.4);
    this.scene.add(this.targetShadow);
    this.scene.add(this.hero);
    this.scene.add(this.target);
    this.createEffectStrips();
    this.scene.add(this.effectStrips);
    this.createParticles();
    this.scene.add(this.particles);

    const progressTrack = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.14), this.progressTrackMaterial);
    progressTrack.position.set(0, -3.35, 0);
    this.scene.add(progressTrack);
    this.progressFill = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.14), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
    this.progressFill.position.set(-2.1, -3.35, 0.1);
    this.progressFill.scale.x = 0.001;
    this.progressFill.geometry.translate(0.5, 0, 0);
    this.scene.add(this.progressFill);
  }

  updateState(state: GameState): void {
    this.latestState = state;
  }

  start(): void {
    const render = (time: number) => {
      if (this.disposed) return;
      this.animationId = window.requestAnimationFrame(render);
      this.resize();
      this.updateVisuals(time);
      this.renderer.render(this.scene, this.camera);
    };
    this.animationId = window.requestAnimationFrame(render);
  }

  dispose(): void {
    this.disposed = true;
    window.cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else material?.dispose?.();
    });
  }

  private resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    const drawingBuffer = this.renderer.getSize(new THREE.Vector2());
    if (drawingBuffer.x === width && drawingBuffer.y === height) return;

    this.renderer.setSize(width, height, false);
    const aspect = width / Math.max(1, height);
    this.camera.left = -6.2 * aspect;
    this.camera.right = 6.2 * aspect;
    this.camera.top = 5.1;
    this.camera.bottom = -5.1;
    this.camera.updateProjectionMatrix();
  }

  private createHero(): void {
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshBasicMaterial({ color: '#020617', transparent: true, opacity: 0.42 }));
    shadow.scale.y = 0.18;
    shadow.position.set(0, -0.84, -0.2);
    const cape = new THREE.Mesh(new THREE.CircleGeometry(0.54, 5), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
    cape.scale.set(0.8, 1.15, 1);
    cape.position.set(-0.24, -0.02, -0.08);
    cape.rotation.z = 0.36;
    const body = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
    body.scale.y = 1.18;
    const chest = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), new THREE.MeshBasicMaterial({ color: '#14b8a6' }));
    chest.scale.y = 0.72;
    chest.position.set(0.1, 0.05, 0.12);
    const head = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), new THREE.MeshBasicMaterial({ color: '#f8fafc' }));
    head.position.set(0, 0.66, 0.1);
    const visor = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.08), new THREE.MeshBasicMaterial({ color: '#07111f' }));
    visor.position.set(0.06, 0.69, 0.18);
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.3), new THREE.MeshBasicMaterial({ color: '#cbd5e1' }));
    blade.position.set(0.62, 0.1, 0.1);
    blade.rotation.z = -0.35;
    const guard = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.09), new THREE.MeshBasicMaterial({ color: '#facc15' }));
    guard.position.set(0.45, -0.18, 0.15);
    guard.rotation.z = -0.35;

    this.hero.add(shadow, cape, body, chest, head, visor, blade, guard);
    this.hero.position.set(-1.6, -0.35, 0);
  }

  private createParticles(): void {
    for (let index = 0; index < 28; index += 1) {
      const particle = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12 + Math.random() * 0.22, 0.018 + Math.random() * 0.018),
        new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? '#38bdf8' : index % 3 === 1 ? '#facc15' : '#22c55e', transparent: true, opacity: 0.28 }),
      );
      particle.position.set(-4 + Math.random() * 8, -2.4 + Math.random() * 4.4, -1);
      particle.rotation.z = -0.55 + Math.random() * 0.35;
      this.particles.add(particle);
    }
  }

  private createWorldBackdrop(): void {
    const farBand = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.1), new THREE.MeshBasicMaterial({ color: '#0f2535', transparent: true, opacity: 0.78 }));
    farBand.position.set(0, -2.45, -4.7);
    this.terrain.add(farBand);

    const ridgeMaterial = new THREE.MeshBasicMaterial({ color: '#14384a', transparent: true, opacity: 0.72 });
    for (let index = 0; index < 9; index += 1) {
      const ridge = new THREE.Mesh(new THREE.ConeGeometry(1.2 + (index % 3) * 0.35, 2.7 + (index % 2) * 0.55, 3), ridgeMaterial.clone());
      ridge.position.set(-8.2 + index * 2.1, -1.75 + (index % 2) * 0.16, -4.2);
      ridge.rotation.z = Math.PI;
      ridge.scale.x = 1.2;
      this.terrain.add(ridge);
    }

    const frontMaterial = new THREE.MeshBasicMaterial({ color: '#0b2f2e', transparent: true, opacity: 0.82 });
    for (let index = 0; index < 7; index += 1) {
      const slab = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.18), frontMaterial.clone());
      slab.position.set(-5.8 + index * 1.95, -2.98 + Math.sin(index) * 0.12, -2.7);
      slab.rotation.z = Math.sin(index * 2) * 0.18;
      this.terrain.add(slab);
    }
  }

  private createEffectStrips(): void {
    for (let index = 0; index < 9; index += 1) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.045),
        new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0 }),
      );
      strip.position.z = 0.6;
      this.effectStrips.add(strip);
    }
  }

  private updateVisuals(time: number): void {
    const state = this.latestState;
    if (!state) return;

    const pulse = Math.sin(time * 0.004) * 0.05;
    this.hero.position.y = -0.35 + pulse;
    this.hero.rotation.z = Math.sin(time * 0.002) * 0.025;

    const visual = this.getCurrentVisual(state);
    if (visual.key !== this.targetKey) {
      this.rebuildTarget(visual.key, visual.definition, visual.isMonster);
    }

    const activityPulse = visual.progress > 0.05 ? Math.sin(time * 0.012) * 0.05 * visual.progress : 0;
    this.target.position.set(1.45, -0.35 + Math.sin(time * 0.003) * 0.06, 0);
    this.target.scale.setScalar(1 + activityPulse);
    this.target.rotation.z = visual.isMonster ? Math.sin(time * 0.002) * 0.06 : Math.sin(time * 0.0014) * 0.025;
    this.targetShadow.scale.x = 1 + visual.progress * 0.22;
    this.targetShadow.scale.y = 0.2 + visual.progress * 0.05;

    const color = new THREE.Color(visual.definition.color);
    this.stageMaterial.color.copy(color).lerp(new THREE.Color('#122033'), 0.6);
    this.backgroundMaterial.color.copy(color).lerp(new THREE.Color('#07111f'), 0.82);
    this.progressTrackMaterial.color.copy(color).lerp(new THREE.Color('#172033'), 0.78);
    (this.progressFill.material as THREE.MeshBasicMaterial).color.copy(color);

    this.progressFill.scale.x = Math.max(0.001, visual.progress);
    this.updateEffectStrips(time, visual.progress, color, visual.isMonster);

    this.particles.children.forEach((child, index) => {
      child.position.y += Math.sin(time * 0.001 + index) * 0.0015;
      child.position.x += 0.002 + Math.cos(time * 0.0008 + index) * 0.0012;
      if (child.position.x > 5.2) child.position.x = -5.2;
      child.rotation.z += 0.0008;
    });
  }

  private updateEffectStrips(time: number, progress: number, color: THREE.Color, isMonster: boolean): void {
    this.effectStrips.children.forEach((child, index) => {
      const strip = child as THREE.Mesh;
      const angle = (index / this.effectStrips.children.length) * Math.PI * 2 + time * 0.0015;
      const radius = 0.75 + progress * 0.75 + (index % 3) * 0.08;
      strip.position.set(1.45 + Math.cos(angle) * radius, -0.35 + Math.sin(angle) * radius * 0.45, 0.55);
      strip.rotation.z = angle + (isMonster ? 0.9 : 0.35);
      strip.scale.x = 0.45 + progress * 1.2;
      strip.scale.y = isMonster ? 1.3 : 1;
      const material = strip.material as THREE.MeshBasicMaterial;
      material.opacity = progress > 0.03 ? 0.12 + progress * (isMonster ? 0.34 : 0.22) : 0;
      material.color.copy(color).lerp(new THREE.Color(index % 2 === 0 ? '#facc15' : '#ffffff'), 0.2);
    });
  }

  private getCurrentVisual(state: GameState): { key: string; definition: ActionVisualDefinition; progress: number; isMonster: boolean } {
    if (state.combat.mode !== 'idle' && state.combat.activeMonsterId) {
      const monster = monstersById[state.combat.activeMonsterId];
      const playerStats = getPlayerCombatStats(state);
      return {
        key: `monster-${monster.id}`,
        definition: { targetName: monster.name, color: monster.color, shape: 'field' },
        progress: Math.min(1, state.combat.playerProgressMs / playerStats.attackIntervalMs),
        isMonster: true,
      };
    }

    if (state.activeView === 'map' || state.map.destination || state.map.activePuzzleId) {
      const coord = state.map.destination ?? state.map.position;
      const tileKey = coordKey(coord);
      const tile = state.map.knownTiles[tileKey] ?? generateMapTile(state.map.seed, coord);
      return {
        key: `map-${tile.key}-${tile.type}`,
        definition: { targetName: tile.name, color: tile.color, shape: this.getMapTileShape(tile) },
        progress: state.map.destination ? Math.min(1, state.map.travelProgressMs / Math.max(1, state.map.travelIntervalMs)) : state.map.activePuzzleId ? 0.72 : 0.2,
        isMonster: false,
      };
    }

    if (state.activeActionId) {
      const action = actionsById[state.activeActionId];
      return {
        key: `action-${action.id}`,
        definition: action.visual,
        progress: Math.min(1, state.actionProgressMs / action.intervalMs),
        isMonster: false,
      };
    }

    const skill = skillsById[state.selectedSkill];
    return {
      key: `idle-${skill.id}`,
      definition: { targetName: skill.name, color: skill.color, shape: 'field' },
      progress: 0.001,
      isMonster: false,
    };
  }

  private getMapTileShape(tile: MapTile): ActionVisualDefinition['shape'] {
    if (tile.type === 'grove') return 'tree';
    if (tile.type === 'mine') return 'rock';
    if (tile.type === 'coast') return 'water';
    if (tile.type === 'shrine' || tile.type === 'puzzle' || tile.type === 'ruins') return 'runes';
    if (tile.type === 'treasure' || tile.type === 'npc') return 'workbench';
    if (tile.type === 'boss' || tile.type === 'encounter') return 'field';
    return 'field';
  }

  private rebuildTarget(key: string, visual: ActionVisualDefinition, isMonster: boolean): void {
    this.targetKey = key;
    while (this.target.children.length) {
      const child = this.target.children.pop();
      if (!child) break;
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else material?.dispose?.();
    }

    const color = new THREE.Color(visual.color);
    const mainMaterial = new THREE.MeshBasicMaterial({ color });
    const lightMaterial = new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color('#ffffff'), 0.45) });
    const darkMaterial = new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color('#020617'), 0.5) });

    if (isMonster) {
      const body = new THREE.Mesh(new THREE.CircleGeometry(0.7, 8), mainMaterial);
      body.scale.y = 1.12;
      const core = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), lightMaterial);
      core.position.set(0.12, 0.12, 0.1);
      const base = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.18), darkMaterial);
      base.position.set(0, -0.72, -0.1);
      this.target.add(body, core, base);
      return;
    }

    if (visual.shape === 'tree') {
      const trunk = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.05), darkMaterial);
      trunk.position.set(0, -0.35, 0);
      const crown = new THREE.Mesh(new THREE.CircleGeometry(0.82, 7), mainMaterial);
      crown.position.set(0, 0.35, 0.1);
      const crownLight = new THREE.Mesh(new THREE.CircleGeometry(0.42, 7), lightMaterial);
      crownLight.position.set(0.24, 0.55, 0.2);
      this.target.add(trunk, crown, crownLight);
      return;
    }

    if (visual.shape === 'rock') {
      const rock = new THREE.Mesh(new THREE.CircleGeometry(0.78, 6), mainMaterial);
      rock.scale.y = 0.74;
      const chip = new THREE.Mesh(new THREE.CircleGeometry(0.26, 5), lightMaterial);
      chip.position.set(0.25, 0.15, 0.1);
      this.target.add(rock, chip);
      return;
    }

    if (visual.shape === 'water') {
      const pool = new THREE.Mesh(new THREE.CircleGeometry(0.78, 32), mainMaterial);
      pool.scale.y = 0.42;
      const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.08), lightMaterial);
      shine.position.set(0.08, 0.08, 0.1);
      this.target.add(pool, shine);
      return;
    }

    if (visual.shape === 'flame') {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.25, 5), mainMaterial);
      flame.rotation.z = Math.PI;
      const center = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.75, 5), lightMaterial);
      center.rotation.z = Math.PI;
      center.position.set(0.08, -0.05, 0.1);
      this.target.add(flame, center);
      return;
    }

    if (visual.shape === 'forge' || visual.shape === 'workbench') {
      const bench = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.5), mainMaterial);
      bench.position.set(0, -0.25, 0);
      const block = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.62), darkMaterial);
      block.position.set(0.08, 0.18, 0.1);
      const spark = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), lightMaterial);
      spark.position.set(0.42, 0.48, 0.2);
      this.target.add(bench, block, spark);
      return;
    }

    if (visual.shape === 'runes') {
      const altar = new THREE.Mesh(new THREE.CircleGeometry(0.7, 6), mainMaterial);
      const core = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lightMaterial);
      core.position.z = 0.1;
      const base = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.18), darkMaterial);
      base.position.set(0, -0.58, -0.1);
      this.target.add(altar, core, base);
      return;
    }

    const marker = new THREE.Mesh(new THREE.CircleGeometry(0.68, 16), mainMaterial);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), lightMaterial);
    inner.position.z = 0.1;
    this.target.add(marker, inner);
  }
}
