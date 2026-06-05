/* ============================================
   BarangayConnect — Pipeline Component
   ============================================ */

import { getPipelineState } from '../utils.js';

export function renderPipeline(status) {
  const steps = getPipelineState(status);

  const stepsHTML = steps.map((step, i) => {
    const stateClass = step.state;
    const icon = step.state === 'done' ? '✓' : step.state === 'active' ? '⏳' : '⚬';

    const stepHTML = `
      <div class="pipeline-step ${stateClass}">
        <div class="pipeline-step-dot">${icon}</div>
        <span class="pipeline-step-label">${step.label}</span>
      </div>
    `;

    if (i < steps.length - 1) {
      const connectorState = step.state === 'done' ? 'done' : (step.state === 'active' ? 'active' : '');
      return `${stepHTML}<div class="pipeline-connector ${connectorState}"></div>`;
    }

    return stepHTML;
  }).join('');

  return `<div class="pipeline">${stepsHTML}</div>`;
}
