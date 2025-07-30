import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [listening, setListening] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    if (!recognition) return;

    recognition.lang = 'id-ID';

    recognition.onresult = (event) => {
      const voiceInput = event.results[0][0].transcript.toLowerCase().trim();
      console.log('🎙 Deteksi suara:', voiceInput);

      const keywordMap = [
        {
          keywords: ['kalkulator transform', 'kalkulator berubah', 'jadi robot', 'jadi transformer', 'optimus prime'],
          response: 'Haha kocak! Saya cuma kalkulator, mana bisa berubah jadi robot. Kirain saya Optimus Prime xixixi lawak.'
        },
        { keywords: ['kamu ini apa'], response: 'Saya adalah kalkulator pintar buatan Agus Susilo.' },
        {
          keywords: ['pancasila ada berapa', 'sebutkan pancasila', 'berapa sila pancasila'],
          response: 'Pancasila ada lima sila...'
        },
        {
          keywords: ['mau nggak jadi pacar', 'jadi pacar aku'],
          response: 'Maaf ya... kamu terlalu baik buat aku. Aku cuma kalkulator 😅'
        },
        {
          keywords: ['rukun islam ada berapa'],
          response: 'Rukun Islam ada lima, yaitu: 1. Syahadat, 2. Salat, 3. Puasa, 4. Zakat, dan 5. Haji jika mampu.'
        },
        { keywords: ['halo kalkulator'], response: 'Halo juga! Siap membantu hitung-hitungan 😄' },
        { keywords: ['assalamualaikum'], response: 'Waalaikumsalam. Semoga harimu penuh berkah! 🌙' },
        { keywords: ['motivasi dong'], response: '“Kesuksesan milik mereka yang gigih.” 💪' },
        {
          keywords: ['fitur apa saja'],
          response: 'Kalkulator ini bisa hitung, terima suara, jawab pertanyaan, dan simpan riwayat.'
        },
        { keywords: ['gombalin saya'], response: 'Kamu itu hasil kalkulasi sempurna ❤' }
      ];

      const matched = keywordMap.find(item =>
        item.keywords.some(k => voiceInput.includes(k))
      );

      if (matched) {
        respondToVoice(voiceInput, matched.response);
        return;
      }

      const parsed = parseVoiceInput(voiceInput);
      setExpression(parsed);

      try {
        const sanitized = normalizeExpression(parsed)
          .replace(/%/g, '/100')
          .replace(/\^/g, '')
          .replace(/√\s*(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
        const evalResult = eval(sanitized);
        setResult(evalResult);
        setHistory(prev => [...prev, { expression: parsed, result: evalResult }]);
        speakResult(evalResult);
      } catch {
        setResult('Error');
      }
    };

    recognition.onerror = (e) => console.error('Error suara:', e.error);
    recognition.onend = () => setListening(false);
  }, []);

  const respondToVoice = (question, answer) => {
    setExpression(question);
    setResult(answer);
    speakResult(answer);
  };

  const speakResult = (res) => {
    const utterance = new SpeechSynthesisUtterance(res.toString());
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
  };

  const parseVoiceInput = (text) => {
    return text
      .replace(/koma/g, '.')
      .replace(/kali|x/g, '*')
      .replace(/bagi/g, '/')
      .replace(/tambah/g, '+')
      .replace(/kurang|minus/g, '-')
      .replace(/pangkat/g, '^')
      .replace(/akar/g, '√')
      .replace(/persen/g, '%')
      .replace(/nol/g, '0')
      .replace(/satu/g, '1')
      .replace(/dua/g, '2')
      .replace(/tiga/g, '3')
      .replace(/empat/g, '4')
      .replace(/lima/g, '5')
      .replace(/enam/g, '6')
      .replace(/tujuh/g, '7')
      .replace(/delapan/g, '8')
      .replace(/sembilan/g, '9');
  };

  const normalizeExpression = (expr) =>
    expr.replace(/\b0+(\d+)/g, (match, p1) => (match.includes('.') ? match : p1));

  const handleClick = (value) => {
    if (value === '=') {
      try {
        const sanitized = normalizeExpression(expression)
          .replace(/%/g, '/100')
          .replace(/\^/g, '')
          .replace(/√\s*(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
        const evalResult = eval(sanitized);
        setResult(evalResult);
        setHistory(prev => [...prev, { expression, result: evalResult }]);
        speakResult(evalResult);
      } catch {
        setResult('Error');
      }
    } else if (value === 'C') {
      setExpression('');
      setResult('');
    } else if (value === '←') {
      setExpression(prev => prev.slice(0, -1));
    } else if (value === '🕘') {
      setShowHistory(prev => !prev);
    } else {
      setExpression(prev => prev + value);
    }
  };

  const startListening = () => {
    if (!recognition) {
      alert('Browser tidak mendukung voice recognition');
      return;
    }
    setListening(true);
    recognition.start();
  };

  const toggleTheme = () => setDarkTheme(prev => !prev);
  const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+', '←', 'C', '🕘', '%', '^', '√'];

  return (
    <div className={`min-vh-100 w-100 ${darkTheme ? 'dark-theme' : ''}`}>
      <style>{`
        body {
          background: ${darkTheme ? '#000000' : '#e8ecf1'} !important;
          font-family: 'Segoe UI', sans-serif;
        }

        .dark-theme {
          background-color: #000000;
          color: white;
        }

        .display-digital {
          background-color: ${darkTheme ? '#000000' : '#001f3f'};
          color: ${darkTheme ? '#00ffcc' : '#00ffff'};
          font-family: 'Courier New', monospace;
          font-size: 1.8rem;
          padding: 10px 15px;
          border-radius: 10px;
          text-align: right;
          box-shadow: inset 0 0 8px ${darkTheme ? '#00ffcc' : '#00ffff'};
        }

        .calculator-card {
          border-radius: 20px;
          background: ${darkTheme ? '#111111' : 'white'};
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .btn-emas {
          background-color: #FFD700;
          color: black;
          border: none;
          font-weight: bold;
          font-size: 1.2rem;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .btn-emas:hover {
          background-color: #e6c200;
          transform: scale(1.05);
        }

        .history-box {
          border-radius: 10px;
          background: ${darkTheme ? '#111111' : '#f9fafb'};
          border: 1px solid #ddd;
          max-height: 250px;
          overflow-y: auto;
        }
      `}</style>

      <div className="container mt-5">
        <div className="card p-4 calculator-card mx-auto" style={{ maxWidth: '420px' }}>
          <h3 className="text-center mb-3">🧮 Gusma Calculator</h3>

          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={toggleTheme}>
            {darkTheme ? '🌞 Tema Terang' : '🌙 Tema Gelap'}
          </button>

          <div className="display-digital mb-2">{expression || '0'}</div>
          <div className="display-digital mb-3 fw-bold">{result || '0'}</div>

          <div className="grid mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {buttons.map((btn, idx) => {
              const value = btn === '×' ? '*' : btn === '÷' ? '/' : btn;
              return (
                <button key={idx} className="btn btn-emas" onClick={() => handleClick(value)}>
                  {btn}
                </button>
              );
            })}
          </div>

          <button className="btn btn-primary w-100 mb-3" onClick={startListening}>
            {listening ? '🎙 Mendengarkan...' : '🎙 Input Suara'}
          </button>

          {showHistory && history.length > 0 && (
            <div className="mt-3 history-box p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">📜 Riwayat Perhitungan</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowHistory(false)}>
                  Tutup
                </button>
              </div>
              <ul className="list-group">
                {history.slice().reverse().map((item, idx) => (
                  <li
                    key={idx}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      darkTheme ? 'bg-dark text-white' : ''
                    }`}
                  >
                    <span>{item.expression}</span>
                    <strong>= {item.result}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
