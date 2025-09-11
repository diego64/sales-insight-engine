const readline = require("readline");
const categorias = require("./frente.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// -------------------- Funções auxiliares --------------------
function questionAsync(texto) {
  return new Promise(resolve => rl.question(texto, resolve));
}

function validarEntrada(resposta) {
  const valor = parseFloat(resposta.replace(",", "."));
  return isNaN(valor) ? null : valor;
}

function gerarBorda(linhas) {
  const tamanhoMax = linhas.reduce((max, linha) => Math.max(max, linha.length), 0);
  return "#".repeat(tamanhoMax + 4); // +4 para margem
}

// -------------------- Menu de seleção --------------------
async function selecionarCategoria() {
  console.log("✒️  Selecione a categoria principal:");
  const principais = Object.keys(categorias);
  principais.forEach((cat, i) => console.log(`${i + 1} - ${cat}`));

  const indicePrincipal = await questionAsync("Digite o número da categoria principal: ");
  const catPrincipal = principais[parseInt(indicePrincipal) - 1];
  if (!catPrincipal) return selecionarCategoria();

  const subCategorias = categorias[catPrincipal];
  if (!subCategorias || Object.keys(subCategorias).length === 0) return catPrincipal;

  console.log(`\n✒️  Selecione o canal de "${catPrincipal}":`);
  const canais = Object.keys(subCategorias);
  canais.forEach((canal, i) => console.log(`${i + 1} - ${canal}`));

  const indiceCanal = await questionAsync("Digite o número do canal: ");
  const canalSelecionado = canais[parseInt(indiceCanal) - 1];
  if (!canalSelecionado) return selecionarCategoria();

  const opcoes = subCategorias[canalSelecionado];
  if (!opcoes || Object.keys(opcoes).length === 0) return `${catPrincipal} > ${canalSelecionado}`;

  console.log(`\n✒️  Selecione a opção dentro de "${canalSelecionado}":`);
  Object.entries(opcoes).forEach(([num, nome]) => console.log(`${num} - ${nome}`));

  const indiceOpcao = await questionAsync("Digite o número da opção: ");
  const opcaoSelecionada = opcoes[indiceOpcao];
  if (!opcaoSelecionada) return selecionarCategoria();

  return `${catPrincipal} > ${canalSelecionado} > ${opcaoSelecionada}`;
}

// -------------------- Entrada de dados --------------------
const PERGUNTAS = ["ATUAL", "D-1", "W-1", "W-4", "PEDIDOS PARADOS"];
let dados = {};

async function perguntarDados() {
  for (const campo of PERGUNTAS) {
    let valor;
    do {
      const resposta = await questionAsync(`${campo}: `);
      valor = validarEntrada(resposta);
      if (valor === null) console.log("⚠️ Por favor, insira um número válido.\n");
    } while (valor === null);
    dados[campo] = valor;
  }
}

// -------------------- Cálculo --------------------
function calcular() {
  const { "ATUAL": atual, "D-1": d1, "W-1": w1, "W-4": w4, "PEDIDOS PARADOS": pedidosParados } = dados;

  const atualTotal = atual + pedidosParados;
  const mediaHistorica = (d1 + w1 + w4) / 3;

  const percD1 = Math.round(((atual - d1) / d1) * 100);
  const percW1 = Math.round(((atual - w1) / w1) * 100);
  const percW4 = Math.round(((atual - w4) / w4) * 100);

  const variacao = Math.round(((atualTotal - mediaHistorica) / mediaHistorica) * 100);

  return { atual, pedidosParados, atualTotal, d1, w1, w4, percD1, percW1, percW4, mediaHistorica, variacao };
}

// -------------------- Exibição do relatório --------------------
function exibirRelatorio(selecao, resultado) {
  const { atual, pedidosParados, atualTotal, d1, w1, w4, percD1, percW1, percW4, mediaHistorica, variacao } = resultado;

  const linhas = [
    `📋 Categoria selecionada: ${selecao}`,
    "",
    `ATUAL: ${atual}`,
    `D-1: ${d1} (${percD1}%)`,
    `W-1: ${w1} (${percW1}%)`,
    `W-4: ${w4} (${percW4}%)`,
    `PEDIDOS PARADOS: ${pedidosParados}`,
    `ATUAL + PEDIDOS PARADOS: ${atualTotal}`,
    `Média Histórica (D-1, W-1, W-4): ${Math.round(mediaHistorica)}`,
    "",
    `📊 Variação Final: ${variacao}%`,
    "",
    variacao <= 15
      ? "🚨 É NECESSÁRIO ABRIR UM INCIDENTE CRÍTICO PARA O TEMA"
      : "✅ NÃO É NECESSÁRIO ABRIR UM INCIDENTE CRÍTICO"
  ];

  const borda = gerarBorda(linhas);

  console.log(borda);
  linhas.forEach(linha => console.log(`  ${linha}`));
  console.log(borda);
}

// -------------------- Fluxo principal --------------------
(async () => {
  const selecao = await selecionarCategoria();
  console.log(`\nVocê selecionou: ${selecao}\n`);

  console.log("✒️  Agora insira os dados de vendas:\n");
  await perguntarDados();

  const resultado = calcular();
  exibirRelatorio(selecao, resultado);

  rl.close();
})();
