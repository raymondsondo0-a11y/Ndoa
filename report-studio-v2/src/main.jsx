import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { analyseReferenceDocuments } from './reportIntelligence.js';
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
  const [analysis, setAnalysis] = useState(null);
  const [outline, setOutline] = useState([]);

  const readyFiles = useMemo(() => files.filter(file => file.status === 'ready'), [files]);
  const readyCount = readyFiles.length;

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
      if (/\.doc$/i.test(file.name)) {
        setError(`${file.name}: legacy .DOC is not supported. Open it in Microsoft Word and save as .DOCX, then upload again.`);
        continue;
      }
      if (!ACCEPTED.includes(file.type) && !/\.docx$/i.test(file.name) && !/\.pdf$/i.test(file.name)) {
        setError(`${file.name}: unsupported format. Upload PDF or DOCX.`);
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
    setAnalysis(null);
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

  const removeFile = id => {
    setFiles(previous => previous.filter(file => file.id !== id));
    setAnalysis(null);
  };

  const runAnalysis = () => {
    if (busy) return;
    if (!readyCount) {
      setError('Upload at least one readable reference report, or continue without references.');
      return;
    }
    try {
      const result = analyseReferenceDocuments(readyFiles.map(file => ({ name: file.name, text: file.extractedText })));
      setAnalysis(result);
      setOutline(result.recommendedOutline);
      setStep(2);
      setError('');
    } catch (cause) {
      setError(cause.message || 'Reference analysis could not be completed.');
    }
  };

  const toggleOutline = id => setOutline(previous => previous.map(item => item.id === id ? { ...item, included: !item.included } : item));
  const renameOutline = (id, title) => setOutline(previous => previous.map(item => item.id === id ? { ...item, title } : item));

  const downloadStructure = () => {
    const data = {
      reportTitle,
      createdAt: new Date().toISOString(),
      references: analysis?.documentSummaries || [],
      detectedHeadings: analysis?.headings || [],
      proposedOutline: outline.filter(item => item.included).map(item => item.title),
      note: 'Structure guide only. Write original report content based on your own placement experience.'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'raymond-report-structure.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">R</span><div><strong>Raymond Report Studio</strong><small>REPORT WORKSPACE · VERSION 2</small></div></div><span className="local-badge">No AI API · No database</span></header>
    <section className="hero"><div className="eyebrow">A MORE RELIABLE REPORT WORKFLOW</div><h1>Build a report from your real experience.</h1><p>Upload reference reports, extract their structure, then create your own report without copying their content.</p><div className="steps"><span className={step===1?'active':''}>01 <b>References</b></span><i>→</i><span className={step===2?'active':''}>02 <b>Structure analysis</b></span><i>→</i><span className={step===3?'active':''}>03 <b>Report details</b></span></div></section>
    <section className="workspace">
      <div className="section-heading"><div><div className="eyebrow">STEP {step} OF 3</div><h2>{step===1?'Upload reference reports':step===2?'Reference intelligence results':'Report details'}</h2><p>{step===1?'We extract document text locally and then identify likely chapters, headings and front matter.':'The engine detects document structure from text patterns. It does not copy paragraphs or use a generative AI service.'}</p></div><div className="counter"><strong>{readyCount}</strong><small>ready references</small></div></div>

      {step===1 && <>
        <label className="dropzone" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();processFiles(event.dataTransfer.files);}}>
          <input type="file" multiple accept=".pdf,.docx" onChange={event=>processFiles(event.target.files)} />
          <span className="upload-icon">↑</span><strong>Drop reference reports here</strong><span>or browse files · PDF and DOCX · maximum 20 MB each</span><em>Scanned PDFs need OCR; legacy .DOC must be converted to .DOCX</em>
        </label>
        <div className="file-list">{files.map(file=><article className="file-row" key={file.id}><div className="file-type">{file.name.toLowerCase().endsWith('.pdf')?'PDF':'DOCX'}</div><div className="file-info"><strong>{file.name}</strong><small>{file.message}</small>{file.status==='processing'&&<div className="progress"><span style={{width:`${file.progress}%`}}/></div>}{file.status==='ready'&&<small className="success">{file.details.type}{file.details.pages?` · ${file.details.pages} pages`:''} · text extracted</small>}{file.status==='failed'&&<small className="failure">{file.message}</small>}</div><button className="remove" onClick={()=>removeFile(file.id)} aria-label={`Remove ${file.name}`}>×</button></article>)}</div>
        <div className="notice"><strong>Privacy and limitations</strong><p>Files are processed in this browser. PDF and DOCX text extraction is local; scanned PDFs require OCR, and old binary DOC files must be converted. Reference files are not sent to an AI service.</p></div>
      </>}

      {step===2 && analysis && <>
        <div className="analysis-summary">
          <div><strong>{analysis.documentCount}</strong><span>Documents analysed</span></div>
          <div><strong>{analysis.headings.length}</strong><span>Candidate headings</span></div>
          <div><strong>{Math.round(analysis.totalCharacters/1000)}k</strong><span>Text characters</span></div>
        </div>
        <div className="analysis-columns">
          <section className="analysis-card"><div className="card-heading"><h3>Suggested report outline</h3><span>Editable</span></div><p className="muted">Untick sections you do not need. You can rename every heading before moving forward.</p>
            <div className="outline-list">{outline.map((item,index)=><div className="outline-item" key={item.id}><label className="outline-check"><input type="checkbox" checked={item.included} onChange={()=>toggleOutline(item.id)}/><span>{String(index+1).padStart(2,'0')}</span></label><input className="outline-title" value={item.title} onChange={event=>renameOutline(item.id,event.target.value)}/><small>{item.sourceMatches.length ? `${item.sourceMatches.length} match(es)` : 'Suggested section'}</small></div>)}</div>
          </section>
          <section className="analysis-card"><div className="card-heading"><h3>Headings found in references</h3><span>{analysis.headings.length} found</span></div>
            <div className="detected-list">{analysis.headings.slice(0,30).map((item,index)=><article key={`${item.source}-${index}`}><strong>{item.title}</strong><small>{item.source} · {item.category}</small></article>)}</div>
          </section>
        </div>
        <div className="notice"><strong>Analysis limits</strong><p>{analysis.limitations} The suggested outline is a starting point; compare it with your institution's required report format before writing.</p></div>
        <div className="actions inline-actions"><button className="secondary" onClick={downloadStructure}>Download structure</button><button className="secondary" onClick={()=>setStep(1)}>Back to references</button><button className="primary" onClick={()=>setStep(3)}>Use this outline →</button></div>
      </>}

      {step===3 && <>
        <div className="next-panel"><h3>Start your report</h3><label>Report title<input value={reportTitle} onChange={event=>setReportTitle(event.target.value)}/></label><p>Your outline contains {outline.filter(item=>item.included).length} selected sections. The next module will collect your placement information, practical activities, logbook entries and evidence photographs.</p><div className="selected-outline">{outline.filter(item=>item.included).map((item,index)=><div key={item.id}>{index+1}. {item.title}</div>)}</div></div>
        <div className="actions"><button className="secondary" onClick={()=>setStep(2)}>Back to structure</button><button className="primary" onClick={()=>setError('The report-details editor is the next build stage; your selected outline is ready.')}>Continue to report details →</button></div>
      </>}

      {error&&<div className="error-banner" role="alert">{error}</div>}
      {step===1&&<div className="actions"><button className="secondary" onClick={()=>{setStep(3);setError('')}} disabled={busy}>Continue without references</button><button className="primary" onClick={runAnalysis} disabled={busy||readyCount===0}>{busy?'Processing…':'Analyse references'} →</button></div>}
    </section>
    <footer>Raymond Report Studio · React + Vite · Browser-based document intelligence</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
