import { Matrix, ProcessStep, EncodingResult, DecodingResult } from '../types';

// Helper: Create Zero Matrix
export const getZeroMatrix = (r: number, c: number): Matrix => 
  Array.from({length: r}, () => new Array(c).fill(0));

// Char <-> Number Mappings
export const charToNum = (char: string): number => {
  const code = char.toUpperCase().charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 64;
  if (char === ' ') return 27;
  if (char === '.') return 28;
  if (char === ',') return 29;
  return 30; // fallback
};

export const numToChar = (num: number): string => {
  let n = Math.round(num);
  if (n <= 0) return '?'; // Out of bounds unexpected
  if (n >= 1 && n <= 26) return String.fromCharCode(n + 64);
  if (n === 27) return ' ';
  if (n === 28) return '.';
  if (n === 29) return ',';
  if (n === 30) return '?';
  return String.fromCharCode((n % 26) + 64 > 0 ? (n % 26) + 64 : 63);
};

// Math Operations
export const multiplyMatrices = (a: Matrix, b: Matrix): Matrix => {
  const aRows = a.length, aCols = a[0].length, bRows = b.length, bCols = b[0].length;
  if (aCols !== bRows) throw new Error("Dimensiones incompatibles para multiplicación.");
  const res = getZeroMatrix(aRows, bCols);
  for (let r = 0; r < aRows; ++r) {
    for (let c = 0; c < bCols; ++c) {
      for (let i = 0; i < aCols; ++i) {
        res[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return res;
};

export const getMinor = (m: Matrix, row: number, col: number): Matrix => {
  return m.filter((_, r) => r !== row).map(rowArr => rowArr.filter((_, c) => c !== col));
};

export const getDeterminant = (m: Matrix): number => {
  if (m.length !== m[0].length) throw new Error("La matriz debe ser cuadrada.");
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let det = 0;
  for (let c = 0; c < n; ++c) {
    det += (c % 2 === 0 ? 1 : -1) * m[0][c] * getDeterminant(getMinor(m, 0, c));
  }
  return det;
};

export const transpose = (m: Matrix): Matrix => {
  return m[0].map((_, c) => m.map(rowArr => rowArr[c]));
};

export const getCofactorMatrix = (m: Matrix): Matrix => {
  const n = m.length;
  return m.map((rowArr, r) => rowArr.map((_, c) => {
    return (r + c) % 2 === 0 ? getDeterminant(getMinor(m, r, c)) : -getDeterminant(getMinor(m, r, c));
  }));
};

export const getInverse = (m: Matrix): Matrix => {
  const det = getDeterminant(m);
  if (Math.abs(det) < 1e-9) throw new Error("La matriz no es invertible (Determinante es 0 o muy cerca de 0).");
  
  if (m.length === 1) return [[1 / m[0][0]]];
  
  const cofactors = getCofactorMatrix(m);
  const adjugate = transpose(cofactors);
  return adjugate.map(r => r.map(v => v / det));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const encodeMessage = (text: string, mC: Matrix): EncodingResult => {
  const steps: ProcessStep[] = [];
  const n = mC.length;

  const det = getDeterminant(mC);
  if (Math.abs(det) < 1e-9) {
    throw new Error('La matriz codificadora tiene un determinante igual a 0. ¡No se podrá decodificar este mensaje!');
  }
  steps.push({
    id: generateId(),
    title: 'Validación de Matriz',
    description: `El determinante de la matriz es ${det}. La matriz es invertible.`,
    type: 'determinant',
    payload: { matrix: mC, det }
  });

  const chars = text.split('');
  const nums = chars.map(charToNum);
  
  steps.push({
    id: generateId(),
    title: 'Conversión a Valores Numéricos',
    description: 'Cada caracter fue convertido a su equivalente numérico (A=1, B=2..., Espacio=27).',
    type: 'text-to-num',
    payload: { chars, nums }
  });

  const paddedNums = [...nums];
  while (paddedNums.length % n !== 0) paddedNums.push(27); // Pad with spaces

  const blocks: Matrix[] = [];
  for (let i = 0; i < paddedNums.length; i += n) {
    const colVector = paddedNums.slice(i, i + n).map(val => [val]);
    blocks.push(colVector);
  }

  steps.push({
    id: generateId(),
    title: 'División en Bloques',
    description: `El mensaje numérico se divide en vectores columna de tamaño ${n}x1. Se añadieron espacios vacíos al final si fue necesario.`,
    type: 'blocks',
    payload: { blocks }
  });

  const encodedBlocks: Matrix[] = [];
  const encodedNums: number[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const encodedBlock = multiplyMatrices(mC, block);
    encodedBlocks.push(encodedBlock);
    encodedNums.push(...encodedBlock.map(row => Math.round(row[0] * 100) / 100)); // Keep some decimals for display
  }

  steps.push({
    id: generateId(),
    title: 'Multiplicación Matricial',
    description: `Cada bloque (vector) es multiplicado por la matriz codificadora C. M_codificado = C × Bloque_i`,
    type: 'matrix-multiply',
    payload: { originalBlocks: blocks, multiplierMatrix: mC, resultBlocks: encodedBlocks }
  });

  const encodedText = encodedNums.join(', ');

  steps.push({
    id: generateId(),
    title: 'Mensaje Codificado Final',
    description: 'Los bloques codificados se aplanan para obtener la secuencia numérica transmitible.',
    type: 'final-result',
    payload: { text: encodedText }
  });

  return { encodedText, steps };
};

export const decodeMessage = (encodedSequence: string, mC: Matrix): DecodingResult => {
  const steps: ProcessStep[] = [];
  const n = mC.length;

  const det = getDeterminant(mC);
  if (Math.abs(det) < 1e-9) {
    throw new Error('La matriz no es invertible (determinante 0). Imposible de descodificar.');
  }

  const encodedNums = encodedSequence.split(/[\s,]+/).filter(s => s.trim().length > 0).map(Number);
  
  if (encodedNums.length % n !== 0) {
    throw new Error(`La secuencia no es válida. La cantidad de números debe ser múltiple de ${n} (dimensión de la matriz).`);
  }

  steps.push({
    id: generateId(),
    title: 'Recepción del Mensaje y Bloques',
    description: `Se agrupan los números recibidos en vectores de dimensión ${n}x1.`,
    type: 'blocks',
    payload: { blocks: Array.from({length: encodedNums.length / n}, (_, i) => encodedNums.slice(i * n, (i+1) * n).map(v => [v])) }
  });

  const minverse = getInverse(mC);
  steps.push({
    id: generateId(),
    title: 'Cálculo de la Matriz Inversa C⁻¹',
    description: `Se determina la inversa de la matriz utilizando adjunta sobre determinante. El determinante es ${det}.`,
    type: 'inverse',
    payload: { originalMatrix: mC, inverseMatrix: minverse }
  });

  const decodedBlocks: Matrix[] = [];
  const decodedNums: number[] = [];

  const blocks = Array.from({length: encodedNums.length / n}, (_, i) => encodedNums.slice(i * n, (i+1) * n).map(v => [v]));

  for (let i = 0; i < blocks.length; i++) {
    const dec = multiplyMatrices(minverse, blocks[i]);
    decodedBlocks.push(dec);
    decodedNums.push(...dec.map(r => r[0]));
  }

  steps.push({
    id: generateId(),
    title: 'Multiplicación por Matriz Inversa',
    description: 'M_original = C⁻¹ × M_codificado',
    type: 'matrix-multiply',
    payload: { originalBlocks: blocks, multiplierMatrix: minverse, resultBlocks: decodedBlocks }
  });

  const finalChars = decodedNums.map(numToChar);
  const decodedText = finalChars.join('');

  steps.push({
    id: generateId(),
    title: 'Reversión a Texto',
    description: 'Los valores numéricos resultantes se redondean al entero más cercano y se mapean de vuelta a caracteres.',
    type: 'num-to-text',
    payload: { nums: decodedNums.map(n => Math.round(n)), chars: finalChars }
  });

  steps.push({
    id: generateId(),
    title: 'Mensaje Descodificado',
    description: 'El proceso está completo.',
    type: 'final-result',
    payload: { text: decodedText }
  });

  return { decodedText, steps };
};
