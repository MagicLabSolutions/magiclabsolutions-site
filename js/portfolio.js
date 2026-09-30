(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function burst(stage) {
    if (motion.matches) return;
    for (let i = 0; i < 22; i++) {
      const dot = make('i', 'p-burst');
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = `--dx:${Math.cos(i * 2.4) * (80 + i * 7)}px;--dy:${Math.sin(i * 2.4) * 150 + 80}px;--rot:${i * 47}deg;background:${['#e6c1f8','#f6c78c','#92c7b5'][i % 3]}`;
      stage.append(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    }
  }
  document.querySelectorAll('.p-demo').forEach(root => {
    if (root.dataset.initialized) return;
    root.dataset.initialized = 'true';
    const pt = root.dataset.lang === 'pt-BR';
    const word = (a, b) => pt ? a : b;
    const stage = make('div', 'p-demo-stage');
    const controls = make('div', 'p-demo-controls');
    const output = make('p', 'p-demo-output');
    output.setAttribute('role', 'status'); output.setAttribute('aria-live', 'polite');
    stage.append(make('span', 'p-demo-tag', word('PRÉVIA INTERATIVA', 'INTERACTIVE PREVIEW')));
    const heading = (a, b, c, d) => { controls.append(make('h3', '', word(a, b))); if(c) controls.append(make('p', '', word(c,d))); };
    const button = (text, fn, primary = false) => { const b = make('button', primary ? 'p-button' : '', text); b.type = 'button'; b.addEventListener('click',fn); controls.append(b); return b; };
    const icon = () => { const im=make('img','p-demo-icon');im.src=root.dataset.icon;im.alt='';im.width=110;im.height=110;stage.append(im);return im; };
    const value = (initial, label) => {const v=make('strong','p-big-value',initial);stage.append(v,make('span','p-value-label',label));return v;};
    const card = (label, title, body='') => {const c=make('div','p-demo-card');c.append(make('small','',label),make('strong','',title));if(body)c.append(make('p','',body));stage.append(c);return c;};
    const range = (label, min, max, initial, update) => { const l=make('label','',label), input=make('input');input.type='range';input.min=min;input.max=max;input.value=initial;input.setAttribute('aria-label',label);controls.append(l,input);input.addEventListener('input',()=>update(Number(input.value)));update(Number(initial));return input;};
    const checks = (labels, onChange) => labels.map((label,i)=>{const row=make('label'),input=make('input');input.type='checkbox';row.append(input,document.createTextNode(label));controls.append(row);input.addEventListener('change',()=>onChange(i,input.checked));return input;});
    const type=root.dataset.demo;
    if(type==='countdown'){
      icon();const num=value('30',word('dias para a viagem','days until the trip'));
      heading('Chegue mais perto.','Bring it closer.','Deslize para sentir a espera mudar.','Move the slider and feel the wait change.');
      range(word('Dias até a viagem','Days until the trip'),0,60,30,n=>{num.textContent=n;stage.classList.toggle('is-celebrating',n<5);output.textContent=n===0?word('É hoje!','It’s today!'):n<7?word('Agora falta tão pouco.','So close now.'):word('A expectativa também faz parte.','Anticipation is part of the fun.');});
    }else if(type==='knock'){
      const c=make('div','p-knock-card'), n=make('strong','','00:08');c.append(make('small','',word('Reunião de equipe','Team meeting')),n);stage.append(c);
      heading('Pode entrar no seu foco.','Go ahead. Get focused.','Aqui, oito segundos representam o último minuto antes da chamada.','Here, eight seconds represent the final minute before a call.');
      let timer=null,delay=null;
      const stop=()=>{clearInterval(timer);clearTimeout(delay);c.classList.remove('p-knocking');};
      button(word('Ouvir com os olhos: toc toc','See the knock: toc toc'),()=>{stop();n.textContent='00:08';output.textContent=word('Toc toc. Sua reunião está chegando.','Knock knock. Your meeting is close.');void c.offsetWidth;c.classList.add('p-knocking');delay=setTimeout(()=>{c.classList.remove('p-knocking');const end=Date.now()+8000;timer=setInterval(()=>{const t=Math.max(0,Math.ceil((end-Date.now())/1000));n.textContent=`00:${String(t).padStart(2,'0')}`;if(!t){stop();output.textContent=word('Está na hora.','It’s time.');}},250);},motion.matches?0:800);},true);
      button(word('Entrar na chamada de exemplo','Join the example call'),()=>{stop();n.textContent='✓';output.textContent=word('Você chegou! Nenhuma chamada real foi aberta.','You made it! No real call was opened.');burst(stage);});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
    }else if(type==='clean'||type==='subscriptions'){
      icon();const clean=type==='clean',items=clean?[1.8,2.4,.6]:[19.9,29.9,12.9];let chosen=new Set();const num=value(clean?'0 GB':'R$ 0',word(clean?'espaço selecionado':'total mensal de exemplo',clean?'selected space':'example monthly total'));
      heading(clean?'Você escolhe o que sai.':'Veja o total mudar.',clean?'You choose what goes.':'See the total change.');
      const labels=clean?[word('Caches • 1,8 GB','Caches • 1.8 GB'),word('Builds antigos • 2,4 GB','Old builds • 2.4 GB'),word('Logs • 0,6 GB','Logs • 0.6 GB')]:[word('Música • R$ 19,90','Music • R$19.90'),word('Vídeo • R$ 29,90','Video • R$29.90'),word('Nuvem • R$ 12,90','Cloud • R$12.90')];
      const update=()=>{const total=[...chosen].reduce((s,i)=>s+items[i],0);num.textContent=clean?`${total.toFixed(1)} GB`:new Intl.NumberFormat(pt?'pt-BR':'en-US',{style:'currency',currency:'BRL'}).format(total);output.textContent=word('Valores fictícios para explorar a ideia.','Fictional values to explore the idea.');};
      const inputs=checks(labels,(i,on)=>{on?chosen.add(i):chosen.delete(i);update();});
      if(clean)button(word('Limpar seleção de exemplo','Clean example selection'),()=>{if(!chosen.size){output.textContent=word('Selecione uma categoria primeiro.','Choose a category first.');return;}num.textContent='✓';inputs.forEach(i=>i.checked=false);chosen.clear();output.textContent=word('Pronto. Nenhum arquivo real foi acessado.','Done. No real files were accessed.');burst(stage);},true);
    }else if(type==='card'){
      const c=card('HOORAY',word('Tem uma surpresa aqui.','There’s a surprise inside.'));
      heading('Escreva um carinho.','Write a little kindness.');const input=make('input');input.type='text';input.maxLength=100;input.value=word('Que venham muitas coisas boas!','Here’s to good things ahead!');input.setAttribute('aria-label',word('Mensagem do cartão','Card message'));controls.append(input);
      button(word('Abrir o cartão','Open the card'),()=>{c.querySelector('strong').textContent=input.value.trim()||word('Você faz a diferença.','You make a difference.');c.classList.add('is-open');output.textContent=word('Um cartão de exemplo, só aqui no navegador.','An example card, right here in your browser.');burst(stage);},true);
      button(word('Fechar e tentar de novo','Close and try again'),()=>{c.classList.remove('is-open');c.querySelector('strong').textContent=word('Tem uma surpresa aqui.','There’s a surprise inside.');output.textContent='';});
    }else if(type==='clue'){
      const c=card(word('ARQUIVO 01','FILE 01'),word('Quem ficou com a chave?','Who kept the key?'),word('Ana deixou a chave com quem chegou por último. Bruno chegou antes de Clara.','Ana left the key with the last person to arrive. Bruno arrived before Clara.'));
      heading('Um pequeno exercício de dedução.','A little exercise in deduction.','Qual das três pessoas está com a chave?','Which of the three has the key?');
      ['Ana','Bruno','Clara'].forEach(name=>button(name,()=>{const ok=name==='Clara';output.textContent=ok?word('Isso! Clara chegou por último.','Exactly! Clara arrived last.'):word('Quase. Releia a ordem de chegada.','Almost. Read the order of arrival again.');c.classList.toggle('is-open',ok);if(ok)burst(stage);}));
    }else if(type==='flashcard'){
      const c=card('BRAINFOLD',word('O que é repetição espaçada?','What is spaced repetition?'));let flipped=false;
      heading('Vire uma ideia.','Turn an idea over.','Uma pergunta de cada vez. Um pouco mais de memória.','One question at a time. A little more remembered.');
      button(word('Virar o flashcard','Flip the flashcard'),()=>{flipped=!flipped;c.classList.toggle('is-open',flipped);c.querySelector('strong').textContent=flipped?word('Revisar em intervalos ao longo do tempo.','Reviewing at intervals over time.'):word('O que é repetição espaçada?','What is spaced repetition?');output.textContent=word(flipped?'Resposta revelada.':'Pergunta novamente.',flipped?'Answer revealed.':'Back to the question.');},true);
    }else if(type==='space'){
      const orbit=make('div','p-orbit-demo'),planet=make('span','p-planet'),label=make('span','p-orbit-label','01 / AURORA');orbit.append(make('span','p-sun'),planet,label);stage.append(orbit);
      heading('Escolha um destino.','Choose a destination.','Uma pequena viagem ilustrativa pela proposta do jogo.','A small illustrative journey through the game’s idea.');
      const places=[['Aurora','70%','12%',word('Um mundo para observar.','A world to observe.')],['Echo','9%','50%',word('Há sinais no horizonte.','Signals on the horizon.')],['Nacre','63%','85%',word('Outra descoberta à frente.','Another discovery ahead.')]];
      places.forEach((p,i)=>button(p[0],()=>{planet.style.setProperty('--planet-x',p[1]);planet.style.setProperty('--planet-y',p[2]);label.textContent=`0${i+1} / ${p[0].toUpperCase()}`;output.textContent=p[3];}));
    }else if(type==='story'){
      const c=card('MURMUR',word('Você também ouviu isso?','Did you hear it, too?'),word('Uma mensagem acaba de chegar.','A message just arrived.'));
      heading('A próxima frase é sua.','The next line is yours.');
      button(word('“O que aconteceu?”','“What happened?”'),()=>{c.querySelector('strong').textContent=word('O sinal voltou. Mas a voz mudou.','The signal is back. But the voice has changed.');output.textContent=word('Você escolheu investigar.','You chose to investigate.');c.classList.add('is-open');});
      button(word('“Estou aqui.”','“I’m here.”'),()=>{c.querySelector('strong').textContent=word('Ainda bem. Não queria ouvir isso sozinho.','Good. I didn’t want to hear this alone.');output.textContent=word('Você escolheu se aproximar.','You chose to reach out.');c.classList.add('is-open');});
      button(word('Recomeçar','Start again'),()=>{c.querySelector('strong').textContent=word('Você também ouviu isso?','Did you hear it, too?');c.classList.remove('is-open');output.textContent='';});
    }else if(type==='plant'){
      const plant=make('div','p-plant'),stem=make('div','p-stem');for(let i=0;i<3;i++)stem.append(make('span','p-leaf'));plant.append(stem,make('span','p-pot'));stage.append(plant);
      heading('Cada planta tem seu contexto.','Every plant has its context.','Veja como a luz muda esta ilustração. No app, o cuidado vem acompanhado de uma explicação.','See light change this illustration. In the app, care comes with an explanation.');
      range(word('Luz no ambiente','Light in the room'),0,100,60,n=>{stem.style.setProperty('--lean',`${(50-n)/4}deg`);plant.style.opacity=.55+n/220;output.textContent=n<35?word('Um canto com pouca luz.','A low-light corner.'):n<75?word('Luz indireta iluminando as folhas.','Indirect light on the leaves.'):word('Um espaço cheio de luz.','A bright, sunlit space.');});
    }else if(type==='bedtime'){
      const stars=make('div','p-stars','✦ · ✧'),moon=make('div','p-moon'),label=make('span','p-room-rest',word('A noite começa.','The night begins.'));stage.append(stars,moon,label);
      heading('Um passo de cada vez.','One little step at a time.');
      [word('1. Preparar o quarto','1. Settle the room'),word('2. Escolher uma história','2. Choose a story'),word('3. Dar boa-noite','3. Say goodnight')].forEach((text,i)=>button(text,()=>{stage.style.background=['#222b43','#182238','#10192b'][i];moon.style.opacity=1-i*.15;label.textContent=[word('Tudo no seu lugar.','Everything in its place.'),word('Era uma vez…','Once upon a time…'),word('Boa-noite. Até amanhã.','Goodnight. See you tomorrow.')][i];output.textContent=label.textContent;}));
    }else if(type==='baby'){
      icon();const list=make('ol');stage.append(list);let count=0;
      heading('Um toque. Um momento registrado.','One tap. One moment recorded.','Experimente montar uma rotina de exemplo.','Try building an example routine.');
      [word('Mamou','Feeding'),word('Dormiu','Sleep'),word('Trocou a fralda','Diaper change')].forEach(label=>button(label,()=>{count++;list.prepend(make('li','',`${String(count).padStart(2,'0')} · ${label}`));while(list.children.length>4)list.lastChild.remove();output.textContent=word('Registro fictício adicionado à prévia.','Example log added to the preview.');}));
      button(word('Limpar a prévia','Clear the preview'),()=>{list.replaceChildren();count=0;output.textContent='';});
    }else if(type==='tasks'||type==='family'){
      const c=card(type==='tasks'?'PAUTA':'KINFOLD',word('Um dia mais leve.','A lighter day.')),progress=make('div','p-progress'),bar=make('span');progress.append(bar);stage.append(progress);let done=0;
      heading('Comece pelo próximo passo.','Start with the next step.');
      checks(type==='family' ? [word('Conferir os passaportes','Check the passports'),word('Separar os documentos','Pack the documents'),word('Preparar a mala','Pack the bags')] : [word('Planejar a semana','Plan the week'),word('Organizar as ideias','Organise ideas'),word('Reservar um tempo juntos','Make time together')],(i,on)=>{done+=on?1:-1;bar.style.width=`${done/3*100}%`;c.querySelector('strong').textContent=`${done} / 3`;output.textContent=done===3?word('O pequeno plano de hoje está completo.','Today’s little plan is complete.'):word('Um passo de cada vez.','One step at a time.');if(done===3)burst(stage);});
    }else if(type==='timeline'){
      const c=card('MEMORIES','01',word('Um mês de descobertas.','One month of discoveries.'));
      heading('Passe pelos meses.','Move through the months.','Aqui, os números representam sua linha do tempo de fotos.','Here, numbers stand in for your photo timeline.');
      range(word('Mês do bebê','Baby’s month'),1,12,1,n=>{c.querySelector('strong').textContent=String(n).padStart(2,'0');c.style.transform=`rotate(${n-6}deg)`;c.querySelector('p').textContent=word(`${n} ${n===1?'mês':'meses'} de histórias.`,`${n} ${n===1?'month':'months'} of stories.`);output.textContent=word('Cada foto guarda uma fase.','Every photo holds a chapter.');});
    }else if(type==='git'){
      const c=card('MISSION CONTROL','website / main',word('2 alterações locais','2 local changes'));
      heading('Um olhar para cada projeto.','One look at each project.');
      const select=make('select');select.setAttribute('aria-label',word('Repositório de exemplo','Example repository'));['website','mobile-app','design-system'].forEach(v=>{const o=make('option','',v);select.append(o);});controls.append(select);select.addEventListener('change',()=>{c.querySelector('strong').textContent=select.value+' / main';c.querySelector('p').textContent=word('2 alterações locais','2 local changes');output.textContent='';});
      button(word('Sincronizar exemplo','Sync example'),()=>{c.querySelector('p').textContent=word('Tudo em dia ✓','Up to date ✓');output.textContent=word('Simulação concluída. Nenhum repositório real foi alterado.','Simulation complete. No real repository was changed.');},true);
    }else if(type==='playroom'){
      const c=card('TUMTUM',word('O que vamos descobrir?','What shall we discover?'));
      heading('Escolha um pequeno mundo.','Choose a little world.');
      [word('A casa','The house'),word('O aquário','The aquarium'),word('Os dinossauros','The dinosaurs')].forEach((label,i)=>button(label,()=>{c.querySelector('strong').textContent=label;c.style.background=['#f4d9b9','#b9dedc','#cad6b6'][i];output.textContent=word('Explore as imagens reais do brinquedo logo abaixo.','Explore the real toy screenshots below.');burst(stage);}));
    }else if(type==='gift'){
      const c=card('GIFTLY',word('Uma ideia para alguém especial.','An idea for someone special.'));
      heading('Pequenos detalhes ajudam.','Little details help.');
      [word('Adora cozinhar','Loves cooking'),word('Vive com um livro','Always reading'),word('Ama uma aventura','Loves an adventure')].forEach((label,i)=>button(label,()=>{c.querySelector('strong').textContent=[word('Um caderno de receitas da família.','A family recipe notebook.'),word('Uma edição daquele livro favorito.','An edition of their favourite book.'),word('Um diário para a próxima viagem.','A journal for the next trip.')][i];output.textContent=word('Ideia ilustrativa para experimentar o planejamento.','An example idea to try gift planning.');}));
    }else if(type==='shelter'){
      icon();const c=make('strong','p-value-label',word('Cuidado que conecta.','Care that connects.'));stage.append(c);
      heading('Cada ajuda tem seu lugar.','Every kind of help matters.');
      [word('Adotar','Adopt'),word('Apadrinhar','Sponsor'),word('Cuidar','Care')].forEach((label,i)=>button(label,()=>{c.textContent=label;output.textContent=[word('Conhecer um animal é o começo de uma nova história.','Meeting an animal starts a new story.'),word('O apoio contínuo ajuda o abrigo a planejar os cuidados.','Ongoing support helps the shelter plan care.'),word('A organização da equipe deixa mais tempo para os animais.','Team organisation leaves more time for the animals.')][i];}));
    }else if(type==='qr'){
      const img=make('img');img.src='/images/portfolio/qramen/demo-qr.svg';img.width=200;img.height=200;img.alt=word('QR de exemplo para magiclabsolutions.com','Example QR for magiclabsolutions.com');stage.append(img);
      heading('Um endereço pronto para compartilhar.','An address ready to share.','Este QR abre o site da Magic Lab.','This QR opens the Magic Lab website.');
      button(word('Revelar o destino','Reveal the destination'),()=>{output.textContent='https://magiclabsolutions.com';},true);
    }else{
      icon();value('✦',word('Em preparação','In preparation'));heading('O próximo capítulo vem aí.','The next chapter is coming.');button(word('Acender uma ideia','Light up an idea'),()=>{stage.classList.toggle('is-celebrating');output.textContent=word('Ainda estamos preparando o que vem a seguir.','We are still preparing what comes next.');burst(stage);},true);
    }
    controls.append(output);root.append(stage,controls);
  });
  document.querySelectorAll('.p-experience').forEach(section=>{
    const dialog=section.querySelector('.p-lightbox');
    section.querySelectorAll('[data-p-image]').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img');dialog.querySelector('img').src=button.dataset.pImage;dialog.querySelector('img').alt=source.alt;dialog.querySelector('p').textContent=source.alt;dialog.showModal();}));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  });
  document.querySelectorAll('[data-p-tilt]').forEach(el=>{
    const reset=()=>{el.style.setProperty('--px','0deg');el.style.setProperty('--py','0deg');};
    el.addEventListener('pointermove',e=>{if(motion.matches||!fine.matches)return;const r=el.getBoundingClientRect();el.style.setProperty('--px',`${(e.clientY-r.top-r.height/2)/r.height*-7}deg`);el.style.setProperty('--py',`${(e.clientX-r.left-r.width/2)/r.width*9}deg`);});el.addEventListener('pointerleave',reset);motion.addEventListener('change',reset);
  });
  if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('p-visible');obs.unobserve(e.target);}}),{threshold:.06});document.body.classList.add('p-motion');document.querySelectorAll('[data-p-reveal]').forEach(el=>obs.observe(el));}
})();
