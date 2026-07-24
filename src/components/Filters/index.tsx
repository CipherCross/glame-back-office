import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { statusLabel, t } from 'lib/i18n';
import type { DateDimension, ReportFilters } from 'common/types';
import { REPORT_STATUSES } from 'common/constants/Filters';
import type { FiltersProps } from 'common/interfaces/Filters';
import { REPORTS } from 'common/constants/reporting';

export default function Filters({ kind, filters, artists, onChange, onApply, onClear, loading, locale }: FiltersProps) {
  const report = REPORTS[kind];
  const invalidDateRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const dateFormat = locale === 'fr' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
  const statuses = REPORT_STATUSES[kind];
  function update<K extends Exclude<keyof ReportFilters, 'dateDimension'>>(key: K, value: ReportFilters[K]) {
    onChange({ ...filters, [key]: value });
  }
  return (
    <Paper component="section" className="filters" aria-label={t(locale, 'results')} elevation={0}>
      <FormControl fullWidth size="small">
        <InputLabel id="date-dimension-label">{t(locale, 'dateType')}</InputLabel>
        <Select
          labelId="date-dimension-label"
          id="date-dimension"
          value={filters.dateDimension}
          label={t(locale, 'dateType')}
          onChange={(event) => onChange({ ...filters, dateDimension: event.target.value as DateDimension })}
        >
          {report.dimensions.map((dimension) => (
            <MenuItem value={dimension} key={dimension}>
              {t(locale, dimension)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
        <DatePicker
          label={t(locale, 'from')}
          value={filters.from ? dayjs(filters.from) : null}
          {...(filters.to ? { maxDate: dayjs(filters.to) } : {})}
          format={dateFormat}
          onChange={(value) => update('from', value?.format('YYYY-MM-DD') ?? '')}
          slotProps={{ textField: { fullWidth: true, size: 'small', error: invalidDateRange } }}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
        <DatePicker
          label={t(locale, 'to')}
          value={filters.to ? dayjs(filters.to) : null}
          {...(filters.from ? { minDate: dayjs(filters.from) } : {})}
          format={dateFormat}
          onChange={(value) => update('to', value?.format('YYYY-MM-DD') ?? '')}
          slotProps={{ textField: { fullWidth: true, size: 'small', error: invalidDateRange } }}
        />
      </LocalizationProvider>
      <FormControl fullWidth size="small">
        <InputLabel id="artist-label">{t(locale, 'artist')}</InputLabel>
        <Select
          labelId="artist-label"
          id="artist"
          value={filters.artistId}
          label={t(locale, 'artist')}
          onChange={(event) => update('artistId', event.target.value)}
        >
          <MenuItem value="">{t(locale, 'allArtists')}</MenuItem>
          {artists.map((artist) => (
            <MenuItem key={artist.id} value={artist.id}>
              {artist.full_name || artist.email || artist.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="status-label">{t(locale, 'status')}</InputLabel>
        <Select
          labelId="status-label"
          id="status"
          value={filters.status}
          label={t(locale, 'status')}
          onChange={(event) => update('status', event.target.value)}
        >
          <MenuItem value="">{t(locale, 'allStatuses')}</MenuItem>
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {statusLabel(locale, status)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack className="filter-actions" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button variant="contained" onClick={onApply} disabled={loading}>
          {loading ? t(locale, 'updating') : t(locale, 'apply')}
        </Button>
        <Button variant="text" onClick={onClear}>
          {t(locale, 'reset')}
        </Button>
      </Stack>
    </Paper>
  );
}
