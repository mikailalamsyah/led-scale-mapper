// Core logic: scale real sizes into preview pixels
const el = id=>document.getElementById(id);
const ledWm = el('ledWidth'); // meters
const ledHm = el('ledHeight');
const screenWcm = el('screenWidth'); // cm
const screenHcm = el('screenHeight');
const objWcm = el('objectWidth'); // cm
const objHcm = el('objectHeight');
const calculate = el('calculate');
const modeSelect = el('mode');
const result = el('result');

const ledPreview = el('ledPreview');
const laptopPreview = el('laptopPreview');

let dragObj = null;
let dragOffset = {x:0,y:0};

function clearPreview(container){
  container.innerHTML = '';
}

function makeObjectDiv(cls){
  const d = document.createElement('div');
  d.className = cls;
  d.style.left='0px'; d.style.top='0px';
  return d;
}

function buildLEDGrid(container, pxPerMeter){
  // simple LED pixel grid to look realistic
  const grid = document.createElement('div');
  grid.className='preview-grid';
  const cols = Math.max(2, Math.floor(container.clientWidth / Math.max(4, pxPerMeter/25)));
  const rows = Math.max(2, Math.floor(container.clientHeight / Math.max(4, pxPerMeter/25)));
  // create fragment of dots
  const frag = document.createDocumentFragment();
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const dot = document.createElement('div');
      dot.className='preview-led-pixel';
      const size = Math.max(2, Math.round(pxPerMeter/40));
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = Math.round((c/(cols-1))*100) + '%';
      dot.style.top = Math.round((r/(rows-1))*100) + '%';
      dot.style.transform = 'translate(-50%,-50%)';
      frag.appendChild(dot);
    }
  }
  grid.appendChild(frag);
  container.appendChild(grid);
}

function enableDrag(elmnt){
  elmnt.style.cursor='grab';
  elmnt.onpointerdown = (ev)=>{
    dragObj = elmnt;
    dragOffset.x = ev.offsetX;
    dragOffset.y = ev.offsetY;
    elmnt.setPointerCapture(ev.pointerId);
  };
  elmnt.onpointermove = (ev)=>{
    if(!dragObj) return;
    const parent = elmnt.parentElement;
    const rect = parent.getBoundingClientRect();
    let x = ev.clientX - rect.left - dragOffset.x;
    let y = ev.clientY - rect.top - dragOffset.y;
    // clamp
    x = Math.max(0, Math.min(x, parent.clientWidth - elmnt.clientWidth));
    y = Math.max(0, Math.min(y, parent.clientHeight - elmnt.clientHeight));
    elmnt.style.left = x + 'px';
    elmnt.style.top = y + 'px';
  };
  elmnt.onpointerup = (ev)=>{
    dragObj = null;
    try{ elmnt.releasePointerCapture(ev.pointerId);}catch(e){}
  };
}

function render(){
  result.textContent = '';
  const ledW = parseFloat(ledWm.value) || 3;
  const ledH = parseFloat(ledHm.value) || 2;
  const scrW = parseFloat(screenWcm.value) || 9.82;
  const scrH = parseFloat(screenHcm.value) || 6;
  const objW = parseFloat(objWcm.value) || 130;
  const objH = parseFloat(objHcm.value) || 50;
  const mode = modeSelect.value;

  // Normalization:
  // Choose px scale so the preview remains reasonable size.
  const maxPreviewPx = 800; // max dimension in px
  // LED: meters -> px
  const ledAspect = ledW / ledH;
  let pxPerMeter = Math.min(250, maxPreviewPx / Math.max(ledW, ledH));
  pxPerMeter = Math.round(pxPerMeter);

  const ledPxW = Math.round(ledW * pxPerMeter);
  const ledPxH = Math.round(ledH * pxPerMeter);

  // Laptop: cm -> px (we'll scale to fit alongside)
  // Convert laptop cm to meters for consistent scaling
  const scrWm = scrW / 100;
  const scrHm = scrH / 100;
  // pick a laptop scale so it fits (smaller than LED usually)
  let pxPerMeterLaptop = Math.round(pxPerMeter * 0.3);
  const scrPxW = Math.round(scrWm * pxPerMeterLaptop);
  const scrPxH = Math.round(scrHm * pxPerMeterLaptop);

  // Object size in LED preview: object given in cm -> m
  const objWm = objW / 100;
  const objHm = objH / 100;
  const objLedPxW = Math.round(objWm * pxPerMeter);
  const objLedPxH = Math.round(objHm * pxPerMeter);
  const objLaptopPxW = Math.round(objWm * pxPerMeterLaptop);
  const objLaptopPxH = Math.round(objHm * pxPerMeterLaptop);

  // render LED preview
  clearPreview(ledPreview);
  ledPreview.style.width = ledPxW + 'px';
  ledPreview.style.height = ledPxH + 'px';
  // background / border for realism
  ledPreview.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.7)';
  if(mode === 'realistic'){
    buildLEDGrid(ledPreview, pxPerMeter);
  }
  const objDiv = makeObjectDiv('preview-object');
  objDiv.style.width = objLedPxW + 'px';
  objDiv.style.height = objLedPxH + 'px';
  objDiv.style.left = Math.max(8, Math.round((ledPreview.clientWidth - objLedPxW)/2)) + 'px';
  objDiv.style.top = Math.max(8, Math.round((ledPreview.clientHeight - objLedPxH)/2)) + 'px';
  ledPreview.appendChild(objDiv);
  if(mode === 'realistic') enableDrag(objDiv);

  // render Laptop preview
  clearPreview(laptopPreview);
  laptopPreview.style.width = scrPxW + 'px';
  laptopPreview.style.height = scrPxH + 'px';
  laptopPreview.style.boxShadow = 'inset 0 0 12px rgba(0,0,0,0.6)';
  if(mode === 'realistic'){
    buildLEDGrid(laptopPreview, pxPerMeterLaptop);
  }
  const objDiv2 = makeObjectDiv('preview-object');
  objDiv2.style.width = objLaptopPxW + 'px';
  objDiv2.style.height = objLaptopPxH + 'px';
  objDiv2.style.left = Math.max(6, Math.round((laptopPreview.clientWidth - objLaptopPxW)/2)) + 'px';
  objDiv2.style.top = Math.max(6, Math.round((laptopPreview.clientHeight - objLaptopPxH)/2)) + 'px';
  laptopPreview.appendChild(objDiv2);
  if(mode === 'realistic') enableDrag(objDiv2);

  result.textContent = 
    `LED: ${ledW} m × ${ledH} m -> ${ledPxW}px × ${ledPxH}px\n`+
    `Laptop: ${scrW} cm × ${scrH} cm -> ${scrPxW}px × ${scrPxH}px\n`+
    `Obj (LED): ${objW} cm × ${objH} cm -> ${objLedPxW}px × ${objLedPxH}px\n`+
    `Obj (Laptop): ${objW} cm × ${objH} cm -> ${objLaptopPxW}px × ${objLaptopPxH}px`;
}

calculate.addEventListener('click', render);
window.addEventListener('load', render);
