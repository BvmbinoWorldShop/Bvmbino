import fs from 'fs';

const css = `
/* 📸 FULL IMAGE SPECIALIST CARDS OVERRIDE 📸 */
.wcard { 
  border-radius: 10px !important; 
  cursor: pointer !important; 
  text-align: left !important; 
  transition: all .25s cubic-bezier(.4, 0, .2, 1) !important; 
  display: flex !important; 
  flex-direction: column !important; 
  justify-content: flex-end !important; 
  position: relative !important; 
  overflow: hidden !important; 
  border: 1px solid rgba(232,169,18,0.3) !important; 
  min-height: 180px !important; 
  padding: 14px !important; 
  background: #131820 !important; 
}
.wcard:hover { 
  transform: translateY(-4px) scale(1.02) !important; 
  box-shadow: 0 12px 32px rgba(232,169,18,.15), 0 0 0 1px #e8a912 !important; 
}
.w-persona { 
  position: absolute !important; 
  inset: 0 !important; 
  width: 100% !important; 
  height: 100% !important; 
  border-radius: 0 !important; 
  border: none !important; 
  background: none !important; 
  box-shadow: none !important; 
}
.w-persona img { 
  width: 100% !important; 
  height: 100% !important; 
  object-fit: cover !important; 
  opacity: 0.5 !important; 
  filter: grayscale(10%) contrast(1.1) !important; 
  transition: all .4s !important; 
}
.wcard:hover .w-persona img { 
  opacity: 0.9 !important; 
  filter: grayscale(0%) contrast(1.1) !important; 
  transform: scale(1.05) !important; 
}
.wcard::after { 
  content: '' !important; 
  position: absolute !important; 
  inset: 0 !important; 
  background: linear-gradient(to top, rgba(10,8,0,1) 0%, rgba(10,8,0,0.6) 50%, transparent 100%) !important; 
  pointer-events: none !important; 
  z-index: 1 !important; 
}
.w-info { 
  position: relative !important; 
  z-index: 2 !important; 
  display: flex !important; 
  flex-direction: column !important; 
  width: 100% !important; 
  min-width: 0 !important; 
}
.wct { 
  display: flex !important; 
  align-items: center !important; 
  font-family: 'Syne', sans-serif !important; 
  font-weight: 800 !important; 
  font-size: 15px !important; 
  color: #ffc842 !important; 
  margin-bottom: 3px !important; 
  text-shadow: 0 2px 4px rgba(0,0,0,.8) !important; 
}
.wcf { 
  font-size: 11px !important; 
  color: #fff !important; 
  font-weight: 600 !important; 
  margin-bottom: 4px !important; 
  text-shadow: 0 2px 4px rgba(0,0,0,.8) !important; 
}
.wcd { 
  font-size: 10px !important; 
  color: rgba(255,255,255,0.7) !important; 
  line-height: 1.4 !important; 
  display: -webkit-box !important; 
  -webkit-line-clamp: 2 !important; 
  -webkit-box-orient: vertical !important; 
  overflow: hidden !important; 
  text-shadow: 0 1px 2px rgba(0,0,0,.8) !important; 
  padding-right: 4px !important; 
}
.wcmd { 
  font-family: 'Space Mono', monospace !important; 
  font-size: 9px !important; 
  color: #e8a912 !important; 
  opacity: 0.9 !important; 
  font-style: italic !important; 
  margin-left: auto !important; 
  text-shadow: none !important; 
  background: rgba(0,0,0,0.6) !important; 
  padding: 2px 6px !important; 
  border-radius: 4px !important; 
  border: 1px solid rgba(232,169,18,0.3) !important; 
}
`;

fs.appendFileSync('C:/Users/tiegb/Documents/bvmbino ai agent/public/index.css', css);
console.log('Appended Full-Image CSS successfully');
