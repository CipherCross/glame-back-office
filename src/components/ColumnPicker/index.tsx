import { columnLabel } from 'lib/reporting';
import { t } from 'lib/i18n';
import type { ReportColumn } from 'common/types';
import type { ColumnPickerProps } from 'common/interfaces/ColumnPicker';

export default function ColumnPicker({ columns, selected, onChange, locale }: ColumnPickerProps) {
  function toggle(column: ReportColumn) {
    const next = selected.includes(column) ? selected.filter((item) => item !== column) : [...selected, column];
    if (next.length) onChange(next);
  }
  return (
    <details className="column-picker">
      <summary>
        {t(locale, 'columnPicker')}{' '}
        <span>
          {selected.length} {t(locale, 'selected')}
        </span>
      </summary>
      <div className="column-list">
        {columns.map((column) => (
          <label key={column}>
            <input type="checkbox" checked={selected.includes(column)} onChange={() => toggle(column)} />
            {columnLabel(locale, column)}
          </label>
        ))}
      </div>
    </details>
  );
}
