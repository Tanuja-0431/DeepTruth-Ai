import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMetrics } from '../api'
import type { MetricsResponse } from '../api'

export function MetricsDashboard() {
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setError(null)
      const res = await getMetrics()
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const id = setInterval(fetchMetrics, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading && !data) return null

  return (
    <motion.section
      className="metrics-section glass"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h2>Visualization Dashboard</h2>
      {error && <p className="metrics-error">{error}</p>}
      {data && data.n_samples > 0 && (
        <div className="metrics-grid">
          {data.distribution_base64 && (
            <div className="metric-card">
              <h3>Prediction Distribution</h3>
              <img
                src={`data:image/png;base64,${data.distribution_base64}`}
                alt="Distribution"
              />
              <p>Shows how predicted probabilities are distributed. The red line marks the 0.5 threshold.</p>
            </div>
          )}
          {data.roc_base64 && (
            <div className="metric-card">
              <h3>ROC Curve</h3>
              <img src={`data:image/png;base64,${data.roc_base64}`} alt="ROC" />
              <p>
                <strong>What is ROC?</strong> The Receiver Operating Characteristic curve shows the trade-off
                between true positive rate and false positive rate. A curve closer to the top-left indicates better performance.
              </p>
              {data.auc_score != null && (
                <p className="auc-score">AUC: {data.auc_score.toFixed(3)}</p>
              )}
            </div>
          )}
          {data.confusion_base64 && (
            <div className="metric-card">
              <h3>Confusion Matrix</h3>
              <img src={`data:image/png;base64,${data.confusion_base64}`} alt="Confusion Matrix" />
              <p>Shows predicted vs actual classifications. Diagonal cells are correct predictions.</p>
            </div>
          )}
        </div>
      )}
      {data && data.n_samples === 0 && (
        <p className="metrics-empty">Upload and analyze content to see metrics.</p>
      )}
    </motion.section>
  )
}
