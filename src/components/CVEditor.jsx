import React, { useState } from 'react';
import API from '../api';
import { v4 as uuidv4 } from 'uuid';
import CVPreview from './CVPreview';

const defaultSections = [
  { id: uuidv4(), title: 'Experience', items: [], order: 0 },
  { id: uuidv4(), title: 'Education', items: [], order: 1 },
  { id: uuidv4(), title: 'Skills', items: [], order: 2 }
];

export default function CVEditor() {
  const [cv, setCv] = useState({
    name: '',
    email: '',
    phone: '',
    headline: '',
    summary: '',
    sections: defaultSections
  });

  const [selectedSectionId, setSelectedSectionId] = useState(cv.sections[0].id);
  const [loading, setLoading] = useState(false);
  const [savedCvId, setSavedCvId] = useState(null);

  function updateField(field, value) {
    setCv(prev => ({ ...prev, [field]: value }));
  }

  function addSection() {
    const s = { id: uuidv4(), title: 'New Section', items: [], order: cv.sections.length };
    setCv(prev => ({ ...prev, sections: [...prev.sections, s] }));
    setSelectedSectionId(s.id);
  }

  function removeSection(id) {
    setCv(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    if (selectedSectionId === id && cv.sections.length > 1) {
      setSelectedSectionId(cv.sections[0].id);
    }
  }

  function updateSectionTitle(id, title) {
    setCv(prev => ({ ...prev, sections: prev.sections.map(s => s.id===id ? {...s, title} : s) }));
  }

  function addItemToSection(id) {
    const item = { id: uuidv4(), title: 'Title', subtitle: '', details: '', points: [] };
    setCv(prev => ({ ...prev, sections: prev.sections.map(s => s.id===id ? {...s, items: [...s.items, item]} : s) }));
  }

  function updateItem(sectionId, itemId, field, value) {
    setCv(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: s.items.map(it => it.id===itemId ? { ...it, [field]: value } : it)
        };
      })
    }));
  }

  function addPoint(sectionId, itemId) {
    updateItem(sectionId, itemId, 'points', [...(cv.sections.find(s=>s.id===sectionId).items.find(i=>i.id===itemId).points || []), 'New Point']);
  }

  function removeItem(sectionId, itemId) {
    setCv(prev => ({ ...prev, sections: prev.sections.map(s => s.id===sectionId ? {...s, items: s.items.filter(i => i.id !== itemId)} : s) }));
  }

  function moveSectionUp(idx) {
    if (idx === 0) return;
    setCv(prev => {
      const arr = [...prev.sections];
      [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
      return { ...prev, sections: arr.map((s,i)=>({...s, order:i})) };
    });
  }
  function moveSectionDown(idx) {
    if (idx === cv.sections.length-1) return;
    setCv(prev => {
      const arr = [...prev.sections];
      [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
      return { ...prev, sections: arr.map((s,i)=>({...s, order:i})) };
    });
  }

  async function saveCV() {
    setLoading(true);
    try {
      if (savedCvId) {
        const res = await API.put(`/cv/${savedCvId}`, cv);
        setCv(res.data);
        alert('Saved updated CV');
      } else {
        const res = await API.post('/cv', cv);
        setCv(res.data);
        setSavedCvId(res.data._id);
        alert('Saved CV (ID: ' + res.data._id + ')');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving CV');
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!savedCvId) {
      await saveCV();
    }
    const id = savedCvId || cv._id;
    if (!id) {
      alert('Please save CV first');
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/cv/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(cv.name || 'resume').replace(/\s+/g,'_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Error generating PDF');
    } finally {
      setLoading(false);
    }
  }

  const selectedSection = cv.sections.find(s => s.id === selectedSectionId) || cv.sections[0];

  return (
    <>
      <div className="editor">
        <div>
          <label>Name</label>
          <input value={cv.name} onChange={e=>updateField('name', e.target.value)} />
          <div className="row">
            <div style={{flex:1}}>
              <label>Email</label>
              <input value={cv.email} onChange={e=>updateField('email', e.target.value)} />
            </div>
            <div style={{width:160}}>
              <label>Phone</label>
              <input value={cv.phone} onChange={e=>updateField('phone', e.target.value)} />
            </div>
          </div>
          <label>Headline</label>
          <input value={cv.headline} onChange={e=>updateField('headline', e.target.value)} />
          <label>Summary</label>
          <textarea rows={4} value={cv.summary} onChange={e=>updateField('summary', e.target.value)} />
        </div>

        <hr />

        <div>
          <h3>Sections</h3>
          <div>
            {cv.sections.map((s, idx) => (
              <div className="section" key={s.id}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <input value={s.title} onChange={e=>updateSectionTitle(s.id, e.target.value)} style={{fontWeight:700}} />
                  <div>
                    <button className="small-btn" onClick={()=> { setSelectedSectionId(s.id); }}>Edit</button>
                    <button className="small-btn" onClick={()=>moveSectionUp(idx)}>↑</button>
                    <button className="small-btn" onClick={()=>moveSectionDown(idx)}>↓</button>
                    <button className="small-btn" onClick={()=>removeSection(s.id)}>Delete</button>
                  </div>
                </div>

                {selectedSectionId === s.id && (
                  <div style={{marginTop:8}}>
                    <button className="small-btn" onClick={()=>addItemToSection(s.id)}>Add Item</button>
                    <div style={{marginTop:8}}>
                      {s.items.map(item=>(
                        <div key={item.id} style={{border:'1px solid #eee', padding:8, marginTop:8}}>
                          <input value={item.title} onChange={e=>updateItem(s.id,item.id,'title',e.target.value)} placeholder="Item title" />
                          <input value={item.subtitle} onChange={e=>updateItem(s.id,item.id,'subtitle',e.target.value)} placeholder="Subtitle / duration" />
                          <textarea rows={2} value={item.details} onChange={e=>updateItem(s.id,item.id,'details',e.target.value)} placeholder="Details"></textarea>
                          <div>
                            <strong>Points</strong>
                            {(item.points||[]).map((pIdx, pI)=>(
                              <div key={pI} style={{display:'flex', gap:8, alignItems:'center'}}>
                                <input value={item.points[pI]} onChange={e=>{
                                  const newPoints = [...(item.points||[])];
                                  newPoints[pI] = e.target.value;
                                  updateItem(s.id,item.id,'points', newPoints);
                                }} />
                                <button onClick={()=> {
                                  const newPoints = [...(item.points||[])];
                                  newPoints.splice(pI,1);
                                  updateItem(s.id,item.id,'points', newPoints);
                                }}>x</button>
                              </div>
                            ))}
                            <button onClick={()=> addPoint(s.id, item.id)}>Add Point</button>
                          </div>

                          <div style={{marginTop:6}}>
                            <button onClick={()=> removeItem(s.id,item.id) } className="small-btn">Remove Item</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{marginTop:8}}>
            <button className="button" onClick={addSection}>Add Section</button>
          </div>
        </div>

        <div style={{marginTop:16}}>
          <button className="button" onClick={saveCV} disabled={loading}>{loading ? 'Saving...' : 'Save CV'}</button>
          <button className="button" style={{marginLeft:8}} onClick={downloadPDF} disabled={loading}>{loading ? 'Working...' : 'Download PDF'}</button>
        </div>
      </div>

      <div className="preview">
        <h3>Preview</h3>
        <CVPreview cv={cv} />
      </div>
    </>
  );
}
