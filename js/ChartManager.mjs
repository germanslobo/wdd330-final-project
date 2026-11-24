let rateChartInstance = null;

/**
 * Renders or updates a historical exchange rate line chart inside a canvas element.
 * @param {HTMLCanvasElement} canvasEl
 * @param {Array<{date: string, rate: number}>} points
 * @param {string} labelText
 */
export function renderRateChart(canvasEl, points, labelText) {
  if (!canvasEl || typeof window.Chart === 'undefined') {
    return;
  }

  const ctx = canvasEl.getContext('2d');
  const labels = points.map((item) => item.date);
  const values = points.map((item) => item.rate);

  if (rateChartInstance) {
    rateChartInstance.destroy();
  }

  rateChartInstance = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: labelText,
          data: values,
          borderColor: '#1E3A8A',
          backgroundColor: 'rgba(16, 185, 129, 0.18)',
          borderWidth: 2,
          pointRadius: 2.5,
          tension: 0.2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10,
          },
        },
      },
    },
  });
}