import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import fcose from 'cytoscape-fcose';
import { Maximize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { GrafosGraphElement, GrafosLayoutMode } from '../../types/grafos-graph';

cytoscape.use(dagre);
cytoscape.use(fcose);

const colors: Record<string, string> = {
  TAXONOMY: '#97C2FC',
  TOPIC: '#FFD54F',
  SUBTOPIC: '#FFB74D',
};

function convert(elements: GrafosGraphElement[]): ElementDefinition[] {
  return elements.map(({ data }) => {
    if ('label' in data) return { group: 'nodes', data, classes: data.origin };
    return { group: 'edges', data };
  });
}

export function ClassifierGraph({ elements }: { readonly elements: GrafosGraphElement[] }) {
  const host = useRef<HTMLDivElement>(null);
  const graph = useRef<Core | null>(null);
  const [layout, setLayout] = useState<GrafosLayoutMode>('hierarchical');

  useEffect(() => {
    if (!host.current) return;
    graph.current?.destroy();
    const cy = cytoscape({
      container: host.current,
      elements: convert(elements),
      style: [
        { selector: 'node', style: { label: 'data(label)', 'background-color': (node) => colors[node.data('origin')] ?? colors.TAXONOMY, color: '#1f2937', 'font-size': 10, 'text-wrap': 'wrap', 'text-max-width': 110, 'text-valign': 'bottom', 'text-margin-y': 5, width: 18, height: 18 } },
        { selector: 'node[layer = 0]', style: { shape: 'round-rectangle', width: 70, height: 36, 'font-size': 12 } },
        { selector: 'node[layer = 1]', style: { width: 28, height: 28 } },
        { selector: 'edge', style: { width: 1.5, 'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
      ] as any,
      wheelSensitivity: 0.18,
    });
    graph.current = cy;
    return () => cy.destroy();
  }, [elements]);

  useEffect(() => {
    const cy = graph.current;
    if (!cy) return;
    cy.layout((layout === 'hierarchical'
      ? { name: 'dagre', rankDir: 'TB', nodeSep: 35, rankSep: 90, animate: false }
      : { name: 'fcose', quality: 'default', animate: false, nodeSeparation: 80 }) as any).run();
    cy.fit(undefined, 30);
  }, [layout, elements]);

  return <div className="relative h-[560px] bg-slate-50 dark:bg-neutral-950">
    <div ref={host} className="absolute inset-0" />
    <div className="absolute right-3 top-3 flex gap-2 rounded-lg bg-white/90 p-1 shadow dark:bg-neutral-800/90">
      <button onClick={() => setLayout('hierarchical')} className={`px-2 py-1 text-xs rounded ${layout === 'hierarchical' ? 'bg-eng-blue text-white' : ''}`}>Hierárquico</button>
      <button onClick={() => setLayout('force')} className={`px-2 py-1 text-xs rounded ${layout === 'force' ? 'bg-eng-blue text-white' : ''}`}>Explosão</button>
      <button aria-label="Centralizar grafo" onClick={() => graph.current?.fit(undefined, 30)} className="p-1 text-gray-600"><Maximize2 className="h-4 w-4" /></button>
    </div>
  </div>;
}
