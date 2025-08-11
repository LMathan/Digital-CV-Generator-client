import React from 'react';

export default function CVPreview({ cv }) {
  return (
    <div>
      <div style={{borderBottom:'1px solid #eee', paddingBottom:8}}>
        <div style={{fontWeight:700, fontSize:18}}>{cv.name || 'Your Name'}</div>
        <div style={{fontSize:12, color:'#555'}}>{cv.email} • {cv.phone}</div>
        <div style={{marginTop:6}}>{cv.headline}</div>
      </div>

      {cv.summary && <div style={{marginTop:8, background:'#f8f8f8', padding:8}}>{cv.summary}</div>}

      <div style={{marginTop:12}}>
        {cv.sections && cv.sections.map(s => (
          <div key={s.id} style={{marginBottom:12}}>
            <div style={{fontWeight:700, color:'#0b63a6'}}>{s.title}</div>
            <div>
              {s.items && s.items.map(item => (
                <div key={item.id} style={{marginBottom:6}}>
                  {item.title && <div style={{fontWeight:600}}>{item.title}</div>}
                  {item.subtitle && <div style={{fontSize:12, color:'#666'}}>{item.subtitle}</div>}
                  {item.details && <div>{item.details}</div>}
                  {item.points && <ul>{item.points.map((p,i)=><li key={i}>{p}</li>)}</ul>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
