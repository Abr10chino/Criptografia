import { useState, useEffect } from 'react';
import { LockKeyhole, UnlockKeyhole, Moon, Sun } from 'lucide-react';
import { MatrixInput } from './components/MatrixInput';
import { Visualizer } from './components/Visualizer';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { encodeMessage, decodeMessage, getZeroMatrix } from './lib/algebra';
import { Matrix, ProcessStep } from './types';
import { playSound } from './lib/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const [matrixSize, setMatrixSize] = useState<number>(2);
  const [matrixC, setMatrixC] = useState<Matrix>([
    [3, 1],
    [5, 2]
  ]);

  const [msgEncode, setMsgEncode] = useState('');
  const [msgDecode, setMsgDecode] = useState('');

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  const handleSizeChange = (n: number) => {
    setMatrixSize(n);
    const nm = getZeroMatrix(n, n);
    for (let i = 0; i < n; i++) nm[i][i] = 1; 
    setMatrixC(nm);
  };

  const executeProcess = async () => {
    playSound('tick');
    setStatus('processing');
    setSteps([]);
    setErrorMsg('');

    await new Promise(r => setTimeout(r, 1200));

    try {
      let resultSteps: ProcessStep[] = [];
      if (activeTab === 'encode') {
        if (!msgEncode.trim()) throw new Error("Debes proveer un mensaje para codificar.");
        const res = encodeMessage(msgEncode, matrixC);
        resultSteps = res.steps;
        setMsgDecode(res.encodedText);
      } else {
        if (!msgDecode.trim()) throw new Error("Debes proveer una secuencia válida para decodificar.");
        const res = decodeMessage(msgDecode, matrixC);
        resultSteps = res.steps;
      }
      
      setStatus('success');
      setSteps(resultSteps);

      setTimeout(() => {
        setStatus('idle');
      }, 2500);

    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error algebraico desconocido');
      setTimeout(() => {
         setStatus('idle');
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 overflow-x-hidden transition-colors">
      <FeedbackOverlay status={status} errorMessage={errorMsg} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-screen">
        
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
              Codificación por Matrices
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Sistema de cifrado y descifrado mediante Álgebra Lineal.
            </p>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 flex-1 min-h-0">
          <div className="flex flex-col flex-1 h-full max-h-full">
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800 p-1.5 rounded-xl flex mb-6 transition-colors">
              <button 
                onClick={() => { setActiveTab('encode'); setSteps([]); playSound('tick'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'encode' ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <LockKeyhole size={18} />
                Codificar
              </button>
              <button 
                onClick={() => { setActiveTab('decode'); setSteps([]); playSound('tick'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'decode' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <UnlockKeyhole size={18} />
                Decodificar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 transition-colors">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">1.</span> Matriz Codificadora {activeTab==='decode'?'(C)':'(C)'}
                </h2>
                <MatrixInput 
                  n={matrixSize} 
                  matrix={matrixC} 
                  onChange={setMatrixC} 
                  onSizeChange={handleSizeChange} 
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                  {activeTab === 'encode' ? 'Esta matriz será multiplicada por los bloques del mensaje.' : 'Esta matriz será invertida para recuperar el mensaje.'}
                </p>
              </section>

              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 mb-6 transition-colors">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <span className={activeTab === 'encode' ? "text-blue-600 dark:text-blue-400" : "text-indigo-600 dark:text-indigo-400"}>2.</span> 
                  {activeTab === 'encode' ? 'Mensaje a Codificar' : 'Secuencia a Decodificar'}
                </h2>
                
                {activeTab === 'encode' ? (
                  <textarea
                    placeholder="Escribe el mensaje aquí..."
                    value={msgEncode}
                    onChange={(e) => setMsgEncode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px] resize-none font-mono tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
                  />
                ) : (
                  <textarea
                    placeholder="Ej: 56, 12, -4 ..."
                    value={msgDecode}
                    onChange={(e) => setMsgDecode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] resize-none font-mono tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed transition-colors"
                  />
                )}

                <button
                  onClick={executeProcess}
                  disabled={status === 'processing'}
                  className={`mt-6 w-full py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-sm flex items-center justify-center gap-2 ${
                    activeTab === 'encode' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {activeTab === 'encode' ? <LockKeyhole size={18} /> : <UnlockKeyhole size={18} />}
                  Procesar Matrices
                </button>
              </section>

            </div>
          </div>

          <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Visualizador Algorítmico</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Sigue el flujo de operaciones matriciales paso a paso.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30 transition-colors">
              <Visualizer steps={steps} />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

