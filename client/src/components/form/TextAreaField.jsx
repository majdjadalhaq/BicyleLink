const TextAreaField = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  dataTestId,
  className,
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    {placeholder && (
      <label htmlFor={name} className="text-sm font-medium ml-1">
        {placeholder}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      data-testid={dataTestId}
      className={`input-emerald resize-y ${className || ""}`}
    />
  </div>
);

export default TextAreaField;
