import { escapeHtml } from '../core/dom.js';

/** Stat tile using the existing .stat-card design. tone: 'terracotta' | 'green' */
export function statCardMarkup({ label, value, sub = '', icon = '⭐', tone = 'terracotta' }) {
  return `
    <div class="stat-card">
      <div class="stat-icon-wrapper ${tone}"><span aria-hidden="true">${icon}</span></div>
      <div class="stat-body">
        <span class="stat-label">${escapeHtml(label)}</span>
        <div class="stat-value-row">
          <span class="stat-value">${escapeHtml(value)}</span>
          ${sub ? `<span class="stat-sub-mini">${escapeHtml(sub)}</span>` : ''}
        </div>
      </div>
    </div>`;
}
