import { useId, type ReactNode } from 'react';

type Props = {
  label: string;
  className: string;
  value: string;
  options: readonly { value: string; label: string; content: ReactNode }[];
  onChange: (value: string) => void;
  direction?: 'ltr' | 'rtl';
};

/** Compact native radio control, sharing the header toggles' inset glass treatment. */
export default function BearingToggle({ label, className, value, options, onChange, direction = 'ltr' }: Props) {
  const name = useId();
  return <fieldset className={'bearing-toggle ' + className} aria-label={label} dir={direction} data-count={options.length} data-index={Math.max(0, options.findIndex(option => option.value === value))}>
    <span className="bearing-toggle-scene" aria-hidden="true"><span className="bearing-toggle-thumb" /></span>
    {options.map(option => <label className="bearing-toggle-choice" key={option.value} title={option.label}>
      <input type="radio" name={name} value={option.value} checked={value === option.value} aria-label={option.label}
        onClick={() => { if (value === option.value) onChange(option.value); }}
        onChange={() => onChange(option.value)} />
      <span>{option.content}</span>
    </label>)}
  </fieldset>;
}
