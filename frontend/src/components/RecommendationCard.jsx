import { Bot, TrainFront } from "lucide-react";

export function RecommendationCard({ recommendation, onAccept }) {
  return (
    <div className="card ai-card" data-reveal>
      <h3><Bot size={24} /> AI Recommendation for You</h3>
      <div className="ai-panel">
        <p className="prediction">{recommendation.prediction}</p>
        <div className="choice">
          <TrainFront size={44} />
          <div>
            <strong>{recommendation.recommendation} today</strong>
            <p>You’ll save <b>{recommendation.impact_percent}%</b> emissions with {Math.round(recommendation.confidence * 100)}% model confidence.</p>
            <button onClick={onAccept}>Accept Challenge</button>
          </div>
        </div>
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.2))', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary, #aaa)' }}>
          <div><strong>Engine:</strong> {recommendation.model}</div>
          <div><strong>Latency:</strong> {recommendation.latency_ms}ms</div>
          {recommendation.fallback_reason && (
            <div style={{ color: '#ff6b6b', marginTop: '4px' }}>
              <strong>Fallback Triggered:</strong> {recommendation.fallback_reason}
            </div>
          )}
        </div>
        <a href="#simulation" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>See other options</a>
      </div>
    </div>
  );
}
