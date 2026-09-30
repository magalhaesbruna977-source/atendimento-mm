"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * Central de Conhecimento (/material-de-apoio).
 *
 * Conteúdo estático do Material de Apoio do Time (set/2026) + base
 * institucional da marca (ago/2026). Tem três interações, todas só no
 * navegador: busca que esconde as seções sem o termo, índice colapsável no
 * celular e botões "Copiar" nas respostas-modelo.
 */

const INDICE: { grupo: string; itens: { id: string; rotulo: string }[] }[] = [
  {
    grupo: "A casa",
    itens: [
      { id: "quem-somos", rotulo: "Quem somos" },
      { id: "ecossistema", rotulo: "Ecossistema e alcance" },
      { id: "tom-de-voz", rotulo: "Tom de voz" },
      { id: "quem-e-quem", rotulo: "Quem é quem" },
      { id: "publico", rotulo: "Nosso público" },
    ],
  },
  {
    grupo: "Produtos",
    itens: [
      { id: "produtos-precos", rotulo: "Produtos e preços" },
      { id: "detalhes", rotulo: "Detalhes que sempre aparecem" },
    ],
  },
  {
    grupo: "Como atender",
    itens: [
      { id: "regras-semaforo", rotulo: "Regras de ouro e semáforo" },
      { id: "usar-ia", rotulo: "Como usar a IA de suporte" },
      { id: "respostas-modelo", rotulo: "Respostas-modelo" },
      { id: "contatos", rotulo: "Contatos oficiais" },
    ],
  },
];

const ESTATISTICAS: [string, string][] = [
  ["700K+", "Inscritos YouTube"],
  ["8M+", "Views/mês no YouTube"],
  ["211K+", "Seguidores Instagram"],
  ["47K", "Assinantes CompoundLetter"],
  ["47K", "Assinantes Inside The Market"],
  ["11K", "Seguidores LinkedIn"],
  ["600+", "Membros M3 Club"],
  ["800+", "Assinantes The Report"],
  ["R$23,7M+", "PL do Fundo MM FIA"],
  ["1.041+", "Cotistas do Fundo"],
  ["700+", "Alunos da Academy"],
  ["6", "Cursos ativos na Academy"],
];

const RESPOSTAS_MODELO: { situacao: string; texto: string }[] = [
  {
    situacao: "Quer comprar um curso exclusivo avulso",
    texto:
      "Olá, [nome]. A Formação Value Investing Aplicado não é vendida avulsa: ela faz parte do Market Makers Pass, junto com outros três cursos exclusivos, e também está no M3 Club. O Pass custa 12x de R$ 99,00 ou R$ 1.069,20 à vista. Quer que eu detalhe tudo o que ele inclui?",
  },
  {
    situacao: "Quer entrar no M3 Club",
    texto:
      "Olá, [nome]. O M3 Club está fechado desde 31/07/2026: a entrada acontece por convite ou indicação de um membro ativo, seguida de uma entrevista. Se você conhece alguém que já é membro, ele pode indicar seu nome. Enquanto isso, o Market Makers Pass reúne os cursos exclusivos, as gravações do podcast com resumo e encontros online mensais. Posso te explicar como funciona?",
  },
  {
    situacao: "Diferença entre o Pass e o M3 Club",
    texto:
      "O Pass é o passo inicial: assinatura de 12 meses com os quatro cursos exclusivos, o GPT Assistente de Análise de Balanços, gravações do podcast com resumo, mentorias selecionadas do M3 Club e encontros online mensais. O M3 Club é a comunidade premium, fechada, com entrada por convite e acesso aos mesmos cursos exclusivos. Para quem consome o conteúdo gratuito e quer profundidade no próprio ritmo, o Pass é o caminho natural.",
  },
  {
    situacao: "Preço e conteúdo do curso Claude para o Mercado Financeiro",
    texto:
      "O Claude para o Mercado Financeiro é um curso avulso do professor Leonardo Dawadji, com 12x de R$ 124,92 ou R$ 1.349,10 à vista. Ele ensina a usar o Claude na rotina de análise do mercado. Aqui está a página oficial de compra: [link]. Alguma dúvida sobre o conteúdo?",
  },
  {
    situacao: "Créditos CFP®",
    texto:
      "Todos os cursos da Academy concedem créditos de educação continuada da Planejar® para profissionais CFP® depois de submetidos e aprovados. Vou confirmar o status atual do [curso] e te retorno com as horas aprovadas.",
  },
  {
    situacao: "Pede indicação de uma ação ou do fundo",
    texto:
      "Entendo a pergunta, [nome]. O Market Makers produz conteúdo educacional e não faz recomendação individual de investimento: a decisão depende do seu perfil, dos seus objetivos e do seu prazo. Se quiser aprender a analisar uma empresa por conta própria, a Formação Value Investing Aplicado, dentro do Pass, mostra o processo passo a passo.",
  },
  {
    situacao: "Pedido de cancelamento dentro dos 7 dias",
    texto:
      "Recebi seu pedido, [nome]. Toda venda online tem garantia de 7 dias, e já encaminhei sua solicitação para a equipe responsável. Você recebe o retorno em [INSERIR: prazo] por este mesmo canal.",
  },
  {
    situacao: "Ainda não sabe a resposta",
    texto:
      "Boa pergunta, [nome]. Vou confirmar essa informação com o time responsável para não te passar nada impreciso e te retorno em [INSERIR: prazo].",
  },
];

