import { Matrix, ProcessStep } from '../types';
import { motion } from 'motion/react';
import React from 'react';

const MatrixDisplay = ({ data, label }: { data: Matrix, label?: string }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-1.5 m-1">
      {label && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>}
      <div className="relative inline-flex p-1.5 items-center">
        <div className="absolute inset-y-0 left-0 w-1.5 border-l-2 border-t-2 border-b-2 border-slate-400 dark:border-slate-600 rounded-l-[4px] transition-colors"></div>
        <div className="absolute inset-y-0 right-0 w-1.5 border-r-2 border-t-2 border-b-2 border-slate-400 dark:border-slate-600 rounded-r-[4px] transition-colors"></div>
        <div className="grid gap-1 px-2" style={{ gridTemplateColumns: `repeat(${data[0].length}, minmax(0, 1fr))` }}>
          {data.map((row, r) => 
            row.map((val, c) => (
              <div key={`${r}-${c}`} className="w-9 h-9 flex items-center justify-center font-mono text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm transition-colors">
                {Number.isInteger(val) ? val : Number(val).toFixed(2)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const renderStepPayload = (step: ProcessStep) => {
  const { type, payload } = step;

  switch (type) {
    case 'text-to-num':
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {payload.chars.map((char: string, i: number) => (
            <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm min-w-[3rem] overflow-hidden transition-colors">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 py-1.5 w-full text-center bg-slate-50 dark:bg-slate-800/80 transition-colors">{char === ' ' ? 'SPC' : char}</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-mono py-1.5 border-t border-slate-200 dark:border-slate-700 w-full text-center transition-colors">{payload.nums[i]}</span>
            </div>
          ))}
        </div>
      );
    
    case 'blocks':
      return (
        <div className="flex flex-wrap gap-3 mt-3 overflow-x-auto pb-2">
          {payload.blocks.map((block: Matrix, i: number) => (
            <MatrixDisplay key={i} data={block} label={`B${i+1}`} />
          ))}
        </div>
      );
    
    case 'determinant':
      return (
        <div className="mt-3 flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit transition-colors">
          <MatrixDisplay data={payload.matrix} label="C" />
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
            <span className="font-mono text-lg">det = </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono text-xl">{Number(payload.det).toFixed(2).replace(/\.00$/, '')}</span>
          </div>
        </div>
      );

    case 'inverse':
      return (
        <div className="mt-3 flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit transition-colors">
          <MatrixDisplay data={payload.originalMatrix} label="C" />
          <span className="text-slate-400 dark:text-slate-500">→</span>
          <MatrixDisplay data={payload.inverseMatrix} label="C⁻¹" />
        </div>
      );

    case 'matrix-multiply':
      return (
        <div className="mt-3 flex flex-col gap-3 overflow-x-auto pb-2 max-w-full">
          {payload.originalBlocks.map((block: Matrix, i: number) => (
            <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit transition-colors">
              <MatrixDisplay data={payload.multiplierMatrix} />
              <span className="text-slate-400 dark:text-slate-500 font-medium">×</span>
              <MatrixDisplay data={block} label={`V${i+1}`} />
              <span className="text-slate-400 dark:text-slate-500 font-medium">=</span>
              <MatrixDisplay data={payload.resultBlocks[i]} label={`R${i+1}`} />
            </div>
          ))}
        </div>
      );

    case 'num-to-text':
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {payload.nums.map((num: number, i: number) => (
            <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm min-w-[3rem] overflow-hidden transition-colors">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-mono py-1.5 w-full text-center transition-colors">{num}</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 py-1.5 border-t border-slate-200 dark:border-slate-700 w-full text-center bg-slate-50 dark:bg-slate-800/80 transition-colors">{payload.chars[i] === ' ' ? 'SPC' : payload.chars[i]}</span>
            </div>
          ))}
        </div>
      );

    case 'final-result':
      return (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl transition-colors">
          <h4 className="text-xs uppercase text-green-700 dark:text-green-500 mb-1.5 font-semibold tracking-wider">Resultado</h4>
          <p className="font-mono text-green-900 dark:text-green-200 text-lg break-all font-medium transition-colors">{payload.text}</p>
        </div>
      );

    default:
      return null;
  }
};

export function Visualizer({ steps }: { steps: ProcessStep[] }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 bg-white dark:bg-slate-900 transition-colors">
        <div className="text-4xl mb-3 opacity-50">🖥️</div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Panel de Ejecución</h3>
        <p className="text-sm text-center mt-2 max-w-xs text-slate-500 dark:text-slate-400">
          Introduce un mensaje y una matriz para visualizar el procedimiento paso a paso.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 120 }}
          className="relative pl-6 before:absolute before:left-[3px] before:top-2 before:bottom-[-1.5rem] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800 last:before:bottom-auto last:before:h-full transition-colors"
        >
          <div className="absolute left-[-2px] top-2 h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-white dark:ring-slate-900 transition-colors" />
          
          <div className="bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold transition-colors">
                {index + 1}
              </span>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{step.title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{step.description}</p>
            
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              {renderStepPayload(step)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
