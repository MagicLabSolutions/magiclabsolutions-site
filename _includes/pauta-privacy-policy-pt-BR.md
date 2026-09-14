O Pauta é um planejador do dia para você e sua família, com a cara de um jornal impresso. Esta
página explica, sem juridiquês, o que o app guarda, onde isso fica, quem enxerga e como você
recupera ou apaga tudo.

---

### Quem é o responsável

A **MagicLab Solutions**, nome comercial da **Hoffmann Tech LTDA**, é a controladora dos dados
descritos aqui.

Dúvidas, pedidos ou reclamações: [redacao@pauta.app](mailto:redacao@pauta.app). Respondemos em
português, inglês ou espanhol.

---

### Sua conta

Dá para entrar no Pauta de três jeitos:

* **Entrar com a Apple** — você pode ocultar seu e-mail, e a Apple nos entrega um endereço de
  encaminhamento no lugar do verdadeiro. Funciona igual; o e-mail real não nos faz falta.
* **E-mail e senha** — cuidado pelo Firebase Authentication. Sua senha nunca passa por nós.
* **Conta anônima de criança** — a criança entra na casa digitando um código de seis letras que o
  dono da casa aprovou. Não tem e-mail, não tem senha e não existe cadastro público de crianças.

Da conta, guardamos **nome**, **e-mail** (quando existe), **idioma** e **fuso horário**. O perfil
é isso.

---

### O que a casa guarda

Tudo o que você escreve no Pauta pertence à sua casa e é visível para quem está nela:

* **Membros** — nomes e avatares, inclusive das crianças. Sem data de nascimento, sem localização,
  sem telefone.
* **Tarefas, mercado, desejos, ideias** e os rabiscos que você desenha (guardados como imagens
  PNG).
* **Projetos e marcos**, organizados por área — Casa, Trabalho, Pessoal, Família.
* **Prompts agendados e as propostas** que eles devolvem.
* **Preferências de aviso** e os tokens de push dos seus aparelhos, para a notificação chegar no
  aparelho certo.

Ninguém de fora da sua casa vê nada disso, e nada disso vira perfil de consumo.

---

### Onde os dados ficam

O Pauta roda no **Firebase**, do Google:

* O **Firestore**, na região `nam5` (Estados Unidos), guarda os dados da casa.
* As **Cloud Functions**, em `us-central1`, rodam os prompts agendados, as chamadas de IA e a
  exclusão de conta.
* Um **cache local no aparelho** mantém o app funcionando sem internet e sincroniza quando você
  volta.

Ou seja: seus dados são transferidos e tratados nos Estados Unidos. Essa transferência
internacional se apoia nas cláusulas contratuais padrão do Google.

---

### Como a IA funciona

Quando você captura algo por voz ou texto, o app manda para as nossas Cloud Functions:

* o texto que você digitou, ou a transcrição do que você falou, e
* um resumo curto do contexto da casa — os nomes das áreas, dos projetos e das tarefas abertas —
  para a IA arquivar a anotação no lugar certo.

As Functions repassam isso para a **API da Anthropic (Claude)**, que devolve a interpretação.
Pelos termos de API da Anthropic, **esse conteúdo não é usado para treinar modelos**. O uso é
medido por plano.

A voz é transcrita pelo seu próprio aparelho, com o ditado da Apple; o áudio em si nunca chega
aos nossos servidores.

A IA propõe, nunca decide. Toda proposta fica esperando você aceitar ou ignorar.

---

### Pagamentos

As assinaturas são vendidas pela **App Store**. A Apple processa o pagamento e só nos conta se a
assinatura está ativa. **Não vemos seu cartão, seu endereço de cobrança nem sua conta Apple.**

---

### Diagnóstico

A versão 1.0 inclui o **Firebase Crashlytics** (relatórios de falha) e o **Firebase Analytics**
(eventos de uso agregados, do tipo "houve uma captura" ou "o paywall apareceu"). Esses eventos
**não levam dado pessoal** — nada de título de tarefa, nome ou anotação.

---

### O que a gente não faz

* Nada de anúncio, nada de identificador de publicidade.
* Nada de rastreamento em apps e sites de outras empresas. O Pauta nem pede a permissão de
  Rastreamento (ATT), porque não tem o que rastrear.
* Nada de vender ou alugar seus dados, para ninguém, nunca.
* Nada de usar o conteúdo da sua casa para treinar modelo — nosso ou dos outros.

---

### Seus direitos

Pela **LGPD** e pelo **GDPR**, você pode:

* **Ver e exportar seus dados** — em Redação › Conta › Exportar dados você recebe um arquivo com
  tudo o que a sua casa guarda.
* **Corrigir** o que estiver errado, direto no app.
* **Excluir a conta** — Redação › Conta › *Encerrar a redação*. Você tem **30 dias** para se
  arrepender; passado o prazo, uma Cloud Function apaga a conta e os dados em definitivo.
* **Se opor, limitar o tratamento ou reclamar** — escreva para
  [redacao@pauta.app](mailto:redacao@pauta.app) ou procure a ANPD.

Guardamos seus dados enquanto a conta existir, e não mais que isso.

---

### Crianças

Criança só entra numa casa convidada por um adulto, com um código de seis letras. Não existe
cadastro público de menores, não existe chat, não existe conteúdo de terceiros e não existe
anúncio em lugar nenhum do app. A criança enxerga a casa dela e nada além. O adulto dono da casa
pode tirar o acesso da criança quando quiser.

---

### Mudanças nesta política

Se algo aqui mudar de um jeito que importe, atualizamos a data de vigência no topo desta página e
avisamos dentro do app antes de a mudança valer.

---

### Contato

**MagicLab Solutions** (Hoffmann Tech LTDA) — [redacao@pauta.app](mailto:redacao@pauta.app)
