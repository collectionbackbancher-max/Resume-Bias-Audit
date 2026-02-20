import Plot from 'react-plotly.js';

interface HeatmapProps {
  text: string;
  flags: { description: string; severity: string }[];
}

export function BiasHeatmap({ text, flags }: HeatmapProps) {
  // Simple heuristic: split text into paragraphs and count bias density
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const density = paragraphs.map(p => {
    let count = 0;
    flags.forEach(f => {
      const phrase = f.description.match(/"([^"]+)"/)?.[1];
      if (phrase && p.toLowerCase().includes(phrase.toLowerCase())) {
        count += f.severity === 'High' ? 3 : f.severity === 'Moderate' ? 2 : 1;
      }
    });
    return count;
  });

  return (
    <div className="w-full h-[300px] border rounded-xl overflow-hidden bg-white">
      <Plot
        data={[
          {
            z: [density],
            type: 'heatmap',
            colorscale: [
              [0, '#f8fafc'],
              [0.2, '#fee2e2'],
              [0.5, '#ef4444'],
              [1, '#991b1b']
            ],
            showscale: false,
            hoverinfo: 'none'
          }
        ]}
        layout={{
          autosize: true,
          margin: { t: 0, b: 0, l: 0, r: 0 },
          xaxis: { visible: false },
          yaxis: { visible: false },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
