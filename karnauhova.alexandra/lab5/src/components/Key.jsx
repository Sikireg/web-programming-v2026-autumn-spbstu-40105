export default function Key({ label, className = "", testId = "calculator-key", onPress, ...rest }) {
  return (
    <button type="button" className={`key ${className}`} data-testid={testId} onClick={onPress} {...rest}>
      {label}
    </button>
  );
}
