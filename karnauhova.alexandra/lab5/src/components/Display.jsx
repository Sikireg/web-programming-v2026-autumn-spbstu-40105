export default function Display({expression, value}) {
  const long = value.length > 11;
  return (
    <div className="display">
      <div className="expression" data-testid="calculator-expression">
        {expression || '\u00A0'}
      </div>
      <output
        className={`value${long ? ' value-long' : ''}`}
        data-testid="calculator-display"
        aria-live="polite"
      >
        {value}
      </output>
    </div>
  );
}
