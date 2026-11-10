// Чистая логика калькулятора: reducer без обращения к DOM.

export const OPERATIONS = {
  add: {symbol: '+', apply: (a, b) => a + b},
  subtract: {symbol: '−', apply: (a, b) => a - b},
  multiply: {symbol: '×', apply: (a, b) => a * b},
  divide: {symbol: '÷', apply: (a, b) => a / b},
};

export const ERROR = 'Ошибка';
const MAX_LENGTH = 15;

export const initialState = {
  current: '0', // то, что показано на дисплее
  previous: null, // первый операнд (число)
  operation: null, // ключ из OPERATIONS
  overwrite: false, // следующая цифра начинает новое число
  expression: '', // строка над дисплеем: "2 + 3 ="
};

// 0.1 + 0.2 -> 0.3, слишком большие/неверные значения -> "Ошибка"
const format = (n) =>
  Number.isFinite(n) ? String(parseFloat(n.toPrecision(12))) : ERROR;

const compute = (a, b, operation) => OPERATIONS[operation].apply(a, b);

export function reducer(state, action) {
  const isError = state.current === ERROR;

  switch (action.type) {
    case 'digit': {
      if (isError || state.overwrite) {
        return {
          ...state,
          current: action.value,
          overwrite: false,
          expression: state.previous === null ? '' : state.expression,
        };
      }
      if (state.current.replace(/[-.]/g, '').length >= MAX_LENGTH) return state;
      return {
        ...state,
        current:
          state.current === '0' ? action.value : state.current + action.value,
      };
    }

    case 'decimal': {
      if (isError || state.overwrite) {
        return {
          ...state,
          current: '0.',
          overwrite: false,
          expression: state.previous === null ? '' : state.expression,
        };
      }
      if (state.current.includes('.')) return state;
      return {...state, current: state.current + '.'};
    }

    case 'operation': {
      if (isError) return state;
      const symbol = OPERATIONS[action.value].symbol;

      // Оператор нажат дважды подряд — просто меняем его
      if (state.previous !== null && state.operation && state.overwrite) {
        return {
          ...state,
          operation: action.value,
          expression: `${format(state.previous)} ${symbol}`,
        };
      }

      let left = parseFloat(state.current);
      // Цепочка 2 + 3 + ... — сначала считаем предыдущий шаг
      if (state.previous !== null && state.operation) {
        left = compute(state.previous, left, state.operation);
        if (!Number.isFinite(left)) return {...initialState, current: ERROR};
      }
      return {
        current: format(left),
        previous: left,
        operation: action.value,
        overwrite: true,
        expression: `${format(left)} ${symbol}`,
      };
    }

    case 'equals': {
      if (isError || state.previous === null || !state.operation) return state;
      const right = parseFloat(state.current);
      const result = compute(state.previous, right, state.operation);
      if (!Number.isFinite(result)) return {...initialState, current: ERROR};
      return {
        current: format(result),
        previous: null,
        operation: null,
        overwrite: true,
        expression: `${format(state.previous)} ${OPERATIONS[state.operation].symbol} ${format(right)} =`,
      };
    }

    case 'percent': {
      if (isError) return state;
      const value = parseFloat(state.current);
      let result;
      if (
        state.previous !== null &&
        (state.operation === 'add' || state.operation === 'subtract')
      ) {
        result = (state.previous * value) / 100; // 200 + 10% -> 200 + 20
      } else {
        result = value / 100; // 50% -> 0.5
      }
      return {
        ...state,
        current: format(result),
        overwrite: state.previous === null,
      };
    }

    case 'sign': {
      if (isError || state.current === '0') return state;
      const current = state.current.startsWith('-')
        ? state.current.slice(1)
        : '-' + state.current;
      return {...state, current};
    }

    case 'backspace': {
      if (isError || state.overwrite) return state;
      const next = state.current.slice(0, -1);
      return {...state, current: next === '' || next === '-' ? '0' : next};
    }

    case 'clear':
      return initialState;

    default:
      return state;
  }
}