function Secao({
  id,
  titulo,
  sub,
  ocultas,
  children,
}: {
  id: string;
  titulo: string;
  sub?: string;
  ocultas: Set<string>;
  children: ReactNode;
}) {
  return (
    <section id={id} data-secao hidden={ocultas.has(id)} className="mb-12 scroll-mt-32">
      <h2 className="mb-1 text-[1.3125rem] font-extrabold text-mm-text">{titulo}</h2>
      {sub ? (
        <p className="mb-4 max-w-[70ch] text-sm leading-relaxed text-mm-text-muted">{sub}</p>
      ) : (
        <div className="mb-3" />
      )}
      {children}
    </section>
  );
}

function Card({ titulo, children, className = "" }: { titulo?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`mm-card mb-3.5 overflow-x-auto px-5 py-5 sm:px-[22px] ${className}`}>
      {titulo && <h3 className="mb-2.5 text-[0.90625rem] font-bold text-mm-text">{titulo}</h3>}
      {children}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1.5 inline-block rounded-[5px] bg-mm-surface-2 px-1.5 py-px font-mono text-[0.65625rem] text-mm-text-muted">
      {children}
    </span>
  );
}

function BotaoCopiar({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"ocioso" | "copiado" | "erro">("ocioso");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("erro");
    }
    setTimeout(() => setEstado("ocioso"), 1500);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="absolute right-3.5 top-3.5 rounded-[7px] border border-mm-border bg-mm-bg px-2.5 py-1 font-mono text-[0.6875rem] font-semibold text-mm-text-muted transition-colors hover:bg-mm-surface-2 hover:text-mm-text"
    >
      {estado === "copiado" ? "Copiado!" : estado === "erro" ? "Erro" : "Copiar"}
    </button>
  );
}

