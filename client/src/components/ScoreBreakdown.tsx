import Plot from 'react-plotly.js';

interface ScoreBreakdownProps {
  scores: {
    language: number;
    age: number;
    name: number;
  };
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const categories = ['Language', 'Age', 'Name'];
  const values = [scores.language, scores.age, scores.name];

  return (
    <div className="w-full h-[300px]">
      <Plot
        data={[
          {
            type: 'bar',
            x: categories,
            y: values,
            marker: {
              color: values.map(v => v >= 80 ? '#22c55e' : v >= 60 ? '#eab308' : '#ef4444'),
              line: { width: 0 }
            },
            text: values.map(v => `${v}%`),
            textposition: 'auto',
            hoverinfo: 'none'
          }
        ]}
        layout={{
          autosize: true,
          margin: { t: 30, b: 40, l: 40, r: 20 },
          yaxis: { range: [0, 100], gridcolor: '#f1f5f9' },
          xaxis: { gridcolor: 'rgba(0,0,0,0)' },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { family: 'Inter, sans-serif', size: 12 }
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
