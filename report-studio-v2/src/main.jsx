import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import './styles.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function App() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [reportTitle, setReportTitle] = useState('Field / Industrial Training Report');

  const readyCount = useMemo(() => files.filter(file => file.status === 'ready').length, [files]);

  const extractPdf = async (file, update) => {
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = '';
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      text += `\n\n--- PAGE ${pageNumber} ---\n` + content.items.map(item => item.str).join(' ');
      update(Math.round((pageNumber / pdf.numPages) * 100));
    }
    if (!text.trim()) throw new Error('No selectable text found. This may be a scanned PDF; OCR is not included in the no-API version.');
    return { text, pages: pdf.numPages, type: 'PDF' };
  };

  const extractDocx = async (file, update) => {
    update(25);
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    update(100);
    if (!result.value.trim()) throw new Error('No readable text was found in this DOCX file.');
    return { text: result.value, pages: null, type: 'DOCX', warnings: result.messages.map(message => message.message) };
  };

  const processFiles = useCallback(async (incoming) => {
    setError('');
    const candidates = Array.from(incoming);
    const accepted = [];
    for (const file of candidates) {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (!ACCEPTED.includes(file.type) && !/\.docx?$/i.test(file.name) && !/\.pdf$/i.test(file.name)) {
        setError(`${file.name}: unsupported format. Upload PDF or DOCX. Legacy .DOC is not supported in browser-only processing.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name}: file exceeds the 20 MB limit.`);
        continue;
      }
      accepted.push({ id, file, name: file.name, size: file.size, status: 'queued', progress: 0, extractedText: '', details: null, message: 'Waiting to process' });
    }
    if (!accepted.length) return;
    setFiles(previous => [...previous, ...accepted]);
    setBusy(true);
    for (const item of accepted) {
      setFiles(previous => previous.map(row => row.id === item.id ? { ...row, status: 'processing', message: 'Reading document…' } : row));
      try {
        const result = item.name.toLowerCase().endsWith('.pdf')
          ? await extractPdf(item.file, progress => setFiles(previous => previous.map(row => row.id === item.id ? { ...row, progress, message: `Extracting pages… ${progress}%` } : row)))
          : await extractDocx(item.file, progress => setFiles(previous => previous.map(row => row.id === item.id ? { ...row, progress, message: `Extracting text… ${progress}%` } : row)));
        setFiles(previous => previous.map(row => row.id === item.id ? { ...row, status: 'ready', progress: 100, extractedText: result.text, details: result, message: 'Reference extracted successfully' } : row));
      } catch (cause) {
        setFiles(previous => previous.map(row => row.id === item.id ? { ...row, status: 'failed', message: cause.message || 'Could not read this document' } : row));
      }
    }
    setBusy(false);
  }, []);

  const removeFile = id => setFiles(previous => previous.filter(file => file.id !== id));
  const continueToNext = () => {
    if (busy) return;
    if (!readyCount) { setError('Upload at least one readable reference report, or choose Continue without references.'); return; }
    setStep(2);
    setError('');
  };

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">R</span><div><strong>Raymond Report Studio</strong><small>REPORT WORKSPACE · VERSION 2</small></div></div><span className="local-badge">No AI API · No database</span></header>
    <section className="hero"><div className="eyebrow">A MORE RELIABLE REPORT WORKFLOW</div><h1>Build a report from your real experience.</h1><p>Upload reference reports, extract their structure, then create your own report without copying their content.</p><div className="steps"><span className={step===1?'active':''}>01 <b>References</b></span><i>→</i><span className={step===2?'active':''}>02 <b>Report details</b></span><i>→</i><span>03 <b>Preview & export</b></span></div></section>
    <section className="workspace"><div className="section-heading"><div><div className="eyebrow">STEP {step} OF 3</div><h2>{step===1?'Upload reference reports':step===2?'Report details':'Preview and export'}</h2><p>{step===1?'We read the document text and identify headings and structure. Your reference content is not copied into your report.':'This React migration scaffold is being built in a separate folder; the existing live PHP version remains untouched.'}</p></div><div className="counter"><strong>{readyCount}</strong><small>ready references</small></div></div>
      {step===1 ? <><label className="dropzone" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();processFiles(event.dataTransfer.files);}}><input type="file" multiple accept=".pdf,.docx,.doc" onChange={event=>processFiles(event.target.files)} /><span className="upload-icon">↑</span><strong>Drop reference reports here</strong><span>or browse files · PDF and DOCX · maximum 20 MB each</span><em>Legacy .DOC files need conversion to .DOCX first</em></label>
      <div className="file-list">{files.map(file=><article className="file-row" key={file.id}><div className="file-type">{file.name.toLowerCase().endsWith('.pdf')?'PDF':'DOC'}</div><div className="file-info"><strong>{file.name}</strong><small>{file.message}</small>{file.status==='processing'&&<div className="progress"><span style={{width:`${file.progress}%`}}/></div>}{file.status==='ready'&&<small className="success">{file.details.type}{file.details.pages?` · ${file.details.pages} pages`:''} · text extracted</small>}{file.status==='failed'&&<small className="failure">{file.message}</small>}</div><button className="remove" onClick={()=>removeFile(file.id)} aria-label={`Remove ${file.name}`}>×</button></article>)}</div>
      <div className="notice"><strong>Privacy and limitations</strong><p>Files are processed in this browser. PDF and DOCX text extraction is local; scanned PDFs require OCR, and old binary DOC files must be converted. Reference files are not uploaded to an AI service.</p></div>
      </> : <div className="next-panel"><h3>{step===2?'Tell us about your report':'Your workspace is ready for the next module'}</h3><label>Report title<input value={reportTitle} onChange={event=>setReportTitle(event.target.value)} /></label><p>{readyCount} reference report(s) successfully extracted. The next implementation stage will turn their headings into a suggested structure for your own original report.</p></div>}
      {error&&<div className="error-banner" role="alert">{error}</div>}
      <div className="actions"><button className="secondary" onClick={()=>step>1&&setStep(step-1)} disabled={step===1}>Back</button><button className="secondary" onClick={()=>{setStep(2);setError('')}} disabled={busy}>Continue without references</button><button className="primary" onClick={continueToNext} disabled={busy||step!==1}>{busy?'Processing…':'Continue' } →</button></div>
    </section>
    <footer>Raymond Report Studio · React + Vite · Designed for static deployment on InfinityFree</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
