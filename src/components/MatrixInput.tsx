import { Matrix } from '../types';

interface Props {
  n: number;
  matrix: Matrix;
  onChange: (m: Matrix) => void;
  onSizeChange: (n: number) => void;
}

export function MatrixInput({ n, matrix, onChange, onSizeChange }: Props) {
  const handleChange = (r: number, c: number, val: string) => {
    const clone = matrix.map(row => [...row]);
    clone[r][c] = val === '' ? 0 : Number(val);
    onChange(clone);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Dimensión de la Matriz (N):</label>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 outline-none transition-colors">
          {[2, 3, 4].map(size => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                size === n ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

      <div className="relative inline-flex items-center justify-center p-3 mt-2">
        <div className="absolute inset-y-0 left-0 w-2.5 border-l-2 border-t-2 border-b-2 border-slate-400 dark:border-slate-600 rounded-l-md transition-colors"></div>
        <div className="absolute inset-y-0 right-0 w-2.5 border-r-2 border-t-2 border-b-2 border-slate-400 dark:border-slate-600 rounded-r-md transition-colors"></div>
        
        <div 
          className="grid gap-2 px-1"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {matrix.map((row, r) =>
            row.map((val, c) => (
              <input
                key={`${r}-${c}`}
                type="number"
                value={val}
                onChange={(e) => handleChange(r, c, e.target.value)}
                className="w-14 h-14 text-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono text-slate-900 dark:text-slate-100 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
