import { LocateFixed, Minus, Plus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateMapTile, mapTileMeta, parseCoordKey } from '../data/map';
import type { GameState, MapCoord, MapTileKey } from '../types/game';
import { MapScene, type MapSceneCallbacks } from './MapScene';

interface MapCanvasProps {
  state: GameState;
  onSelectTile: (coord: MapCoord) => void;
  onTravelTo: (coord: MapCoord) => void;
}

export function MapCanvas({ state, onSelectTile, onTravelTo }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<MapScene | null>(null);
  const callbacksRef = useRef<MapSceneCallbacks>({ onSelectTile, onTravelTo });
  const [hoveredKey, setHoveredKey] = useState<MapTileKey | null>(null);

  callbacksRef.current = {
    onSelectTile,
    onTravelTo,
    onHoverTile: (_coord, key) => setHoveredKey(key),
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new MapScene(canvasRef.current, {
      onSelectTile: (coord) => callbacksRef.current.onSelectTile(coord),
      onTravelTo: (coord) => callbacksRef.current.onTravelTo(coord),
      onHoverTile: (coord, key) => callbacksRef.current.onHoverTile?.(coord, key),
    });
    sceneRef.current = scene;
    scene.start();

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateCallbacks({
      onSelectTile: (coord) => callbacksRef.current.onSelectTile(coord),
      onTravelTo: (coord) => callbacksRef.current.onTravelTo(coord),
      onHoverTile: (coord, key) => callbacksRef.current.onHoverTile?.(coord, key),
    });
    sceneRef.current?.updateState(state);
  }, [state]);

  const hoveredTile = useMemo(() => {
    if (!hoveredKey) return null;
    const coord = parseCoordKey(hoveredKey);
    const tile = state.map.knownTiles[hoveredKey] ?? generateMapTile(state.map.seed, coord);
    return {
      tile,
      revealed: Boolean(state.map.revealed[hoveredKey]),
      completed: Boolean(state.map.completed[hoveredKey]),
    };
  }, [hoveredKey, state.map.completed, state.map.knownTiles, state.map.revealed, state.map.seed]);

  return (
    <div className="map-canvas-shell">
      <canvas ref={canvasRef} className="map-canvas" aria-label="Adventure map" />
      <div className="map-overlay-controls" aria-label="Map controls">
        <button className="map-control-button" onClick={() => sceneRef.current?.zoomIn()} title="Zoom in"><Plus size={16} /></button>
        <button className="map-control-button" onClick={() => sceneRef.current?.centerOnPlayer()} title="Center on hero"><LocateFixed size={16} /></button>
        <button className="map-control-button" onClick={() => sceneRef.current?.zoomOut()} title="Zoom out"><Minus size={16} /></button>
      </div>
      <div className="map-canvas-badge">
        <span>Seed</span>
        <strong>{state.map.seed}</strong>
      </div>
      {hoveredTile && (
        <div className="map-hover-card" style={{ '--tile-color': hoveredTile.tile.color } as CSSProperties}>
          <span>{hoveredTile.revealed ? mapTileMeta[hoveredTile.tile.type].label : 'Unknown'}</span>
          <strong>{hoveredTile.revealed ? hoveredTile.tile.name : 'Uncharted fog'}</strong>
          <small>{hoveredTile.completed ? 'Completed' : `${hoveredTile.tile.coord.x},${hoveredTile.tile.coord.y}`}</small>
        </div>
      )}
    </div>
  );
}
