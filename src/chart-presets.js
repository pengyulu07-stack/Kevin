/* Each music chart has ten selectable art directions. Choices live on this device. */
(() => {
  const key='daytone-chart-designs-v1';
  const designs=[
    ['ink','Ink & Linen','Quiet slate, warm lettering'],
    ['sleeve','Record Sleeve','The cover takes the stage'],
    ['archive','Archive','A numbered listening index'],
    ['midnight','Midnight Cinema','Deep blue and still frames'],
    ['print','Letterpress','Ink pressed into paper'],
    ['gallery','Gallery Wall','Framed art and generous margins'],
    ['mono','Monochrome','A restrained black-and-white edition'],
    ['velvet','Velvet','Soft burgundy and copper'],
    ['blueprint','Blueprint','Fine lines and a cool field'],
    ['collage','Collage','Offset panels and editorial type']
  ];
  let choices={};
  try { choices=JSON.parse(localStorage.getItem(key)||'{}')||{}; } catch { choices={}; }
  const button=document.getElementById('chart-design-open');
  const dialog=document.createElement('dialog');dialog.id='chart-design-dialog';dialog.className='chart-design-dialog';
  const shell=document.createElement('div');shell.className='chart-design-shell';
  const head=document.createElement('div');head.className='chart-design-head';
  const copy=document.createElement('div'),eyebrow=document.createElement('small'),title=document.createElement('h2'),intro=document.createElement('p'),close=document.createElement('button');
  eyebrow.textContent='AILLEURS / DESIGN';title.textContent='Choose a listening room';intro.textContent='Choose a look for each music chart. Your choice is saved on this device.';
  copy.append(eyebrow,title,intro);close.type='button';close.textContent='×';close.setAttribute('aria-label','Close design choices');close.addEventListener('click',()=>dialog.close());head.append(copy,close);
  const selectLabel=document.createElement('label');selectLabel.textContent='Music chart';
  const chartSelect=document.createElement('select');chartSelect.setAttribute('aria-label','Music chart for design');selectLabel.append(chartSelect);
  const grid=document.createElement('div');grid.className='chart-design-grid';
  shell.append(head,selectLabel,grid);dialog.append(shell);document.body.append(dialog);
  const current=()=>window.daytoneGenre||'all';
  function categoryName(value){return value==='all'?'All Music':musicCharts.find(([id])=>id===value)?.[1]||value;}
  function options(){
    const selected=chartSelect.value||current();
    chartSelect.replaceChildren();
    for(const [id,label] of [['all','All Music'],...musicCharts]){
      const option=document.createElement('option');option.value=id;option.textContent=label;chartSelect.append(option);
    }
    chartSelect.value=[...chartSelect.options].some(option=>option.value===selected)?selected:'all';
  }
  function apply(){
    const category=current(),preset=designs.some(([id])=>id===choices[category])?choices[category]:'ink';
    document.body.dataset.chartDesign=preset;
    document.body.dataset.chartCategory=category;
    const palette=window.DaytoneMusicRooms?.genrePalette(category)||['#56646a','#efe8db'];
    document.body.style.setProperty('--chart-genre-ink',palette[0]);
    document.body.style.setProperty('--chart-genre-paper',palette[1]);
  }
  function render(){
    const category=chartSelect.value||'all',selected=choices[category]||'ink';grid.replaceChildren();
    for(const [id,name,description] of designs){
      const tile=document.createElement('button');tile.type='button';tile.className='chart-design-tile';tile.dataset.design=id;
      tile.setAttribute('aria-pressed',String(id===selected));tile.setAttribute('aria-label',name+' for '+categoryName(category));
      const specimen=document.createElement('span');specimen.className='chart-design-specimen';specimen.textContent='AILLEURS';
      const nameNode=document.createElement('strong');nameNode.textContent=name;
      const detail=document.createElement('small');detail.textContent=description;
      tile.append(specimen,nameNode,detail);
      tile.addEventListener('click',()=>{choices[category]=id;localStorage.setItem(key,JSON.stringify(choices));if(category===current())apply();render();});
      grid.append(tile);
    }
  }
  chartSelect.addEventListener('change',render);
  button?.addEventListener('click',()=>{options();chartSelect.value=current();render();dialog.showModal();});
  window.addEventListener('daytone:screen-changed',()=>queueMicrotask(apply));
  window.addEventListener('daytone:categories',()=>{if(dialog.open){options();render();}apply();});
  window.DaytoneChartDesigns={apply,open:()=>button?.click()};
  apply();
})();
