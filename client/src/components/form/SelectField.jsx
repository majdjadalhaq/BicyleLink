const SelectField = ({
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder,
  dataTestId,
  className,
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    {placeholder && (
      <label htmlFor={name} className="text-sm font-medium ml-1">
        {placeholder}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      data-testid={dataTestId}
      className={`input-emerald appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%2310B981%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[length:1.2em_1.2em] pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      <option value="">Select {placeholder}</option>
      {options.map((opt, index) => (
        <option key={`${opt.value || opt}-${index}`} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
