import * as THREE from 'three';
import { coordKey, generateMapTile, getVisibleCoords, isAdjacentCoord, isSameCoord, mapTileMeta, MAP_VIEW_RADIUS } from '../data/map';
import type { GameState, MapCoord, MapTile, MapTileKey } from '../types/game';

interface TileEntry {
  group: THREE.Group;
  fill: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  edge: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>;
  key: MapTileKey;
  current: boolean;
  destination: boolean;
  selected: boolean;
  adjacent: boolean;
}

export interface MapSceneCallbacks {
  onSelectTile: (coord: MapCoord) => void;
  onTravelTo: (coord: MapCoord) => void;
  onHoverTile?: (coord: MapCoord | null, key: MapTileKey | null) => void;
}

const HEX_RADIUS = 0.54;
const HEX_WIDTH = HEX_RADIUS * 1.52;
const HEX_HEIGHT = HEX_RADIUS * Math.sqrt(3);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function disposeMaterial(material: THREE.Material | THREE.Material[] | undefined): void {
  if (!material) return;
  const disposeOne = (entry: THREE.Material) => {
    const spriteMaterial = entry as THREE.SpriteMaterial;
    spriteMaterial.map?.dispose();
    entry.dispose();
  };
  if (Array.isArray(material)) material.forEach(disposeOne);
  else disposeOne(material);
}

