import type { ReactNode } from 'react';
import { Moon, Sun, Thermometer, Clock, Bell, Download } from 'lucide-react';
import { useToast } from '../../contexts/toast-context';
import { WeatherAlerts } from '../WeatherAlerts';
import { InstallApp } from '../InstallApp';
import type { CityMeta } from '../../types';
import './Views.css';

type Theme = 'light' | 'dark';
type Unit = 'celsius' | 'fahrenheit';
type TimeFormat = '12h' | '24h';

interface SettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  unit: Unit;
  setUnit: (unit: Unit) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  currentCity: CityMeta | null;
}

function SettingsSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

interface OptionGroupProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** A row of mutually exclusive choices. `aria-pressed` tells assistive technology which is selected. */
function OptionGroup<T extends string>({ label, value, options, onChange }: OptionGroupProps<T>) {
  return (
    <div className="settings-options" role="group" aria-label={label}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`setting-btn${selected ? ' active' : ''}`}
            aria-pressed={selected}
            onClick={() => {
              if (!selected) onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const UNIT_OPTIONS = [
  { value: 'celsius', label: 'Celsius (°C)' },
  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
] as const;

const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12-Hour (AM/PM)' },
  { value: '24h', label: '24-Hour' },
] as const;

export function Settings({
  theme,
  setTheme,
  unit,
  setUnit,
  timeFormat,
  setTimeFormat,
  currentCity,
}: SettingsProps) {
  const { showToast } = useToast();

  return (
    <div className="view-container animate-fade-up">
      <div className="view-header">
        <h1>Settings & Preferences</h1>
      </div>
      <div className="view-content">
        <SettingsSection icon={theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />} title="Theme">
          <OptionGroup
            label="Theme"
            value={theme}
            options={THEME_OPTIONS}
            onChange={next => {
              setTheme(next);
              showToast('Theme Updated', `Theme set to ${next} mode.`, 'success');
            }}
          />
        </SettingsSection>

        <SettingsSection icon={<Thermometer size={20} />} title="Temperature Unit">
          <OptionGroup
            label="Temperature unit"
            value={unit}
            options={UNIT_OPTIONS}
            onChange={next => {
              setUnit(next);
              showToast(
                'Unit Updated',
                `Temperature set to ${next === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}.`,
                'success'
              );
            }}
          />
        </SettingsSection>

        <SettingsSection icon={<Clock size={20} />} title="Time Format">
          <OptionGroup
            label="Time format"
            value={timeFormat}
            options={TIME_FORMAT_OPTIONS}
            onChange={next => {
              setTimeFormat(next);
              showToast('Time Format Updated', `Time format set to ${next}.`, 'success');
            }}
          />
        </SettingsSection>

        <SettingsSection icon={<Download size={20} />} title="Install App">
          <InstallApp />
        </SettingsSection>

        <SettingsSection icon={<Bell size={20} />} title="Weather Alerts">
          <WeatherAlerts currentCity={currentCity} timeFormat={timeFormat} />
        </SettingsSection>
      </div>
    </div>
  );
}
