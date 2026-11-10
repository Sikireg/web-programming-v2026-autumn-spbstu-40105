import {useEffect, useReducer} from 'react';
import Display from './components/Display.jsx';
import Key from './components/Key.jsx';
import {initialState, reducer} from './calculator.js';

const KEY_TO_OPERATION = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Поддержка клавиатуры
    useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        dispatch({ type: "digit", value: k });
      } else if (k === "." || k === ",") {
        dispatch({ type: "decimal" });
      } else if (KEY_TO_OPERATION[k]) {
        dispatch({ type: "operation", value: KEY_TO_OPERATION[k] });
      } else if (k === "Enter" || k === "=") {
        e.preventDefault();
        dispatch({ type: "equals" });
      } else if (k === "%") {
        dispatch({ type: "percent" });
      } else if (k === "Backspace") {
        dispatch({ type: "backspace" });
      } else if (k === "Escape" || k === "Delete") {
        dispatch({ type: "clear" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const digit = (value) => (
    <Key
      label={value}
      className="digit"
      data-value={value}
      onPress={() => dispatch({type: 'digit', value})}
    />
  );
  const op = (value, label) => (
    <Key
      label={label}
      className={`op${state.operation === value && state.overwrite ? ' active' : ''}`}
      data-operation={value}
      onPress={() => dispatch({type: 'operation', value})}
    />
  );

  return (
    <main data-testid="app" className="app">
      <section className="calculator" aria-label="Калькулятор">
        <Display expression={state.expression} value={state.current} />

        <div className="keys">
          <Key
            label="AC"
            testId="calculator-clear"
            className="fn"
            onPress={() => dispatch({type: 'clear'})}
          />
          <Key
            label="±"
            className="fn"
            data-action="sign"
            aria-label="Изменить знак"
            onPress={() => dispatch({type: 'sign'})}
          />
          <Key
            label="%"
            className="fn"
            data-action="percent"
            aria-label="Процент"
            onPress={() => dispatch({type: 'percent'})}
          />
          {op('divide', '÷')}

          {digit('7')}
          {digit('8')}
          {digit('9')}
          {op('multiply', '×')}
          {digit('4')}
          {digit('5')}
          {digit('6')}
          {op('subtract', '−')}
          {digit('1')}
          {digit('2')}
          {digit('3')}
          {op('add', '+')}

          <Key
            label="0"
            className="digit zero"
            data-value="0"
            onPress={() => dispatch({type: 'digit', value: '0'})}
          />
          <Key
            label=","
            className="digit"
            data-value="."
            aria-label="Десятичная точка"
            onPress={() => dispatch({type: 'decimal'})}
          />
          <Key
            label="="
            testId="calculator-equals"
            className="equals"
            onPress={() => dispatch({type: 'equals'})}
          />
        </div>
      </section>
    </main>
  );
}
