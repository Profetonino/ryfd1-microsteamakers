(function(){
  // ---------- Navegación ----------
  const $=id=>document.getElementById(id);
  function go(id){ window.location.href=(id==='inicio'?'index':id)+'.html'; }

  // ---------- Mapa de niveles ----------
  const LEVELS=[
    ['N0','Tu placa y tu entorno','Inicializar, Bucle y consola','n0'],
    ['N1','Secuencias y tiempo','Colores, esperas y animaciones','n1'],
    ['N2','Variables','Números, textos y verdadero/falso','n2'],
    ['N3','Botones y decisiones','Si… si no, y la consola para depurar','n3'],
    ['N4','Sensores y umbrales','Luz y sonido: medir e interpretar','n4'],
    ['R50','Reto 50','El semáforo de ruido del aula',null,'reto'],
    ['N5','Sonido y bucles','Zumbador, notas y melodías',null],
    ['N6','Listas y bucles anidados','Gráficos de barras en la matriz',null],
    ['N7','Funciones y movimiento','Acelerómetro y Serial Plotter',null],
    ['N8','Datos','Temperatura, energía y registro en microSD',null],
    ['N9','La placa de expansión','Sensores y actuadores externos',null],
    ['N10','Conectividad','Placas que hablan entre sí (ESP-NOW)',null],
    ['R100','Reto 100','Estación ambiental del aula',null,'reto']
  ];
  const done={};
  function drawLevels(){
    const box=document.getElementById('levels'); if(!box) return; box.innerHTML='';
    LEVELS.forEach(([n,t,d,id,kind])=>{
      const el=document.createElement('div');
      el.className='lv'+(id?'':' soon')+(kind?' '+kind:'')+(id&&done[id]?' done':'');
      el.innerHTML=`<div class="n">${n}${id&&done[id]?' ✓':''}</div><div class="t">${t}</div><div class="d">${id?d:d+' · próximamente'}</div>`;
      if(id) el.addEventListener('click',()=>go(id));
      box.appendChild(el);
    });
  }
  drawLevels();
  document.querySelectorAll('[data-done]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.done; done[id]=!done[id];
    b.classList.toggle('on',done[id]); b.textContent=(done[id]?'☑ ':'☐ ')+'He terminado el '+id.toUpperCase();
    drawLevels();
  }));

  // ---------- Matriz simulada ----------
  function makeMatrix(el){ if(!el) return []; el.innerHTML=''; for(let i=0;i<25;i++) el.appendChild(document.createElement('i')); return [...el.children]; }
  function paint(cells,arr){ cells.forEach((c,i)=>c.style.background=arr[i]||'#2a2a2a'); }
  function fill(cells,col){ paint(cells,Array(25).fill(col)); }

  // Fuente 5x5 mínima para HOLA (para la simulación del scroll)
  const FONT={H:['#..#','#..#','####','#..#','#..#'],O:['.##.','#..#','#..#','#..#','.##.'],L:['#...','#...','#...','#...','####'],A:['.##.','#..#','####','#..#','#..#'],' ':['..','..','..','..','..']};
  function textCols(t){ const rows=['','','','','']; for(const ch of t){const g=FONT[ch]||FONT[' ']; for(let r=0;r<5;r++) rows[r]+=g[r]+'.';} return rows; }

  // ---------- Consola simulada ----------
  function Serial(el,title,script,opts={}){
    if(!el) return;
    el.innerHTML=`<div class="bar"><b>Consola</b> · 115200 baudios <span class="sp"></span><button class="go">▶ Simular</button><button class="cl">Limpiar</button></div><div class="out"></div>`;
    const out=el.querySelector('.out'), bgo=el.querySelector('.go'), bcl=el.querySelector('.cl');
    let timer=null, t0=0, running=false;
    function print(s){ const ms=Date.now()-t0; const d=document.createElement('div'); d.innerHTML=`<span class="t">${String(Math.floor(ms/1000)).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')} → </span>`; d.appendChild(document.createTextNode(s)); out.appendChild(d); out.scrollTop=out.scrollHeight; if(out.children.length>200) out.removeChild(out.firstChild); }
    const api={print};
    function stop(){ running=false; clearTimeout(timer); bgo.textContent='▶ Simular'; bgo.classList.remove('stop'); opts.onStop&&opts.onStop(); }
    async function run(){
      running=true; t0=Date.now(); bgo.textContent='■ Parar'; bgo.classList.add('stop'); out.innerHTML='';
      const wait=ms=>new Promise(r=>{timer=setTimeout(r,ms)});
      try{
        for(const step of script.setup){ if(!running) return; await step(api,wait); }
        while(running){ for(const step of script.loop){ if(!running) return; await step(api,wait); } }
      }catch(e){}
    }
    bgo.addEventListener('click',()=>running?stop():run());
    bcl.addEventListener('click',()=>out.innerHTML='');
    out.innerHTML='<span class="t">Pulsa ▶ Simular para ver lo que enviaría la placa.</span>';
  }

  // N0a
  Serial(document.getElementById('sim-n0a'),'',{
    setup:[api=>api.print('Hola. Esto está en INICIALIZAR: se escribe UNA sola vez.')],
    loop:[api=>api.print('Esto está en BUCLE: se repite sin parar'),(api,w)=>w(1000)]
  });

  // N0b: scroll de HOLA
  const mx0b=makeMatrix(document.getElementById('mx-n0b'));
  const cols0b=textCols('HOLA');
  Serial(document.getElementById('sim-n0b'),'',{
    setup:[api=>{fill(mx0b,'#2a2a2a'); api.print('Empiezo: voy a escribir HOLA en la matriz');}],
    loop:[async (api,w)=>{
      const W=cols0b[0].length; const start=Date.now();
      for(let off=5; off>=-W; off--){ const arr=[]; for(let y=0;y<5;y++)for(let x=0;x<5;x++){const c=cols0b[y][x-off]; arr.push(c==='#'?'#00aaff':'#2a2a2a');} paint(mx0b,arr); await w(120); }
      const rest=4000-(Date.now()-start); if(rest>0) await w(rest);
    }, api=>api.print('Mensaje terminado. Vuelvo a empezar')]
  },{onStop:()=>fill(mx0b,'#2a2a2a')});

  // N1a semáforo
  const mx1a=makeMatrix(document.getElementById('mx-n1a'));
  Serial(document.getElementById('sim-n1a'),'',{
    setup:[api=>api.print('Semáforo en marcha')],
    loop:[api=>api.print('ROJO: los coches esperan'),()=>fill(mx1a,'#ff2a2a'),(a,w)=>w(3000),
          api=>api.print('VERDE: los coches pasan'),()=>fill(mx1a,'#22dd44'),(a,w)=>w(3000),
          api=>api.print('ÁMBAR: atención, va a cambiar'),()=>fill(mx1a,'#ffaa00'),(a,w)=>w(1000)]
  },{onStop:()=>fill(mx1a,'#2a2a2a')});

  // N1b corazón
  const BIG=['.#.#.','#####','#####','.###.','..#..'], SMALL=['.....','.#.#.','.###.','..#..','.....'];
  const bmp=(rows,c)=>rows.join('').split('').map(ch=>ch==='#'?c:'#2a2a2a');
  const mx1b=makeMatrix(document.getElementById('mx-n1b'));
  Serial(document.getElementById('sim-n1b'),'',{
    setup:[api=>api.print('Corazón listo')],
    loop:[api=>{paint(mx1b,bmp(BIG,'#ff2a2a'));api.print('pum');},(a,w)=>w(150),()=>paint(mx1b,bmp(SMALL,'#ff2a2a')),(a,w)=>w(150),
          api=>{paint(mx1b,bmp(BIG,'#ff2a2a'));api.print('pum');},(a,w)=>w(150),()=>paint(mx1b,bmp(SMALL,'#ff2a2a')),(a,w)=>w(700)]
  },{onStop:()=>paint(mx1b,bmp(SMALL,'#ff2a2a'))});
  paint(mx1b,bmp(SMALL,'#ff2a2a'));

  // ---------- N2: fuente real Font5x5Fixed (extraída de la librería) ----------
  const F5={"0":[".###.","#..#.","#..#.","#..#.","###.."],"1":["#.","#.","#.","#.","#."],"2":["####.","...#.","####.","#....","####."],"3":["####.","...#.",".###.","...#.","####."],"4":["#..#.","#..#.","####.","...#.","...#."],"5":["####.","#....","###..","...#.","###.."],"6":["####.","#....","####.","#..#.","####."],"7":["####.","...#.","..#..",".#...",".#..."],"8":["####.","#..#.","####.","#..#.","####."],"9":["####.","#..#.","####.","...#.","####."]," ":["...","...","...","...","..."],"-":["....","....","###.","....","...."]};
  function txtArr(s,col){ const rows=['','','','','']; for(const ch of s){const g=F5[ch]||F5[' ']; for(let r=0;r<5;r++) rows[r]+=g[r];} const a=[]; for(let y=0;y<5;y++)for(let x=0;x<5;x++) a.push(rows[y][x]==='#'?col:'#2a2a2a'); return a; }
  // N2a dado con botón
  const mx2a=makeMatrix(document.getElementById('mx-n2a'));
  if(document.getElementById('sim-n2a')){
  const sim2a=document.getElementById('sim-n2a');
  sim2a.innerHTML=`<div class="bar"><b>Consola</b> · 115200 baudios <span class="sp"></span><button class="cl">Limpiar</button></div><div class="out"></div>`;
  const out2a=sim2a.querySelector('.out'); const t2a=Date.now();
  function p2a(s){const ms=Date.now()-t2a; const d=document.createElement('div'); d.innerHTML=`<span class="t">${String(Math.floor(ms/1000)).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')} → </span>`; d.appendChild(document.createTextNode(s)); out2a.appendChild(d); out2a.scrollTop=out2a.scrollHeight;}
  p2a('Pulsa A para lanzar el dado');
  sim2a.querySelector('.cl').addEventListener('click',()=>out2a.innerHTML='');
  document.getElementById('btn-n2a').addEventListener('click',()=>{ const v=1+Math.floor(Math.random()*6); p2a('Ha salido: '+v); paint(mx2a,txtArr(String(v),'#ffffff')); });
  }
  // N2b contador que miente (reproduce String(x,0): relleno hasta 2 caracteres)
  const mx2b=makeMatrix(document.getElementById('mx-n2b'));
  const pad2=n=>String(n).padStart(2,' ');
  let c2b=0;
  Serial(document.getElementById('sim-n2b'),'',{
    setup:[api=>{c2b=0; api.print('Contador de 0 a 9');}],
    loop:[api=>{api.print('contador = '+pad2(c2b)); paint(mx2b,txtArr(pad2(c2b),'#ffaa00')); c2b=(c2b+1)%10;},(a,w)=>w(1000)]
  },{onStop:()=>fill(mx2b,'#2a2a2a')});
  // N2c ficha
  let s2c=0;
  Serial(document.getElementById('sim-n2c'),'',{
    setup:[api=>{s2c=0; api.print('Hola, me llamo micro:STEAMakers');}],
    loop:[api=>{s2c++; api.print('Llevo '+s2c+' segundos encendida'); api.print('¿Encendida? 1');},(a,w)=>w(1000)]
  });

  // ---------- N3 ----------
  if(document.getElementById('sim-n3a')){
    const st={A:0,B:0,T:0};
    document.querySelectorAll('.hold').forEach(b=>{
      const k=b.dataset.k, on=e=>{e.preventDefault(); st[k]=1; b.classList.add('ghost');}, off=()=>{st[k]=0; b.classList.remove('ghost');};
      b.addEventListener('pointerdown',on); ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,off));
    });
    Serial(document.getElementById('sim-n3a'),'',{
      setup:[api=>api.print('Lector de botones: pulsa A, B o el logo')],
      loop:[api=>api.print(`A = ${st.A}   B = ${st.B}   táctil = ${st.T}`),(a,w)=>w(200)]
    });
  }
  function miniConsole(el){ el.innerHTML=`<div class="bar"><b>Consola</b> · 115200 baudios <span class="sp"></span><button class="cl">Limpiar</button></div><div class="out"></div>`; const out=el.querySelector('.out'), t0=Date.now(); el.querySelector('.cl').addEventListener('click',()=>out.innerHTML=''); return s=>{const ms=Date.now()-t0; const d=document.createElement('div'); d.innerHTML=`<span class="t">${String(Math.floor(ms/1000)).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')} → </span>`; d.appendChild(document.createTextNode(s)); out.appendChild(d); out.scrollTop=out.scrollHeight;}; }
  if(document.getElementById('sim-n3b')){
    const mx=makeMatrix(document.getElementById('mx-n3b')); const pr=miniConsole(document.getElementById('sim-n3b'));
    let c=0; const draw=()=>paint(mx,txtArr(String(c),'#33ff33')); pr('Contador listo. A suma, B resta, logo pone a cero'); draw();
    document.getElementById('n3b-a').addEventListener('click',()=>{c++; pr('Contador: '+c); draw();});
    document.getElementById('n3b-b').addEventListener('click',()=>{c--; pr('Contador: '+c); draw();});
    document.getElementById('n3b-t').addEventListener('click',()=>{c=0; pr('Reinicio. Contador: 0'); draw();});
  }
  if(document.getElementById('sim-n3c')){
    const mx=makeMatrix(document.getElementById('mx-n3c')); const pr=miniConsole(document.getElementById('sim-n3c'));
    let on=false; pr('Interruptor: pulsa A para encender o apagar');
    document.getElementById('n3c-a').addEventListener('click',()=>{on=!on; fill(mx,on?'#ffdd55':'#2a2a2a'); pr(on?'Luz: ENCENDIDA':'Luz: APAGADA');});
  }


  // ---------- Glosario y mejoras didácticas ----------
  const GLOS={"microcontrolador": ["Microcontrolador", "Ordenador diminuto metido en un solo chip, con procesador, memoria y pines. Ejecuta siempre el programa que tiene guardado. El de nuestra placa es un ESP32."], "pin": ["Pin", "Cada una de las «patas» del microcontrolador por las que entra o sale una señal eléctrica. Se nombran con un número: io39, io0…"], "sensor": ["Sensor", "Componente que mide algo del entorno (luz, sonido, temperatura, una pulsación) y lo convierte en una señal eléctrica. Es una entrada."], "actuador": ["Actuador", "Componente que actúa sobre el entorno: da luz, sonido o movimiento (la matriz de LED, el zumbador, un motor). Es una salida."], "consola": ["Consola (monitor serie)", "Ventana de STEAMakersBlocks que muestra lo que la placa envía con «Enviar línea»."], "puerto-serie": ["Puerto serie", "Canal por el que la placa y el ordenador se envían datos, uno detrás de otro, a través del cable USB."], "baudios": ["Baudios", "Velocidad del puerto serie. La placa y la consola deben usar la misma (en el curso, 115200); si no coinciden, salen caracteres raros."], "inicializar": ["Inicializar", "Zona del programa que se ejecuta una sola vez, al arrancar la placa. En C++ se llama setup()."], "bucle": ["Bucle", "Zona del programa que se repite sin parar mientras la placa tiene alimentación. En C++ se llama loop()."], "compilar": ["Compilar", "Traducir el programa al lenguaje de máquina que entiende el microcontrolador. STEAMakersBlocks lo hace cuando pulsas Subir."], "memoria-flash": ["Memoria flash", "Memoria de la placa donde se guarda el programa. No se borra al quitar la alimentación."], "connector": ["Connector", "Programa que se instala en el ordenador y hace de puente entre la web de STEAMakersBlocks y la placa conectada por USB."], "ms": ["Milisegundo (ms)", "La milésima parte de un segundo: 1000 ms = 1 s."], "us": ["Microsegundo (µs)", "La millonésima parte de un segundo: 1000 µs = 1 ms."], "rgb": ["RGB", "Forma de describir un color mezclando rojo (R), verde (G) y azul (B), cada uno con una intensidad de 0 a 255."], "led": ["LED", "Diodo emisor de luz. Cada punto de la matriz lleva dentro tres LED diminutos: rojo, verde y azul."], "bitmap": ["Bitmap", "Dibujo hecho de puntos. En la matriz, un bitmap dice de qué color es cada uno de los 25 LED."], "fotograma": ["Fotograma", "Cada uno de los dibujos que, mostrados uno tras otro, forman una animación."], "variable": ["Variable", "Espacio de la memoria con un nombre, donde se guarda un dato que puede cambiar mientras funciona el programa."], "tipo": ["Tipo de dato", "Clase de dato que guarda una variable: número, texto o verdadero/falso. En C++ hay que decidirlo al crearla."], "booleano": ["Booleano (Boolean)", "Dato que solo puede valer verdadero o falso. En la consola sale como 1 o 0."], "cpp": ["C++", "Lenguaje de programación al que STEAMakersBlocks traduce los bloques antes de compilarlos."], "libreria": ["Librería", "Código ya escrito por otras personas que se añade al programa para manejar un componente (la matriz, los botones…) sin programarlo desde cero."], "condicion": ["Condición", "Pregunta que solo se puede responder con verdadero o falso, como «luz < umbral». El bloque si ejecuta lo que tiene dentro cuando es verdadera."], "operador-logico": ["Operadores lógicos", "«y», «o», «no». «A y B» es verdadero solo si lo son las dos; «A o B», si lo es al menos una; «no A» da lo contrario de A."], "digital": ["Señal digital", "Señal que solo tiene dos valores: 0 y 1 (apagado o encendido, suelto o pulsado)."], "analogico": ["Señal analógica", "Señal que puede tomar cualquier valor dentro de un rango, como una tensión entre 0 y 3,3 V."], "logica-inversa": ["Lógica inversa", "Conexión en la que el pin lee 1 en reposo y 0 al actuar, por ejemplo al pulsar. Los botones A y B funcionan así."], "rebote": ["Rebote", "Al pulsar un botón, sus contactos chocan y se separan varias veces en pocos milisegundos. Sin antirrebote, la placa contaría varias pulsaciones."], "antirrebote": ["Antirrebote", "Técnica que ignora los cambios muy rápidos de un botón (de menos de 50 ms en nuestros bloques) para contar una sola pulsación."], "adc": ["ADC (convertidor analógico-digital)", "Parte del microcontrolador que convierte una tensión en un número. El del ESP32 es de 12 bits: da valores de 0 a 4095."], "bit": ["Bit", "La unidad mínima de información: un 0 o un 1. Con n bits se pueden escribir 2ⁿ números distintos; con 12 bits, 4096."], "bruto": ["Valor bruto", "Valor tal y como lo da el ADC, sin convertir: de 0 a 4095."], "umbral": ["Umbral", "Valor límite a partir del cual el programa cambia de comportamiento, por ejemplo encender una luz cuando la medida baja de él."], "histeresis": ["Histéresis", "Usar dos umbrales distintos, uno para encender y otro para apagar. Entre los dos no cambia nada, así el ruido de la medida no provoca parpadeos."], "ruido": ["Ruido (en una medida)", "Pequeñas variaciones de una medida que no se deben a lo que se quiere medir. Toda medida real tiene algo de ruido."], "plotter": ["Serial Plotter", "Herramienta de STEAMakersBlocks que dibuja en una gráfica los valores que envía el bloque Plotter. Permite grabarlos y descargarlos en CSV."], "csv": ["CSV", "Archivo de texto con los datos separados por comas. Se abre con cualquier hoja de cálculo."], "onda": ["Onda", "Variación que se repite muy deprisa. El sonido es una onda de presión del aire que sube y baja cientos o miles de veces por segundo."], "muestra": ["Muestra", "Una lectura de una señal en un instante concreto. Muestrear es tomar muchas lecturas seguidas."], "pico": ["Pico", "El valor más alto de un grupo de muestras."], "pwm": ["PWM", "Forma de regular una luz o un motor encendiéndolo y apagándolo muy deprisa. Muchas luces LED lo usan: parpadean tan rápido que el ojo no lo nota."], "fototransistor": ["Fototransistor", "Sensor de luz que deja pasar más corriente cuanta más luz recibe. En la placa, más luz da un valor mayor."], "map": ["Mapear (map)", "Bloque que pasa un valor de un rango a otro con una regla de tres, con números enteros y sin recortar."], "constrain": ["Limitar (constrain)", "Bloque que obliga a un valor a quedarse entre un mínimo y un máximo."]};
  (function(){
    // etiqueta «ampliación» en los «Bajo el capó»
    document.querySelectorAll('details.capo').forEach(d=>{
      const sm=d.querySelector('summary'); if(!sm||!/Bajo el capó/.test(sm.textContent)) return; if(!sm.querySelector('.opc')) sm.insertAdjacentHTML('beforeend','<span class="opc">Ampliación</span>');
      const inn=d.querySelector('.in'); if(inn&&!inn.querySelector('.amp')) inn.insertAdjacentHTML('afterbegin','<p class="amp">Para quien quiera saber más. No hace falta entenderlo todo para seguir con el nivel.</p>');
    });
    // ventana con la definición
    let pop=null;
    const close=()=>{ if(pop){pop.remove(); pop=null;} };
    document.addEventListener('click',e=>{
      const t=e.target.closest('.g');
      if(!t){ if(!e.target.closest('.gpop')) close(); return; }
      close(); const g=GLOS[t.dataset.g]; if(!g) return;
      pop=document.createElement('div'); pop.className='gpop';
      const local=document.getElementById('glosario');
      pop.innerHTML=`<b>${g[0]}</b>${g[1]}<br><a href="${local?'#':'glosario.html#g-'+t.dataset.g}" data-gk="${t.dataset.g}">Ver el glosario completo →</a>`;
      document.body.appendChild(pop);
      const r=t.getBoundingClientRect(), w=Math.min(320,window.innerWidth-24);
      pop.style.left=Math.max(12,Math.min(window.scrollX+r.left,window.scrollX+window.innerWidth-w-12))+'px';
      pop.style.top=(window.scrollY+r.bottom+8)+'px';
      const a=pop.querySelector('a'); if(local) a.addEventListener('click',ev=>{ev.preventDefault(); close(); go('glosario'); setTimeout(()=>hl(t.dataset.g),300);});
    });
    window.addEventListener('scroll',close,{passive:true});
    // página del glosario
    const list=document.getElementById('glos-list');
    function hl(k){ const dt=document.getElementById('g-'+k); if(!dt) return; dt.scrollIntoView({block:'center'}); dt.classList.add('hl'); setTimeout(()=>dt.classList.remove('hl'),2500); }
    if(list){
      const keys=Object.keys(GLOS).sort((a,b)=>GLOS[a][0].localeCompare(GLOS[b][0],'es'));
      list.innerHTML=keys.map(k=>`<dt id="g-${k}">${GLOS[k][0]}</dt><dd>${GLOS[k][1]}</dd>`).join('');
      const q=document.getElementById('glos-q');
      q.addEventListener('input',()=>{ const v=q.value.trim().toLowerCase(); list.querySelectorAll('dt').forEach(dt=>{ const dd=dt.nextElementSibling; const ok=!v||(dt.textContent+' '+dd.textContent).toLowerCase().includes(v); dt.style.display=dd.style.display=ok?'':'none'; }); });
      if(location.hash.startsWith('#g-')) setTimeout(()=>hl(location.hash.slice(3)),200);
    }
  })();
  // ---------- N4 ----------
  function Plotter(el,series,opts={}){
    if(!el) return null;
    el.innerHTML=`<div class="bar"><b>Serial Plotter</b> · simulación <span class="sp"></span>${series.map(s=>`<span class="lg"><i style="background:${s.color}"></i>${s.name}</span>`).join('')}<button class="cl">Pausa</button></div><canvas></canvas><div class="last"></div>`;
    const cv=el.querySelector('canvas'), ctx=cv.getContext('2d'), last=el.querySelector('.last'), N=opts.points||120;
    const data=series.map(()=>[]); let paused=false;
    el.querySelector('.cl').addEventListener('click',e=>{paused=!paused; e.target.textContent=paused?'Seguir':'Pausa';});
    function draw(){
      const w=cv.clientWidth||300, h=cv.clientHeight||200, r=window.devicePixelRatio||1;
      if(cv.width!==w*r){cv.width=w*r; cv.height=h*r;}
      ctx.setTransform(r,0,0,r,0,0); ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,w,h);
      let mx=opts.max!=null?opts.max:Math.max(10,...data.flat()); mx=opts.max!=null?mx:Math.ceil(mx*1.1);
      ctx.strokeStyle='#1f2b3d'; ctx.fillStyle='#6f86a3'; ctx.font='11px ui-monospace,Consolas,monospace'; ctx.lineWidth=1;
      for(let k=0;k<=4;k++){const y=6+(h-14)*k/4; ctx.beginPath(); ctx.moveTo(34,y); ctx.lineTo(w,y); ctx.stroke(); ctx.fillText(String(Math.round(mx*(1-k/4))),2,y+4);}
      series.forEach((s,i)=>{const d=data[i]; ctx.strokeStyle=s.color; ctx.lineWidth=2; ctx.beginPath();
        d.forEach((v,j)=>{const x=34+(w-36)*(j+N-d.length)/(N-1), y=6+(h-14)*(1-v/mx); j?ctx.lineTo(x,y):ctx.moveTo(x,y);}); ctx.stroke();});
    }
    return {push(vals){ if(paused) return; vals.forEach((v,i)=>{data[i].push(v); if(data[i].length>N) data[i].shift();}); draw(); last.textContent=series.map((s,i)=>`${s.name}=${Number(vals[i]).toFixed(6)}`).join('   ');}};
  }
  function onVisible(el,fn){ if(!el) return; let t=null; const io=new IntersectionObserver(es=>{es.forEach(e=>{ if(e.isIntersecting&&!t) t=fn(); else if(!e.isIntersecting&&t){clearInterval(t); t=null;} });}); io.observe(el); }
  const rnd=(a,b)=>a+Math.random()*(b-a);
  // Ruido de la luz y sonido «realistas» (a partir de una grabación con placa real)
  const LUZ_PCT=[()=>0,()=>Math.round(rnd(3,7)),()=>Math.round(rnd(14,20)),()=>Math.round(rnd(60,98))];
  const LUZ_TXT=['tapado','aula','ventana','linterna'];
  function sonidoInst(modo){ // una muestra suelta (bruto)
    const amp=[0,220,900][modo]; if(!amp) return Math.random()<0.02?Math.round(rnd(1,30)):0;
    const v=amp*Math.sin(Math.random()*2*Math.PI)*rnd(0.3,1); return v>0?Math.round(v):0;
  }
  if(document.getElementById('plot-n4a')){
    const P=Plotter(document.getElementById('plot-n4a'),[{name:'luz',color:'#ffd43b'},{name:'sonido',color:'#4dabf7'}],{max:100});
    const sl=document.getElementById('n4a-luz'), lv=document.getElementById('n4a-lv'); let voz=false, palm=0;
    sl.addEventListener('input',()=>lv.textContent=LUZ_TXT[sl.value]);
    document.querySelectorAll('#n4 .hold[data-s]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault(); voz=true; b.classList.add('ghost');}); ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{voz=false; b.classList.remove('ghost');}));});
    document.getElementById('n4a-palm').addEventListener('click',()=>palm=3);
    onVisible(document.getElementById('plot-n4a'),()=>setInterval(()=>{
      let s=0; if(palm>0){palm--; s=Math.random()<0.6?Math.round(rnd(5,30)):0;} else if(voz){ s=Math.random()<0.35?Math.round(rnd(1,13)):0; }
      P.push([LUZ_PCT[sl.value](),s]);
    },100));
  }
  if(document.getElementById('plot-n4b')){
    const P=Plotter(document.getElementById('plot-n4b'),[{name:'luz',color:'#ffd43b'},{name:'umbral',color:'#ff6b6b'}],{max:400});
    const mx=makeMatrix(document.getElementById('mx-n4b'));
    const sl=document.getElementById('n4b-luz'), um=document.getElementById('n4b-um'), v=document.getElementById('n4b-v'), uv=document.getElementById('n4b-uv');
    onVisible(document.getElementById('plot-n4b'),()=>setInterval(()=>{
      const luz=Math.max(0,Math.round(+sl.value+rnd(-6,6))), u=+um.value; v.textContent=sl.value; uv.textContent=u;
      fill(mx,luz<u?'#ffffff':'#2a2a2a'); P.push([luz,u]);
    },120));
  }
  if(document.getElementById('plot-n4c')){
    const P=Plotter(document.getElementById('plot-n4c'),[{name:'instante',color:'#4dabf7'},{name:'pico',color:'#ff922b'}]);
    let modo=0, palm=0, beat=0;
    document.querySelectorAll('#n4 [data-snd]').forEach(b=>b.addEventListener('click',()=>{modo=+b.dataset.snd; document.querySelectorAll('#n4 [data-snd]').forEach(x=>x.classList.toggle('on',x===b));}));
    document.getElementById('n4c-palm').addEventListener('click',()=>palm=1);
    onVisible(document.getElementById('plot-n4c'),()=>setInterval(()=>{
      let pico=0;
      if(modo===2){ beat=(beat+1)%5; pico=Math.round([1000,650,400,300,220][beat]*rnd(0.85,1.05)); }
      else if(modo===1){ pico=Math.random()<0.4?Math.round(rnd(20,270)):Math.round(rnd(0,15)); }
      else pico=Math.random()<0.08?Math.round(rnd(1,30)):0;
      if(palm>0){ pico=Math.max(pico,Math.round(rnd(700,1000))); palm=0; }
      const inst=modo===2?Math.round(pico*rnd(0,0.75)):(Math.random()<0.15?Math.round(pico*rnd(0,0.6)):0);
      P.push([inst,pico]);
    },135));
  }

  // ---------- Rejilla de índices ----------
  if(document.getElementById('idxgrid')){
  const ig=document.getElementById('idxgrid');
  for(let i=0;i<25;i++){const b=document.createElement('button'); b.dataset.i=i; b.tabIndex=-1; b.style.background=i===0?'#12a4b0':'#3a3a3a'; b.title=`LED ${i} · x=${i%5}, y=${Math.floor(i/5)}`; ig.appendChild(b);}

  }
  // ---------- Diseñador ----------
  if(document.getElementById('pal')){
  const COLORS=[['#ff0000','rojo'],['#00ff00','verde'],['#0000ff','azul'],['#ffaa00','ámbar'],['#ffff00','amarillo'],['#ff00ff','magenta'],['#00ffff','cian'],['#ffffff','blanco'],['#000000','apagado']];
  let cur='#ff0000'; const grid=Array(25).fill('#000000');
  const pal=document.getElementById('pal');
  COLORS.forEach(([c,n],k)=>{const b=document.createElement('button'); b.style.background=c==='#000000'?'repeating-linear-gradient(45deg,#444 0 4px,#222 4px 8px)':c; b.title=n; if(k===0)b.classList.add('on'); b.addEventListener('click',()=>{cur=c; pal.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on');}); pal.appendChild(b);});
  const dz=document.getElementById('dz'); const dcells=[];
  for(let i=0;i<25;i++){const b=document.createElement('button'); b.dataset.i=i; b.setAttribute('aria-label',`LED ${i}`); b.addEventListener('click',()=>{grid[i]=(grid[i]===cur)?'#000000':cur; drawD();}); dz.appendChild(b); dcells.push(b);}
  const name=c=>(COLORS.find(x=>x[0]===c)||[c,c])[1];
  const rgb=c=>{const n=parseInt(c.slice(1),16);return `${n>>16&255}, ${n>>8&255}, ${n&255}`};
  function drawD(){
    dcells.forEach((b,i)=>b.style.background=grid[i]==='#000000'?'#2a2a2a':grid[i]);
    const on=grid.map((c,i)=>[c,i]).filter(([c])=>c!=='#000000');
    document.getElementById('dz-out').textContent = on.length? on.map(([c,i])=>`LED ${String(i).padStart(2)}  (x=${i%5}, y=${Math.floor(i/5)})  ${name(c)}  RGB(${rgb(c)})`).join('\n') + `\n\nTotal: ${on.length} LED encendidos` : 'Todavía no has encendido ninguno.';
  }
  document.getElementById('dz-clear').addEventListener('click',()=>{grid.fill('#000000');drawD();});
  document.getElementById('dz-idx').addEventListener('click',()=>dz.classList.toggle('show-idx'));
  document.getElementById('dz-heart').addEventListener('click',()=>{BIG.join('').split('').forEach((ch,i)=>grid[i]=ch==='#'?'#ff0000':'#000000');drawD();});
  drawD();

  }
  // ---------- Infografía de la placa ----------
  if(document.getElementById('igstage')){
  const IGIMG={frente:'img/placa_frente.webp',detras:'img/placa_detras.webp'};
  const IG={
    frente:{w:709,h:712,k:1,items:[
      ['Botón A',85,35,'L','io0','N3','Pulsador. El programa sabe si está pulsado (1) o suelto (0). Lo usarás para dar órdenes a la placa.'],
      ['Conector USB-C',355,52,'R','—','N0','Por aquí se sube el programa, se alimenta la placa y viaja la consola serie.'],
      ['Botón B',625,35,'R','io17','N3','El segundo pulsador, igual que el A.'],
      ['Logo táctil',350,162,'L','io27','N3','Detecta el contacto de tu dedo sin necesidad de pulsar: mide un pequeño cambio eléctrico al tocarlo.'],
      ['Matriz 5×5 RGB',350,355,'R','io13','N1','25 LED de colores (WS2812) conectados en cadena a un único pin. Sirve para dibujar, escribir con scroll o hacer gráficos.'],
      ['Micrófono',93,368,'L','io35','N4','Mide el nivel de sonido y lo da como un número de 0 a 4095. Es la base del Reto 50: el semáforo de ruido.'],
      ['Sensor de luz',615,365,'R','io39','N4','Un fototransistor: cuanta más luz recibe, mayor es el valor que da (de 0 a 4095).'],
      ['Pines 0, 1 y 2',200,600,'L','io12 · io14 · io32','N9','Las anillas grandes sirven para pinzas de cocodrilo. Con la placa de expansión se convierten en conectores para sensores externos.'],
      ['Alimentación 3V y GND',580,600,'R','3,3 V · GND','N9','Salida de alimentación para pequeños sensores externos. ¡Nunca unas V con G directamente!']
    ]},
    detras:{w:504,h:498,k:1.4,items:[
      ['Botón RESET',150,46,'L','—','N0','Reinicia la placa: el programa vuelve a empezar desde Inicializar. Muy útil para ver otra vez los mensajes del principio en la consola.'],
      ['Conector USB-C',252,62,'L','—','N0','El mismo conector de la cara frontal, visto desde atrás.'],
      ['Entrada de batería',338,62,'R','—','N0','Conector para alimentar la placa con un portapilas o una batería, sin ordenador.'],
      ['Conector I2C',70,130,'L','SDA io21 · SCL io22','N9','Cuatro pines (GND, 3V3, SDA, SCL) para conectar sensores y pantallas I2C externos, como una pantalla OLED.'],
      ['Conversor USB-serie',210,140,'L','—','N0','Traduce el USB del ordenador al puerto serie del ESP32. Por este chip viajan tus programas al subirlos y los mensajes de la consola.'],
      ['ESP32 (el cerebro)',140,260,'L','—','N0','El microcontrolador: procesador de doble núcleo a 240 MHz, memoria, WiFi y Bluetooth. Aquí se ejecuta tu programa.'],
      ['Zumbador',302,195,'R','io33','N5','Produce tonos de la frecuencia que le digas: alarmas, avisos y melodías.'],
      ['Medidor de consumo',390,166,'R','io36','N8','Un amplificador (INA180) que mide la corriente que consume la placa. Con él calcularemos la potencia y la energía, y veremos cuánto gasta la matriz.'],
      ['Temperatura y humedad',446,231,'R','I2C (AHT20)','N8','Sensor AHT20: mide la temperatura y la humedad del aire.'],
      ['Ranura microSD',410,300,'R','SPI','N8','Para guardar datos de los sensores en una tarjeta y analizarlos después en una hoja de cálculo.'],
      ['Acelerómetro (IMU)',284,331,'L','I2C (MPU6050)','N7','Detecta inclinación, movimiento y giros en los tres ejes (X, Y, Z dibujados en la placa).']
    ]}
  };
  const SHIELD=[
    ['P0','io12','libre','Libre. Es analógica del grupo ADC2: no lee bien si usas WiFi.'],
    ['P1','io14','libre','Libre. ADC2: no lee bien con WiFi.'],
    ['P2','io32','libre','Libre y la mejor para sensores analógicos: es del grupo ADC1 y funciona aunque uses WiFi.'],
    ['P3','io13','ocupado','Ocupado por la matriz de LED. No lo uses.'],
    ['P4','io27','ocupado','Compartido con el logo táctil.'],
    ['P5','io0','ocupado','Es el botón A. No lo uses para otra cosa.'],
    ['P6','io2','libre','Libre (ADC2).'],
    ['P7','io25','libre','Libre. Además puede dar una salida analógica real (DAC).'],
    ['P8','io4','libre','Libre (ADC2).'],
    ['P9','io16','libre','Libre (solo digital).'],
    ['P10','io26','libre','Libre. También tiene salida analógica real (DAC).'],
    ['P11','io17','ocupado','Es el botón B. No lo uses para otra cosa.'],
    ['P12','io15','libre','Libre (ADC2).'],
    ['P13','io18','spi','Bus SPI: SCK (reloj). Lo usa la microSD.'],
    ['P14','io19','spi','Bus SPI: MISO (datos hacia el ESP32).'],
    ['P15','io23','spi','Bus SPI: MOSI (datos desde el ESP32).'],
    ['P16','io5','spi','Bus SPI: CS (selección del dispositivo).'],
    ['P19','io22','i2c','Bus I2C: SCL (reloj). Compartido con los sensores internos.'],
    ['P20','io21','i2c','Bus I2C: SDA (datos). Compartido con los sensores internos.']
  ];
  const SCOL={libre:'#2e9d52',ocupado:'#d64545',i2c:'#f29f05',spi:'#7c3aed'};
  const SNAME={libre:'Libre',ocupado:'Ocupado por la placa',i2c:'Bus I2C',spi:'Bus SPI'};
  const igStage=document.getElementById('igstage'), igList=document.getElementById('iglist'), igInfo=document.getElementById('iginfo');
  let igView='frente';
  function igSelect(i){
    igStage.querySelectorAll('.mk').forEach(m=>m.classList.toggle('sel',+m.dataset.i===i));
    igList.querySelectorAll('li').forEach(l=>l.classList.toggle('sel',+l.dataset.i===i));
    if(igView==='shield'){
      const [p,io,st,d]=SHIELD[i];
      igInfo.innerHTML=`<b>${p} → ${io}</b> <span class="pill" style="background:${SCOL[st]}22;color:${SCOL[st]}">${SNAME[st]}</span><p style="margin:.4em 0 0">${d}</p><p class="small" style="margin:.3em 0 0">En STEAMakersBlocks escribe siempre <b>${io}</b>, no ${p}.</p>`;
    } else {
      const it=IG[igView].items[i];
      igInfo.innerHTML=`<b>${it[0]}</b> <span class="pill">${it[4]}</span> <span class="pill crit">${it[5]}</span><p style="margin:.4em 0 0">${it[6]}</p>`;
    }
  }
  function igPhoto(v){
    const d=IG[v], k=d.k, W=d.w*k, H=d.h*k, M=330;
    const pts=d.items.map((it,i)=>({i,name:it[0],x:it[1]*k+M,y:it[2]*k,side:it[3]}));
    const place=side=>{ const arr=pts.filter(p=>p.side===side).sort((a,b)=>a.y-b.y); let last=-1e9; arr.forEach(p=>{p.ly=Math.max(p.y,last+54,26); last=p.ly;}); const over=last-(H-20); if(over>0) arr.forEach(p=>p.ly-=over); };
    place('L'); place('R');
    let s=`<svg viewBox="0 0 ${W+2*M} ${H}" data-full="0 0 ${W+2*M} ${H}" data-crop="${M-30} 0 ${W+60} ${H}" role="img" aria-label="Infografía de la micro:STEAMakers"><image href="${IGIMG[v]}" x="${M}" y="0" width="${W}" height="${H}"/>`;
    pts.forEach(p=>{
      const tw=p.name.length*12.4+22, lx=p.side==='L'?M-24:M+W+24, rx=p.side==='L'?lx-tw:lx;
      s+=`<g class="lbl"><line x1="${p.side==='L'?lx:lx}" y1="${p.ly}" x2="${p.x}" y2="${p.y}"/><rect x="${rx}" y="${p.ly-19}" width="${tw}" height="38" rx="10"/><text x="${rx+11}" y="${p.ly+8}">${p.name}</text></g>`;
    });
    pts.forEach(p=>{ s+=`<g class="mk" data-i="${p.i}"><circle class="ring" cx="${p.x}" cy="${p.y}" r="20"/><circle class="dot" cx="${p.x}" cy="${p.y}" r="20"/><text x="${p.x}" y="${p.y}">${p.i+1}</text></g>`; });
    return s+'</svg>';
  }
  function igShield(){
    const W=1100,H=745; let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pines de la placa de expansión Keyestudio con la micro:STEAMakers">`;
    s+=`<rect x="330" y="20" width="440" height="705" rx="26" fill="#1d1d1d" stroke="#000"/>`;
    s+=`<rect x="395" y="40" width="310" height="70" rx="8" fill="#2a2f38" stroke="#555"/><text x="550" y="82" fill="#e9c46a" font-size="22" font-weight="700" text-anchor="middle" font-family="system-ui">micro:STEAMakers aquí</text>`;
    s+=`<text x="550" y="150" fill="#e9c46a" font-size="30" font-weight="800" text-anchor="middle" font-family="system-ui">Keyestudio</text><text x="550" y="182" fill="#aab" font-size="16" text-anchor="middle" font-family="system-ui">Sensor shield V2 (micro:bit)</text>`;
    s+=`<g font-family="system-ui" font-size="15" fill="#ddd" text-anchor="middle"><text x="412" y="232">G</text><text x="438" y="232">V1</text><text x="464" y="232">S</text><text x="636" y="232">S</text><text x="662" y="232">V2</text><text x="688" y="232">G</text></g>`;
    SHIELD.forEach(([p,io,st],i)=>{
      const left=i<10, row=left?i:i-10, y=262+row*41, cx=left?438:662;
      const sx=left?464:636;
      s+=`<g class="mk" data-i="${i}">`;
      s+=`<rect x="${cx-40}" y="${y-15}" width="80" height="30" rx="5" fill="#111"/>`;
      s+=`<circle cx="${cx-26}" cy="${y}" r="8" fill="#333" stroke="#777"/><circle cx="${cx}" cy="${y}" r="8" fill="#c0392b"/><circle cx="${cx+26}" cy="${y}" r="8" fill="#e9c46a"/>`;
      const bx=left?40:780;
      s+=`<line x1="${left?bx+250:bx}" y1="${y}" x2="${left?cx-48:cx+48}" y2="${y}" stroke="${SCOL[st]}" stroke-width="2"/>`;
      s+=`<rect x="${bx}" y="${y-17}" width="250" height="34" rx="9" fill="${SCOL[st]}"/><text x="${bx+16}" y="${y+6}" fill="#fff" font-size="18" font-weight="800" font-family="system-ui">${p}</text><text x="${bx+226}" y="${y+6}" fill="#fff" font-size="17" font-weight="700" text-anchor="end" font-family="ui-monospace,Consolas,monospace">${io}</text>`;
      s+=`<circle class="ring" cx="${left?bx+250:bx}" cy="${y}" r="16" style="display:none"/></g>`;
    });
    s+=`<g font-family="system-ui" font-size="16" fill="#ddd" text-anchor="middle"><text x="550" y="680">Alimentación: jack 7–9 V o micro USB 5 V</text><text x="550" y="705">Jumpers V1 y V2: elige 3,3 V o 5 V</text></g>`;
    return s+'</svg><div class="ig-legend">'+Object.keys(SCOL).map(k=>`<span><i style="background:${SCOL[k]}"></i>${SNAME[k]}</span>`).join('')+'</div>';
  }
  function igRender(v){
    igView=v;
    document.querySelectorAll('#igtabs [data-v]').forEach(b=>b.classList.toggle('ghost',b.dataset.v!==v));
    if(v==='shield'){
      igStage.innerHTML=igShield();
      igList.innerHTML=SHIELD.map(([p,io,st],i)=>`<li data-i="${i}"><span class="num" style="background:${SCOL[st]}">${p}</span>${io}<span class="lv">${SNAME[st]}</span></li>`).join('');
      igInfo.innerHTML='<b>La placa de expansión</b><br><span class="small">Los números impresos en la shield (P0, P1…) son los de la micro:bit. En STEAMakersBlocks hay que usar el número «io» de la micro:STEAMakers. Sin alimentar la shield (jack o micro USB) no hay 5 V en sus conectores.</span>';
    } else {
      igStage.innerHTML=igPhoto(v);
      igList.innerHTML=IG[v].items.map((it,i)=>`<li data-i="${i}"><span class="num">${i+1}</span>${it[0]}<span class="lv">${it[5]}</span></li>`).join('');
      igInfo.innerHTML='<b>Elige un elemento</b><br><span class="small">Pulsa un número de la imagen o de la lista.</span>';
    }
    igStage.querySelectorAll('.mk').forEach(m=>m.addEventListener('click',()=>igSelect(+m.dataset.i)));
    igFit();
    igList.querySelectorAll('li').forEach(l=>l.addEventListener('click',()=>igSelect(+l.dataset.i)));
  }
  function igFit(){ const sv=igStage.querySelector('svg[data-full]'); if(!sv) return; const cw=igStage.clientWidth; if(!cw) return; const narrow=cw<560||igStage.classList.contains('nolabels'); sv.setAttribute('viewBox',narrow?sv.dataset.crop:sv.dataset.full); }
  window.addEventListener('resize',igFit);
  if('ResizeObserver' in window) new ResizeObserver(igFit).observe(igStage);
  document.querySelectorAll('#igtabs [data-v]').forEach(b=>b.addEventListener('click',()=>igRender(b.dataset.v)));
  document.getElementById('iglabels').addEventListener('change',e=>{igStage.classList.toggle('nolabels',!e.target.checked); igFit();});
  igRender('frente');

  }
  // ---------- Tests autocorregibles ----------
  const QUIZ={
    n4:[
      {q:'El bloque «Nivel de luz» en modo 0..4095 da 4095. ¿Qué significa?',o:['Que está a oscuras','Que el ADC lee el máximo: unos 3,3 V en el pin','Que el sensor está roto','Que hay 4095 lux'],a:1,f:'El ADC del ESP32 es de 12 bits: convierte de 0 a 3,3 V en un número de 0 a 4095. 4095 es el máximo que puede leer.'},
      {q:'En el aula, la luz marca 5 % todo el rato, tanto con la luz encendida como con la persiana a medias. ¿Qué harías?',o:['Cambiar de placa','Usar el valor bruto (0..4095), que tiene más detalle','Multiplicar por 100','Nada, el sensor no sirve'],a:1,f:'El porcentaje quita los decimales de valor × 100 ÷ 4095: muchos valores brutos distintos dan el mismo %. Con el bruto ves las diferencias pequeñas.'},
      {q:'Hablas delante de la placa y el bloque «Nivel de sonido» da casi siempre 0. ¿Por qué?',o:['El micrófono está apagado','Cada lectura es una foto de la onda en un instante, y casi siempre cae fuera de una cresta','Hay que hablar en inglés','Falta iniciar la consola'],a:1,f:'El sonido es una onda que sube y baja muy deprisa. Una lectura suelta capta un instante; para medir el ruido hay que tomar muchas y quedarse con la mayor (el pico).'},
      {q:'Una luz nocturna se enciende y se apaga sin parar cuando la luz está justo en el umbral. ¿Qué la arregla mejor?',o:['Esperar 5 segundos en cada vuelta','Dos umbrales: uno para encender y otro más alto para apagar','Subir el brillo','Usar el porcentaje'],a:1,f:'Es la histéresis: entre los dos umbrales la luz no cambia de estado, así que el ruido de la medida ya no la hace parpadear.'},
      {q:'¿Qué da map(1000, 0, 400, 0, 5) en Arduino?',o:['5','4','12','Un error'],a:2,f:'map hace la regla de tres sin recortar: 1000 × 5 ÷ 400 = 12,5 → 12 (entero). Para que no se salga de 0..4 hace falta constrain («limitar»).'}
    ],
    n3:[
      {q:'Quieres que una variable suba de 1 en 1 cada vez que pulsas A. ¿Qué bloque usas en la condición?',o:['Pulsador A pulsado','Pulsador A se ha pulsado','Pulsador táctil','Esperar 1000 ms'],a:1,f:'«Se ha pulsado» es verdadero una sola vez por pulsación; «pulsado» lo es todo el tiempo que mantienes el botón, y el contador subiría sin parar.'},
      {q:'Con el bloque «Pulsador A pulsado», ¿cuándo es verdadero?',o:['Una vez por pulsación','Solo al soltar','Todo el tiempo que lo mantienes apretado','Nunca, hay que usar el táctil'],a:2,f:'Pregunta por el estado de ahora mismo: es verdadero mientras el botón está apretado.'},
      {q:'Tienes: si «A pulsado» → verde; sino si «A pulsado y B pulsado» → ámbar. Pulsas los dos a la vez. ¿Qué color sale?',o:['Ámbar','Verde, porque la primera condición ya se cumple','Los dos a la vez','Ninguno'],a:1,f:'Se ejecuta solo la primera rama que se cumple. La condición de los dos botones tiene que ir antes que la de A sola.'},
      {q:'La variable encendida vale verdadero. ¿Cuánto vale «no encendida»?',o:['Verdadero','Falso','1','No se puede saber'],a:1,f:'«no» da el valor contrario: no verdadero = falso.'},
      {q:'En el código C++ los botones se leen como !digitalRead(0). ¿Por qué ese «!»?',o:['Es un error de STEAMakersBlocks','Porque al pulsar, el pin pasa a 0 (lógica inversa) y el ! le da la vuelta','Para leer más rápido','Para el antirrebote'],a:1,f:'Los botones A y B están a 1 en reposo y a 0 al pulsar. El ! (no) invierte el valor para que pulsado sea 1.'}
    ],
    n2:[
      {q:'¿Qué tipo de variable usarías para guardar el nombre de una persona?',o:['Número','Texto','Verdadero/falso','Cualquiera, da igual'],a:1,f:'Un nombre es una cadena de letras: una variable de tipo texto (String en C++, str en Python).'},
      {q:'Con el bloque «entero aleatorio de 1 a 6», ¿puede salir el 6?',o:['No, nunca sale el último','Sí: incluye los dos extremos','Solo si pulsas el botón dos veces','Solo sale el 6 si lo pones en Inicializar'],a:1,f:'El bloque incluye el 1 y el 6. Por dentro, STEAMakersBlocks llama a random(1, 7), porque random() de Arduino no incluye el máximo.'},
      {q:'En Inicializar, contador = 0. En Bucle: sumar 1 a contador y Esperar 1000 ms. ¿Cuánto vale contador al cabo de unos 5 segundos?',o:['0','1','5','5000'],a:2,f:'Cada vuelta del bucle suma 1 y tarda algo más de 1 s: tras unos 5 s, el contador vale 5.'},
      {q:'La consola muestra «contador =  3», con un espacio de más, y en la matriz el número sale desplazado. ¿Qué es lo más probable?',o:['La matriz está rota','El número se ha convertido a texto con «Formatear número» y se ha rellenado con un espacio','La variable es de tipo texto','Falta el bloque Iniciar de la matriz'],a:1,f:'«Formatear número con 0 decimales» rellena con espacios hasta un ancho mínimo. Para números sin decimales, usa «Número entero».'},
      {q:'Envías por la consola una variable de tipo verdadero/falso y aparece un «1». ¿Qué valor tiene?',o:['Falso','Verdadero','Es un error','No tiene valor'],a:1,f:'Al convertir un boolean a texto, verdadero se escribe como 1 y falso como 0.'}
    ],
    n0:[
      {q:'Pones un «Enviar línea» dentro de Inicializar. ¿Cuántas veces se ejecuta?',o:['Una vez cada segundo','Una sola vez, al arrancar la placa','Siempre, sin parar','Ninguna: Inicializar solo sirve para colocar bloques'],a:1,f:'Inicializar se ejecuta una única vez, al encenderse o reiniciarse la placa. Lo que se repite va en Bucle.'},
      {q:'Abres la consola y aparecen símbolos raros como ÿ⸮⸮. ¿Qué es lo más probable?',o:['La placa está estropeada','El programa tiene un error de compilación','La velocidad de la consola no coincide con la del programa','Falta el Connector'],a:2,f:'Si la consola escucha a una velocidad distinta de la que usa la placa, interpreta mal los bits y salen caracteres sin sentido. Las dos deben estar a 115200.'},
      {q:'En el Bucle hay un «Enviar línea» y un «Esperar 1000 ms». Aproximadamente, ¿cuántas líneas verás en 30 segundos?',o:['3','30','1000','30 000'],a:1,f:'Cada vuelta del bucle dura algo más de 1 segundo, así que en 30 segundos salen unas 30 líneas.'},
      {q:'Una vez subido el programa, desconectas el USB y alimentas la placa con una batería. ¿Qué pasa?',o:['El programa se borra','La placa sigue ejecutando el programa','Solo funciona la consola','Hay que volver a subirlo cada vez'],a:1,f:'El programa queda guardado en la memoria flash de la placa y se ejecuta solo en cuanto recibe alimentación.'},
      {q:'¿Cuál de estos elementos de la placa es un ACTUADOR?',o:['El micrófono','El botón A','El zumbador','El sensor de luz'],a:2,f:'Los actuadores actúan sobre el entorno (luz, sonido, movimiento). El zumbador produce sonido; los demás son sensores: captan información.'}
    ],
    n1:[
      {q:'En el Bucle pones: «Rellenar rojo», «Rellenar verde», «Esperar 3000 ms». ¿Qué ves en la matriz?',o:['Rojo 3 s y luego verde 3 s','Solo verde: el rojo dura tan poco que no se ve','Una mezcla de rojo y verde (amarillo)','Nada, porque falta un Esperar'],a:1,f:'Las dos instrucciones se ejecutan una detrás de otra en microsegundos. Sin una espera entre ellas, el rojo no llega a verse.'},
      {q:'¿Qué color produce RGB(255, 170, 0)?',o:['Azul claro','Ámbar o naranja','Violeta','Blanco'],a:1,f:'Mucho rojo, bastante verde y nada de azul: un amarillo anaranjado, el ámbar del semáforo.'},
      {q:'El semáforo tiene esperas de 3000, 3000 y 1000 ms. ¿Cuánto dura un ciclo completo?',o:['3 s','6 s','7 s','7000 s'],a:2,f:'3000 + 3000 + 1000 = 7000 ms = 7 segundos.'},
      {q:'Un latido del corazón dura 150 + 150 + 150 + 700 ms. ¿Cuántos latidos da por minuto (aproximadamente)?',o:['40','52','60','115'],a:1,f:'Un latido dura 1150 ms; 60 000 ÷ 1150 ≈ 52 latidos por minuto.'},
      {q:'¿Qué número tiene el LED de la columna x = 3 y la fila y = 2?',o:['5','13','17','23'],a:1,f:'Número = y × 5 + x = 2 × 5 + 3 = 13.'}
    ]
  };
  document.querySelectorAll('.quiz').forEach(box=>{
    const qs=QUIZ[box.dataset.quiz], wrap=box.querySelector('.qs'), score=box.querySelector('.score');
    function render(){
      wrap.innerHTML='';
      qs.forEach((it,k)=>{
        const d=document.createElement('div'); d.className='q';
        d.innerHTML=`<p>${k+1}. ${it.q}</p>`+it.o.map((o,j)=>`<label><input type="radio" name="${box.dataset.quiz}-${k}" value="${j}"> <span>${o}</span></label>`).join('')+`<div class="fb"></div>`;
        wrap.appendChild(d);
      }); score.textContent='';
    }
    box.querySelector('.qcheck').addEventListener('click',()=>{
      let ok=0;
      [...wrap.children].forEach((d,k)=>{
        const sel=d.querySelector('input:checked'); d.classList.remove('right','wrong');
        const fb=d.querySelector('.fb');
        if(!sel){ d.classList.add('wrong'); fb.textContent='Sin responder.'; return; }
        if(+sel.value===qs[k].a){ ok++; d.classList.add('right'); fb.textContent='✔ '+qs[k].f; }
        else { d.classList.add('wrong'); fb.textContent='✘ Todavía no. Vuelve a leer la parte de la práctica que trata esto y prueba otra vez.'; }
      });
      score.textContent=`${ok} / ${qs.length}`+(ok===qs.length?' 🎉':'');
    });
    box.querySelector('.qreset').addEventListener('click',render);
    render();
  });
})();