export default function CentralConhecimento() {
  const [busca, setBusca] = useState("");
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [secoesOcultas, setSecoesOcultas] = useState<Set<string>>(new Set());
  const mainRef = useRef<HTMLElement>(null);

  function handleBusca(valor: string) {
    setBusca(valor);
    const termo = valor.trim().toLowerCase();
    const ocultas = new Set<string>();
    if (termo && mainRef.current) {
      mainRef.current.querySelectorAll<HTMLElement>("section[data-secao]").forEach((secao) => {
        if (!(secao.textContent ?? "").toLowerCase().includes(termo)) {
          ocultas.add(secao.id);
        }
      });
    }
    setSecoesOcultas(ocultas);
  }

  const nenhumResultado = busca.trim() !== "" && secoesOcultas.size === INDICE.flatMap((g) => g.itens).length;

  return (
    <>
      {/* Barra da página: busca + botão de índice (celular). Fica logo abaixo do cabeçalho fixo. */}
      <div className="sticky top-16 z-10 border-b border-mm-border bg-mm-bg">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <span className="hidden whitespace-nowrap text-[0.9375rem] font-extrabold text-mm-text sm:inline">
            📘 Central MM
          </span>
          <label className="flex flex-1 items-center gap-2 rounded-[9px] border border-mm-border bg-mm-surface px-3 py-[7px] focus-within:border-mm-accent md:max-w-xs">
            <span aria-hidden="true" className="font-mono text-xs text-mm-text-muted">
              ⌕
            </span>
            <span className="sr-only">Buscar nesta página</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Buscar nesta página..."
              className="w-full bg-transparent text-[0.84375rem] text-mm-text outline-none placeholder:text-mm-text-muted"
            />
          </label>
          <button
            type="button"
            onClick={() => setIndiceAberto((aberto) => !aberto)}
            aria-expanded={indiceAberto}
            aria-controls="indice-central"
            className="mm-btn mm-btn-secondary mm-btn-sm lg:hidden"
          >
            Índice {indiceAberto ? "▴" : "▾"}
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-0 px-4 pb-16 sm:px-6 lg:flex-row lg:gap-9 lg:pb-24">
        <nav
          id="indice-central"
          aria-label="Índice da Central de Conhecimento"
          className={`${
            indiceAberto ? "block" : "hidden"
          } mb-2 border-b border-mm-border py-3.5 lg:sticky lg:top-[8.5rem] lg:mb-0 lg:block lg:max-h-[calc(100vh-10rem)] lg:w-[230px] lg:flex-none lg:self-start lg:overflow-y-auto lg:border-b-0 lg:pt-7`}
        >
          {INDICE.map((grupo, i) => (
            <div key={grupo.grupo} className="contents lg:block">
              <p className={`mm-eyebrow hidden px-2.5 pb-1 lg:block ${i === 0 ? "" : "pt-3.5"}`}>
                {grupo.grupo}
              </p>
              <ul className="inline-flex flex-wrap gap-1.5 lg:flex lg:flex-col lg:gap-0.5">
                {grupo.itens.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setIndiceAberto(false)}
                      className="block rounded-lg border border-mm-border bg-mm-surface px-2.5 py-1.5 text-xs font-medium text-mm-text-muted transition-colors hover:bg-mm-surface-2 hover:text-mm-text lg:border-transparent lg:bg-transparent lg:text-[0.84375rem] lg:hover:bg-mm-surface"
                    >
                      {item.rotulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <main ref={mainRef} className="min-w-0 flex-1 pt-5 lg:pt-7">
          <header className="mb-8">
            <p className="mb-2.5 text-[0.78125rem] font-bold uppercase tracking-[0.08em] text-mm-accent-deep">
              Central de Conhecimento · Atendimento Market Makers
            </p>
            <h1 className="mb-3 text-[clamp(1.625rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-balance text-mm-text">
              Tudo o que o time precisa saber, em um só lugar
            </h1>
            <p className="max-w-[66ch] text-[0.96875rem] leading-relaxed text-mm-text-muted">
              Consolidado da marca, do ecossistema, dos produtos e das regras de atendimento — a
              mesma fonte que orienta a IA de suporte. Preços e regras de setembro de 2026; números
              de alcance de agosto de 2026.
            </p>
          </header>

          {nenhumResultado && (
            <div className="mm-callout-info mb-8 text-sm">
              Nada encontrado para “{busca.trim()}” nesta página.
            </div>
          )}

          <Secao ocultas={secoesOcultas} id="quem-somos" titulo="Quem somos">
            <Card>
              <p className="mb-3 text-[0.90625rem] leading-[1.65]">
                O Market Makers é um hub de serviços e informações sobre o mercado financeiro, com
                podcasts, newsletters, uma revista digital, uma comunidade premium e uma plataforma
                de cursos. Foi criado em 2022 por Thiago Salomão e Matheus Soares e fica na Av.
                Brigadeiro Faria Lima, 3064, Itaim Bibi — São Paulo. Pode ser chamado de Market
                Makers, MMakers ou MMKR.
              </p>
              <p className="text-[0.90625rem] leading-[1.65]">
                <strong>Por que existimos.</strong> O mercado financeiro brasileiro está cheio de
                conteúdo. O que falta é profundidade com credibilidade. O Market Makers leva o nível
                de conversa dos bastidores do mercado para quem está do lado de fora, sem
                simplificar demais e sem vender ilusão.
              </p>
            </Card>
            <Card titulo="Nosso diferencial">
              <table className="mm-table">
                <tbody>
                  <tr><td>Posicionamento</td><td>&quot;Pense como os melhores do mercado&quot;</td></tr>
                  <tr><td>Proposta única</td><td>&quot;A profundidade que separa análise de opinião&quot;</td></tr>
                  <tr><td>Acesso real</td><td>Conversamos com quem faz o mercado: gestores, economistas, founders e executivos</td></tr>
                  <tr><td>Sem conflito</td><td>Não distribuímos produtos financeiros nem recebemos comissão sobre produto. Ganhamos com educação, comunidade e conteúdo</td></tr>
                  <tr><td>Voz de autor</td><td>Temos opinião. Não fazemos jornalismo neutro, fazemos análise com assinatura</td></tr>
                </tbody>
              </table>
            </Card>
            <div className="mm-callout-info text-[0.84375rem] leading-relaxed [&_strong]:text-mm-accent-deep">
              <strong>Manifesto (trecho).</strong> &quot;Isto é para os loucos por qualidade e para
              os que acreditam na magia do caos. Para os que acreditam no compounding do
              conhecimento, na arte de acumulá-lo e multiplicá-lo ao longo do tempo. (...) Eles
              vieram para incomodar. Você pode não gostar deles, mas não conseguirá ignorá-los.&quot;
            </div>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="ecossistema"
            titulo="Ecossistema e alcance"
            sub="Números de referência (ago/2026) — úteis quando um cliente pergunta sobre audiência, assinantes ou tamanho da comunidade."
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
              {ESTATISTICAS.map(([numero, rotulo]) => (
                <div key={rotulo} className="rounded-xl border border-mm-border bg-mm-surface px-4 py-3.5">
                  <div className="text-xl font-extrabold tabular-nums text-mm-accent-deep">{numero}</div>
                  <div className="mt-0.5 text-xs text-mm-text-muted">{rotulo}</div>
                </div>
              ))}
            </div>
            <Card titulo="Outros programas do ecossistema" className="mt-3.5">
              <table className="mm-table">
                <tbody>
                  <tr><td>Risco Brasil</td><td>Podcast de debates com contraponto e provocação. Henrique Esteter e Thiago Salomão.</td></tr>
                  <tr><td>Crypto Never Sleeps</td><td>Criptoativos, aos sábados às 18h. Valter Rebelo e Marcello Cestari.</td></tr>
                  <tr><td>Salomão Entrevista</td><td>Grandes nomes do mercado entrevistados por Thiago Salomão, formato premium.</td></tr>
                  <tr><td>Market Makers Originals</td><td>Documentários produzidos pela equipe.</td></tr>
                  <tr><td>Especialista Responde</td><td>Convidados respondem perguntas da audiência para aprofundar temas específicos.</td></tr>
                  <tr><td>Canal WhatsApp</td><td>Conteúdo exclusivo e bastidores do ecossistema — gratuito, não é canal de atendimento.</td></tr>
                </tbody>
              </table>
            </Card>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="tom-de-voz"
            titulo="Tom de voz"
            sub="Falamos com adultos inteligentes: diretos, com posição clara e sem enrolação. Vale para o cliente que escreve, para a resposta da IA que você ajusta e para qualquer mensagem em nome da casa."
          >
            <Card>
              <table className="mm-table mm-table-plain font-mono">
                <thead>
                  <tr><th>Somos</th><th>Nunca somos</th></tr>
                </thead>
                <tbody>
                  <tr><td>Diretos, sem rodeios</td><td>Motivacionais ou de autoajuda financeira</td></tr>
                  <tr><td>Técnicos quando necessário</td><td>Sensacionalistas (&quot;você vai ficar rico&quot;)</td></tr>
                  <tr><td>Com opinião e posição clara</td><td>Neutros a ponto de não dizer nada</td></tr>
                  <tr><td>Respeitosos, nunca condescendentes</td><td>Promocionais sem entregar valor</td></tr>
                  <tr><td>Irreverentes com substância</td><td>Acadêmicos ou rebuscados sem necessidade</td></tr>
                  <tr><td>Confiantes, nunca arrogantes</td><td></td></tr>
                </tbody>
              </table>
            </Card>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {[
                {
                  nome: "Thiago Salomão",
                  papel: "Fundador e CEO",
                  texto:
                    "Insider generoso da Faria Lima. Transita entre autoridade de bastidor e vulnerabilidade pessoal. Tom de amigo bem-informado que puxa o leitor pela manga.",
                },
                {
                  nome: "Matheus Soares",
                  papel: "Fundador",
                  texto:
                    "Rigor técnico, value investing, análise fundamentalista. Não transige com superficialidade.",
                },
              ].map((voz) => (
                <div key={voz.nome} className="rounded-[14px] border border-mm-border bg-mm-surface px-5 py-[18px]">
                  <div className="mb-1 text-[0.9375rem] font-extrabold">{voz.nome}</div>
                  <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.03em] text-mm-accent-deep">
                    {voz.papel}
                  </div>
                  <p className="text-[0.84375rem] leading-relaxed text-mm-text-muted">{voz.texto}</p>
                </div>
              ))}
            </div>
            <Card className="mt-3.5">
              <div className="flex flex-col gap-2.5 text-[0.84375rem] leading-relaxed">
                <p>
                  <strong>Vocabulário aprovado:</strong> análise, tese, convicção, fundamentos,
                  gestora, carteira, alocação, risco, assimetria, due diligence, valuation, ciclo,
                  macro, micro, moat.
                </p>
                <p>
                  <strong>Vocabulário proibido:</strong> &quot;ficar rico&quot;, &quot;dinheiro
                  fácil&quot;, &quot;oportunidade única&quot;, &quot;segredo&quot;, &quot;método
                  infalível&quot;, &quot;você merece&quot;.
                </p>
                <p>
                  <strong>Nomes que usamos:</strong> Academy ou Market Makers Academy — nunca
                  &quot;MMA&quot;. Curso, Formação ou Protocolo — nunca &quot;mini-curso&quot; ou
                  &quot;workshop&quot;. Planejar® e CFP® sempre com o símbolo ®. Os códigos internos
                  dos produtos não aparecem em nenhuma mensagem ao cliente.
                </p>
              </div>
            </Card>
          </Secao>

          <Secao ocultas={secoesOcultas} id="quem-e-quem" titulo="Quem é quem">
            <Card>
              <table className="mm-table">
                <tbody>
                  <tr><td>Thiago Salomão</td><td>Fundador e CEO. Host do podcast Market Makers, co-host do Risco Brasil, autor da CompoundLetter às segundas. <Tag>podcast, marca, Protocolo Influência</Tag></td></tr>
                  <tr><td>Matheus Soares</td><td>Fundador. Referência em value investing, autor da CompoundLetter às quartas. <Tag>Value Investing Aplicado, Valuation</Tag></td></tr>
                  <tr><td>Leopoldo Rosa</td><td>COO e Head de Conteúdo. Editor da The Report, autor da CompoundLetter às sextas e da Inside The Market. <Tag>newsletters, The Report, redes</Tag></td></tr>
                  <tr><td>Murilo Ribeiro</td><td>Diretor do M3 Club. <Tag>relacionamento com membros</Tag></td></tr>
                  <tr><td>Bruna Magalhães, CFP®</td><td>Head da Academy e responsável por todos os produtos. <Tag>cursos, assinaturas, curadoria da IA</Tag></td></tr>
                  <tr><td>Lucas Zanardo</td><td>Head de YouTube. <Tag>estratégia dos podcasts</Tag></td></tr>
                  <tr><td>Igor Oliveira</td><td>Diretor Comercial B2B. <Tag>patrocínios</Tag></td></tr>
                </tbody>
              </table>
            </Card>
            <Card titulo="Professores da Academy">
              <table className="mm-table">
                <tbody>
                  <tr><td>Matheus Soares</td><td>Value Investing Aplicado e Introdução ao Valuation</td></tr>
                  <tr><td>Thiago Salomão</td><td>Protocolo Influência e Introdução ao Valuation</td></tr>
                  <tr><td>Ivan Barboza</td><td>Finanças Comportamentais</td></tr>
                  <tr><td>Leonardo Dawadji</td><td>Claude para o Mercado Financeiro</td></tr>
                  <tr><td>Prof. José Raymundo Faria Jr.</td><td>Protocolo Anti-Risco</td></tr>
                </tbody>
              </table>
            </Card>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="publico"
            titulo="Nosso público"
            sub="O público consome conteúdo gratuito denso todos os dias. Perfil típico: homens 35+, ligados ao mercado financeiro ou apaixonados por investimentos, visão liberal, classe AB. Identifique a persona antes de responder."
          >
            <Card>
              <table className="mm-table">
                <thead>
                  <tr><th>Persona</th><th>Quem é</th><th>Como responder</th></tr>
                </thead>
                <tbody>
                  <tr><td>Entusiasta</td><td>Início de jornada, consome conteúdo gratuito, pouco vocabulário técnico</td><td>Explique o termo na primeira vez, use analogia antes do técnico, mostre um próximo passo claro</td></tr>
                  <tr><td>Profissional</td><td>Assessor, analista, gestor iniciante ou planejador CFP®</td><td>Vá direto à densidade técnica e à aplicação no trabalho</td></tr>
                  <tr><td>Estrategista</td><td>Investidor experiente, executivo, pouco tempo</td><td>Seja breve e sistêmico, mostre o que vai além do óbvio</td></tr>
                </tbody>
              </table>
            </Card>
            <div className="mm-callout-rule text-[0.84375rem] leading-relaxed">
              <strong>Regra de ouro:</strong> acessível na entrada, denso no desenvolvimento,
              sistêmico na saída.
            </div>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="produtos-precos"
            titulo="Produtos e preços"
            sub="Preços de setembro de 2026. Parcelamento sempre primeiro, à vista como vantagem opcional. Antes de citar preço em oferta ativa, confira a página oficial."
          >
            <Card titulo="Assinaturas e produtos da casa">
              <table className="mm-table">
                <thead>
                  <tr><th>Produto</th><th>O que é</th><th>Preço</th><th>Regra-chave</th></tr>
                </thead>
                <tbody>
                  <tr><td>Market Makers Pass</td><td>Assinatura de 12 meses. Inclui os 4 cursos exclusivos, GPT de Análise de Balanços, checklist e classificação de ações, podcast com transcrição/resumo, mentorias do M3 Club, encontros mensais</td><td className="tabular-nums">12x R$99 ou R$1.069,20 à vista</td><td>Os 4 cursos exclusivos só existem dentro das assinaturas</td></tr>
                  <tr><td>M3 Club</td><td>Comunidade premium anual, 600+ membros. Inclui os cursos exclusivos e cupom próprio em lançamentos</td><td className="tabular-nums">12x R$541,67 ou R$5.850 à vista</td><td>Fechado desde 31/07/2026: só convite/indicação + entrevista</td></tr>
                  <tr><td>The Report</td><td>Revista digital, 50+ páginas/mês, 12 edições/ano</td><td className="tabular-nums">12x R$19,90 ou R$214,92 à vista</td><td>Bônus de 2 livros físicos só na 1ª assinatura</td></tr>
                  <tr><td>Fundo Market Makers FIA</td><td>Fundo de ações, PL R$23,7M+</td><td className="tabular-nums">Aplic. mín. R$1.000</td><td>Via BTG/EQI/Inter/C6/Genial. Nunca recomendar ou falar de rentabilidade</td></tr>
                </tbody>
              </table>
            </Card>
            <Card titulo="Cursos da Academy">
              <table className="mm-table">
                <thead>
                  <tr><th>Curso</th><th>Professor</th><th>Como se adquire</th><th>Preço</th></tr>
                </thead>
                <tbody>
                  <tr><td>Claude para o Mercado Financeiro</td><td>Leonardo Dawadji</td><td>Avulso</td><td className="tabular-nums">12x R$124,92 ou R$1.349,10 à vista</td></tr>
                  <tr><td>Protocolo Anti-Risco</td><td>Prof. José Raymundo Faria Jr.</td><td>Avulso</td><td className="tabular-nums">12x R$124,75 ou R$1.347,30 à vista</td></tr>
                  <tr><td>Formação Value Investing Aplicado</td><td>Matheus Soares</td><td>Só Pass e M3 Club</td><td>Sem preço avulso</td></tr>
                  <tr><td>Formação em Finanças Comportamentais</td><td>Ivan Barboza</td><td>Só Pass e M3 Club</td><td>Sem preço avulso</td></tr>
                  <tr><td>Protocolo Influência</td><td>Thiago Salomão</td><td>Só Pass e M3 Club</td><td>Sem preço avulso</td></tr>
                  <tr><td>Introdução ao Valuation</td><td>Matheus Soares e Thiago Salomão</td><td>Só Pass e M3 Club</td><td>Sem preço avulso</td></tr>
                </tbody>
              </table>
            </Card>
            <div className="mm-callout-info text-[0.84375rem] leading-relaxed [&_strong]:text-mm-accent-deep">
              <strong>
                Nunca informe preço ou link de compra avulsa dos quatro cursos exclusivos
              </strong>{" "}
              (Value Investing Aplicado, Finanças Comportamentais, Protocolo Influência, Introdução
              ao Valuation) — a oferta é sempre a assinatura (Pass ou M3 Club).
            </div>
          </Secao>

          <Secao ocultas={secoesOcultas} id="detalhes" titulo="Detalhes que sempre aparecem">
            <Card>
              <table className="mm-table">
                <tbody>
                  <tr><td>Créditos Planejar® (CFP®)</td><td>Todo curso da Academy concede créditos após submissão e aprovação. Confirme o status do curso antes de afirmar — nunca antecipe horas.</td></tr>
                  <tr><td>Certificado</td><td>Emitido na área logada (app.mmakers.com.br) após conclusão mínima e nota mínima na avaliação final.</td></tr>
                  <tr><td>Garantia</td><td>Toda venda online tem garantia de 7 dias (CDC).</td></tr>
                  <tr><td>Newsletters gratuitas</td><td>CompoundLetter: seg (Thiago), qua (Matheus), sex (Leopoldo). Inside The Market: ter/qui às 7h.</td></tr>
                </tbody>
              </table>
            </Card>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="regras-semaforo"
            titulo="Regras de ouro e semáforo"
            sub="Estas oito regras valem para toda mensagem, sem exceção."
          >
            <Card>
              <ol className="list-decimal pl-5 text-sm leading-relaxed [&_li]:mb-2 [&_li]:pl-0.5">
                <li>Nenhuma promessa de ganho, rentabilidade ou enriquecimento.</li>
                <li>Nenhuma recomendação individual de investimento. Nosso conteúdo é educacional.</li>
                <li>Nome, preço e prazo exatamente como na fonte oficial. Um só nome, um só preço, um só prazo.</li>
                <li>A oferta anunciada é cumprida como foi escrita. Toda venda online tem garantia de 7 dias (CDC).</li>
                <li>O canal oficial de atendimento é um só para todos os produtos. Endereço/número antigo → oriente para o canal oficial.</li>
                <li>A Academy é sempre &quot;Academy&quot; ou &quot;Market Makers Academy&quot;, nunca &quot;MMA&quot;.</li>
                <li>Nenhum dado pessoal de aluno sai da conversa sem autorização (LGPD).</li>
                <li>Se não sabe, diga que vai verificar e verifique. Nunca invente.</li>
              </ol>
            </Card>
            <Card titulo="Semáforo para decidir em segundos">
              <table className="mm-table">
                <thead>
                  <tr><th>Cor</th><th>Tipo de pergunta</th><th>O que fazer</th></tr>
                </thead>
                <tbody>
                  <tr className="bg-mm-green-tint"><td><span className="mm-pill mm-pill-aprovado">Verde</span></td><td>Preço, composição e regra de acesso de um produto, contatos oficiais, calendário das newsletters</td><td>Responder na hora, com a fonte à mão</td></tr>
                  <tr className="bg-mm-amber-tint"><td><span className="mm-pill mm-pill-pendente">Amarelo</span></td><td>Créditos Planejar®, datas de lançamento, cupons, oferta ativa, acesso à área logada, cancelamento</td><td>Verificar na fonte oficial ou com o responsável antes de responder</td></tr>
                  <tr className="bg-mm-red-tint"><td><span className="mm-pill mm-pill-rejeitado">Vermelho</span></td><td>Qual ativo comprar, se o fundo vale a pena, quanto vai render, qualquer promessa de ganho</td><td>Não responder. Explicar que o conteúdo é educacional, sem recomendação individual</td></tr>
                </tbody>
              </table>
            </Card>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="usar-ia"
            titulo="Como usar a IA de suporte"
            sub="A IA responde com base exclusivamente no conteúdo que a casa alimentou. Nunca usa conhecimento externo, e avisa quando não encontra a resposta. Ela redige o rascunho — você responde ao cliente."
          >
            <Card>
              <table className="mm-table">
                <tbody>
                  <tr><td>1</td><td>Acesse o site da IA com seu e-mail @mmakers.com.br.</td></tr>
                  <tr><td>2</td><td>Escolha o tópico: Geral Market Makers ou o produto sobre o qual é a dúvida.</td></tr>
                  <tr><td>3</td><td>Digite a pergunta em linguagem natural, uma dúvida por vez.</td></tr>
                  <tr><td>4</td><td>Leia a resposta e abra as fontes que a acompanham. Confira preço, prazo e regra.</td></tr>
                  <tr><td>5</td><td>Ajuste o tom à persona, remova qualquer promessa ou recomendação que tenha escapado.</td></tr>
                  <tr><td>6</td><td>Avalie: 👍 quando resolveu bem, 👎 com comentário curto quando faltou, está errada ou desatualizada.</td></tr>
                </tbody>
              </table>
            </Card>
            <div className="mm-callout-info mb-3.5 text-[0.84375rem] leading-relaxed [&_strong]:text-mm-accent-deep">
              <strong>Quando a IA responde &quot;não encontrei isso na nossa base&quot;</strong> — ela
              não está quebrada: não encontrou conteúdo parecido o suficiente e preferiu não
              arriscar. Verifique na fonte oficial, responda o cliente com a informação confirmada,
              e dê 👎 com o comentário &quot;conteúdo ausente&quot; para a curadoria incluir o
              assunto.
            </div>
            <Card titulo="Três checagens antes de enviar">
              <p className="text-[0.84375rem] leading-relaxed">
                O produto está certo? Preço e prazo batem com a fonte que a IA mostrou? Ficou livre
                de promessa de ganho e de recomendação individual?
              </p>
            </Card>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="respostas-modelo"
            titulo="Respostas-modelo"
            sub="Use como ponto de partida e adapte à persona de quem escreve. Onde aparece [INSERIR], complete com a informação confirmada antes de enviar."
          >
            <div className="flex flex-col gap-3">
              {RESPOSTAS_MODELO.map((modelo) => (
                <div
                  key={modelo.situacao}
                  className="relative rounded-[14px] border border-mm-border bg-mm-surface px-5 py-[18px]"
                >
                  <div className="mb-2.5 pr-20 text-[0.84375rem] font-bold text-mm-accent-deep">
                    {modelo.situacao}
                  </div>
                  <BotaoCopiar texto={modelo.texto} />
                  <blockquote className="border-l-[3px] border-mm-accent-soft pl-3.5 text-sm leading-[1.65] text-mm-text">
                    {modelo.texto}
                  </blockquote>
                </div>
              ))}
            </div>
          </Secao>

          <Secao
            ocultas={secoesOcultas}
            id="contatos"
            titulo="Contatos oficiais"
            sub="Canal único para todos os produtos Market Makers. Nenhum outro endereço ou número circula."
          >
            <Card>
              <table className="mm-table">
                <tbody>
                  <tr><td>E-mail</td><td>relacionamento@mmakers.com.br</td></tr>
                  <tr><td>WhatsApp</td><td>+55 11 95308-1559</td></tr>
                  <tr><td>Área logada dos cursos</td><td>app.mmakers.com.br</td></tr>
                </tbody>
              </table>
            </Card>
            <div className="mm-callout-info mb-3.5 text-[0.84375rem] leading-relaxed">
              Se um cliente citar contato@, suporte@ ou academy@mmakers.com.br, ou um número antigo,
              atenda normalmente e oriente para o canal oficial. Encontrou algum desses em material
              existente? Avise a Bruna para corrigir.
            </div>
            <Card titulo="Quando não souber">
              <p className="text-[0.84375rem] leading-relaxed">
                Consulte este material → pergunte à IA de suporte e abra as fontes → verifique na
                página oficial do produto → se ainda restar dúvida, escale conforme o fluxo do time.
                Enquanto isso, responda o cliente com a mensagem de verificação e não deixe a
                conversa sem retorno.
              </p>
            </Card>
          </Secao>

          <footer className="mt-5 border-t border-mm-border pb-2.5 pt-10 text-center text-[0.78125rem] text-mm-text-muted">
            Central de Conhecimento Market Makers — fonte: Material de Apoio do Time (set/2026) e
            base institucional da marca (ago/2026). Divergências com a página oficial do produto? A
            página oficial vale — avise a Bruna.
          </footer>
        </main>
      </div>
    </>
  );
}