export class MapScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-7, 7, 4.8, -4.8, 0.1, 100);
  private readonly tileGroup = new THREE.Group();
  private readonly effectsGroup = new THREE.Group();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly hexGeometry = new THREE.CircleGeometry(HEX_RADIUS, 6);
  private readonly hexEdgesGeometry: THREE.EdgesGeometry;
  private readonly tileMeshes: THREE.Mesh[] = [];
  private readonly tileEntries = new Map<MapTileKey, TileEntry>();
  private readonly cameraTarget = new THREE.Vector3(0, 0, 10);
  private readonly playerMarker = new THREE.Group();
  private readonly travelTrail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({ color: '#f97316', transparent: true, opacity: 0 }),
  );

  private callbacks: MapSceneCallbacks;
  private latestState: GameState | null = null;
  private animationId = 0;
  private disposed = false;
  private tileSignature = '';
  private hoveredKey: MapTileKey | null = null;
  private lastPositionKey = '';
  private pointerDown = false;
  private pointerStart = { x: 0, y: 0 };
  private pointerLast = { x: 0, y: 0 };
  private dragDistance = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: MapSceneCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.canvas.style.touchAction = 'none';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.copy(this.cameraTarget);
    this.hexGeometry.rotateZ(Math.PI / 6);
    this.hexEdgesGeometry = new THREE.EdgesGeometry(this.hexGeometry);

    this.createBackdrop();
    this.createPlayerMarker();
    this.travelTrail.position.z = 1.1;
    this.scene.add(this.tileGroup, this.effectsGroup, this.travelTrail, this.playerMarker);

    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  updateCallbacks(callbacks: MapSceneCallbacks): void {
    this.callbacks = callbacks;
  }

  updateState(state: GameState): void {
    this.latestState = state;
    const signature = this.getTileSignature(state);
    if (signature !== this.tileSignature) {
      this.tileSignature = signature;
      this.rebuildTiles(state);
    }

    const positionKey = coordKey(state.map.position);
    if (positionKey !== this.lastPositionKey) {
      this.lastPositionKey = positionKey;
      this.centerOnPlayer();
    }
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

  centerOnPlayer(): void {
    this.cameraTarget.set(0, 0, 10);
  }

  zoomIn(): void {
    this.camera.zoom = clamp(this.camera.zoom * 1.18, 0.72, 2.4);
    this.camera.updateProjectionMatrix();
  }

  zoomOut(): void {
    this.camera.zoom = clamp(this.camera.zoom / 1.18, 0.72, 2.4);
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.disposed = true;
    window.cancelAnimationFrame(this.animationId);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.clearTiles();
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose?.();
      disposeMaterial(mesh.material as THREE.Material | THREE.Material[] | undefined);
    });
    this.hexGeometry.dispose();
    this.hexEdgesGeometry.dispose();
    this.renderer.dispose();
  }

  private createBackdrop(): void {
    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 22),
      new THREE.MeshBasicMaterial({ color: '#07111d', transparent: true, opacity: 0.86 }),
    );
    background.position.z = -3;
    this.scene.add(background);

    const ringMaterial = new THREE.LineBasicMaterial({ color: '#334155', transparent: true, opacity: 0.16 });
    for (let index = 0; index < 7; index += 1) {
      const ring = new THREE.LineLoop(new THREE.CircleGeometry(1.4 + index * 1.15, 96), ringMaterial.clone());
      ring.position.z = -2.4;
      this.effectsGroup.add(ring);
    }
  }

  private createPlayerMarker(): void {
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.34, 28), new THREE.MeshBasicMaterial({ color: '#020617', transparent: true, opacity: 0.45 }));
    shadow.scale.y = 0.36;
    shadow.position.set(0, -0.12, -0.08);
    const body = new THREE.Mesh(new THREE.CircleGeometry(0.24, 28), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
    body.position.z = 0.1;
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), new THREE.MeshBasicMaterial({ color: '#fde68a' }));
    core.position.z = 0.2;
    const pointer = new THREE.Mesh(new THREE.CircleGeometry(0.16, 3), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
    pointer.rotation.z = Math.PI;
    pointer.position.set(0, -0.25, 0.08);
    this.playerMarker.add(shadow, pointer, body, core);
    this.playerMarker.position.z = 1.8;
  }

  private resize(): void {
    const width = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || 640;
    const height = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || 420;
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x !== width || size.y !== height) {
      this.renderer.setSize(width, height, false);
      const aspect = width / Math.max(1, height);
      const viewHeight = 9.4;
      this.camera.left = (-viewHeight * aspect) / 2;
      this.camera.right = (viewHeight * aspect) / 2;
      this.camera.top = viewHeight / 2;
      this.camera.bottom = -viewHeight / 2;
      this.camera.updateProjectionMatrix();
    }
  }

  private getTileSignature(state: GameState): string {
    const positionKey = coordKey(state.map.position);
    const destinationKey = state.map.destination ? coordKey(state.map.destination) : 'none';
    const visibleState = getVisibleCoords(state.map.position, MAP_VIEW_RADIUS)
      .map((coord) => {
        const key = coordKey(coord);
        return `${key}:${state.map.revealed[key] ? 1 : 0}:${state.map.completed[key] ? 1 : 0}`;
      })
      .join('|');

    return [state.map.seed, positionKey, destinationKey, state.map.selectedTileKey ?? 'none', state.map.activePuzzleId ?? 'none', visibleState].join(';');
  }

  private rebuildTiles(state: GameState): void {
    this.clearTiles();
    const destinationKey = state.map.destination ? coordKey(state.map.destination) : null;
    const selectedKey = state.map.selectedTileKey;
    const coords = getVisibleCoords(state.map.position, MAP_VIEW_RADIUS);

    coords.forEach((coord) => {
      const key = coordKey(coord);
      const tile = state.map.knownTiles[key] ?? generateMapTile(state.map.seed, coord);
      const revealed = Boolean(state.map.revealed[key]);
      const completed = Boolean(state.map.completed[key]);
      const current = isSameCoord(coord, state.map.position);
      const destination = destinationKey === key;
      const selected = selectedKey === key;
      const adjacent = isAdjacentCoord(state.map.position, coord);
      const entry = this.createTileEntry(tile, revealed, completed, current, destination, selected, adjacent);
      entry.group.position.copy(this.coordToWorld(coord, state.map.position));
      this.tileGroup.add(entry.group);
      this.tileEntries.set(key, entry);
      this.tileMeshes.push(entry.fill);
    });
  }

  private createTileEntry(tile: MapTile, revealed: boolean, completed: boolean, current: boolean, destination: boolean, selected: boolean, adjacent: boolean): TileEntry {
    const palette = this.getPalette(tile, revealed, completed, current, destination, selected, adjacent);
    const group = new THREE.Group();
    const fill = new THREE.Mesh(
      this.hexGeometry,
      new THREE.MeshBasicMaterial({ color: palette.fill, transparent: true, opacity: palette.opacity, depthWrite: false }),
    );
    fill.userData = { coord: tile.coord, key: tile.key, revealed, adjacent, current };
    const edge = new THREE.LineSegments(
      this.hexEdgesGeometry,
      new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: palette.edgeOpacity }),
    );
    edge.position.z = 0.05;
    group.add(fill, edge);

    const marker = this.getTileMarker(tile, revealed, completed, current);
    if (marker) {
      const sprite = this.createTextSprite(marker.label, marker.color, marker.background);
      sprite.position.set(0, marker.offsetY, 0.7);
      sprite.scale.setScalar(marker.scale);
      group.add(sprite);
    }

    return { group, fill, edge, key: tile.key, current, destination, selected, adjacent };
  }

  private getPalette(tile: MapTile, revealed: boolean, completed: boolean, current: boolean, destination: boolean, selected: boolean, adjacent: boolean): { fill: THREE.Color; edge: THREE.Color; opacity: number; edgeOpacity: number } {
    if (!revealed) {
      return {
        fill: new THREE.Color('#1f2937'),
        edge: new THREE.Color('#94a3b8'),
        opacity: 0.38,
        edgeOpacity: 0.5,
      };
    }

    const tileColor = new THREE.Color(tile.color);
    const fill = new THREE.Color('#0f172a').lerp(tileColor, completed ? 0.28 : 0.54);
    const edge = tileColor.clone().lerp(new THREE.Color('#ffffff'), adjacent ? 0.38 : 0.15);

    if (current) {
      fill.copy(new THREE.Color('#22c55e').lerp(new THREE.Color('#38bdf8'), 0.42));
      edge.set('#e0f2fe');
    } else if (destination) {
      fill.lerp(new THREE.Color('#f59e0b'), 0.34);
      edge.set('#fed7aa');
    } else if (selected) {
      fill.lerp(new THREE.Color('#facc15'), 0.18);
      edge.set('#fde68a');
    }

    return {
      fill,
      edge,
      opacity: completed ? 0.62 : 0.86,
      edgeOpacity: selected || current || destination ? 0.95 : adjacent ? 0.74 : 0.46,
    };
  }

  private getTileMarker(tile: MapTile, revealed: boolean, completed: boolean, current: boolean): { label: string; color: string; background: string; scale: number; offsetY: number } | null {
    if (current) return null;
    if (!revealed) return { label: '?', color: '#f59e0b', background: '#111827', scale: 0.5, offsetY: 0 };
    if (completed && tile.type !== 'origin') return { label: 'OK', color: '#bbf7d0', background: '#052e16', scale: 0.38, offsetY: 0 };
    if (tile.secret) return { label: '?', color: '#fde68a', background: '#3b2604', scale: 0.5, offsetY: 0.02 };

    const labels: Partial<Record<MapTile['type'], string>> = {
      boss: 'B',
      encounter: '!',
      puzzle: '?',
      treasure: '$',
      npc: 'N',
      shrine: '*',
      ruins: 'R',
      locked: 'X',
      origin: 'C',
    };
    const label = labels[tile.type];
    if (!label) return null;
    return { label, color: '#ffffff', background: tile.color, scale: 0.46, offsetY: 0.02 };
  }

  private createTextSprite(label: string, color: string, background: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.arc(64, 64, 46, 0, Math.PI * 2);
      context.fillStyle = background;
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = 'rgba(255,255,255,0.72)';
      context.stroke();
      context.fillStyle = color;
      context.font = label.length > 1 ? '800 36px Arial' : '900 58px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(label, 64, label.length > 1 ? 66 : 62);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    return new THREE.Sprite(material);
  }

  private coordToWorld(coord: MapCoord, center: MapCoord): THREE.Vector3 {
    const q = coord.x - center.x;
    const r = coord.y - center.y;
    return new THREE.Vector3(q * HEX_WIDTH, -(r + q * 0.5) * HEX_HEIGHT, 0);
  }

  private clearTiles(): void {
    this.tileGroup.traverse((object) => {
      const mesh = object as THREE.Mesh;
      disposeMaterial(mesh.material as THREE.Material | THREE.Material[] | undefined);
    });
    this.tileGroup.clear();
    this.tileEntries.clear();
    this.tileMeshes.length = 0;
  }

  private updateVisuals(time: number): void {
    const state = this.latestState;
    if (!state) return;

    this.camera.position.lerp(this.cameraTarget, 0.12);
    this.updateTileAnimations(time);
    this.updatePlayerMarker(time, state);
    this.effectsGroup.rotation.z = Math.sin(time * 0.00012) * 0.035;
  }

  private updateTileAnimations(time: number): void {
    this.tileEntries.forEach((entry) => {
      const hovered = entry.key === this.hoveredKey;
      const pulse = Math.sin(time * 0.006) * 0.035;
      const baseScale = entry.current ? 1.08 : entry.destination ? 1.06 + pulse : entry.selected ? 1.045 : entry.adjacent ? 1.015 : 1;
      entry.group.scale.setScalar(hovered ? baseScale + 0.05 : baseScale);
      const material = entry.edge.material;
      if (entry.destination || hovered) material.opacity = 0.9 + Math.sin(time * 0.01) * 0.08;
    });
  }

  private updatePlayerMarker(time: number, state: GameState): void {
    const start = this.coordToWorld(state.map.position, state.map.position);
    const destination = state.map.destination ? this.coordToWorld(state.map.destination, state.map.position) : null;
    const progress = state.map.destination ? clamp(state.map.travelProgressMs / Math.max(1, state.map.travelIntervalMs), 0, 1) : 0;
    const position = destination ? start.clone().lerp(destination, progress) : start;
    this.playerMarker.position.x = position.x;
    this.playerMarker.position.y = position.y + 0.08 + Math.sin(time * 0.006) * 0.035;
    this.playerMarker.scale.setScalar(1 + Math.sin(time * 0.01) * 0.035);

    const trailMaterial = this.travelTrail.material as THREE.LineBasicMaterial;
    if (destination) {
      this.travelTrail.geometry.dispose();
      this.travelTrail.geometry = new THREE.BufferGeometry().setFromPoints([start, position]);
      trailMaterial.opacity = 0.76;
    } else {
      trailMaterial.opacity = 0;
    }
  }

  private updatePointer(event: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
  }

  private pickTile(event: PointerEvent): THREE.Mesh | null {
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.tileMeshes, false);
    return (hits[0]?.object as THREE.Mesh | undefined) ?? null;
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.pointerDown = true;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.pointerLast = { x: event.clientX, y: event.clientY };
    this.dragDistance = 0;
    this.canvas.setPointerCapture?.(event.pointerId);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (this.pointerDown) {
      const dx = event.clientX - this.pointerLast.x;
      const dy = event.clientY - this.pointerLast.y;
      this.pointerLast = { x: event.clientX, y: event.clientY };
      this.dragDistance += Math.hypot(dx, dy);
      if (this.dragDistance > 4) {
        const rect = this.canvas.getBoundingClientRect();
        const worldWidth = (this.camera.right - this.camera.left) / this.camera.zoom;
        const worldHeight = (this.camera.top - this.camera.bottom) / this.camera.zoom;
        this.cameraTarget.x -= (dx / Math.max(1, rect.width)) * worldWidth;
        this.cameraTarget.y += (dy / Math.max(1, rect.height)) * worldHeight;
      }
      return;
    }

    const mesh = this.pickTile(event);
    const key = (mesh?.userData?.key as MapTileKey | undefined) ?? null;
    if (key !== this.hoveredKey) {
      this.hoveredKey = key;
      const coord = mesh?.userData?.coord as MapCoord | undefined;
      this.callbacks.onHoverTile?.(coord ?? null, key);
    }
  };

  private handlePointerUp = (event: PointerEvent): void => {
    this.pointerDown = false;
    this.canvas.releasePointerCapture?.(event.pointerId);
    if (this.dragDistance > 6) return;

    const mesh = this.pickTile(event);
    if (!mesh || !this.latestState) return;
    const coord = mesh.userData.coord as MapCoord;
    const revealed = Boolean(mesh.userData.revealed);
    const adjacent = Boolean(mesh.userData.adjacent);
    const current = Boolean(mesh.userData.current);

    if (revealed && adjacent && !current && !this.latestState.map.destination && this.latestState.combat.mode === 'idle') {
      this.callbacks.onTravelTo(coord);
      return;
    }

    this.callbacks.onSelectTile(coord);
  };

  private handlePointerLeave = (): void => {
    this.pointerDown = false;
    this.hoveredKey = null;
    this.callbacks.onHoverTile?.(null, null);
  };

  private handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  };
}
