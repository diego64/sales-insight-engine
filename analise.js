const readline = require("readline");
const categorias = require("./frente.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// -------------------- FUNÇÕES AUXILIARES --------------------
function questionAsync(texto) {
  return new Promise(resolve => rl.question(texto, resolve));
}

function validarEntrada(resposta) {
  const valor = parseFloat(resposta.replace(",", "."));
  return isNaN(valor) ? null : valor;
}

// -------------------- MENU DE SELEÇÃO --------------------
async function selecionarCategoria(menuAnterior = null) {
  console.log("==================================");
  console.log("ANALISE DE DADOS (VENDAS)");
  console.log("==================================\n");

  //Menu Inicial
  if (!menuAnterior) {
    console.log("SELECIONE A CATEGORIA PRINCIPAL:\n");
    const principais = Object.keys(categorias);
    principais.forEach((cat, i) => console.log(`${i + 1}. ${cat}`));
    console.log(`${principais.length + 1}. VOLTAR\n`);

    let indicePrincipal, catPrincipal;
    while (true) {
      indicePrincipal = await questionAsync(`DIGITE SUA OPÇÃO [1-${principais.length + 1}]: `);
      indicePrincipal = parseInt(indicePrincipal);

      if (indicePrincipal === principais.length + 1) {
        console.log("NÃO HÁ MENU PARA RETORNAR\n");
        continue;
      }

      if (indicePrincipal >= 1 && indicePrincipal <= principais.length) {
        catPrincipal = principais[indicePrincipal - 1];
        break;
      }
      console.log("OPÇÃO INVÁLIDA. TENTE NOVAMENTE.\n");
    }

    const subCategorias = categorias[catPrincipal];
    if (!subCategorias || Object.keys(subCategorias).length === 0) return catPrincipal;

    return await selecionarCategoria({ catPrincipal, subCategorias });
  }

  //Menu Sub
  const { catPrincipal, subCategorias } = menuAnterior;

  console.log(`\nSELECIONE O CANAL DE "${catPrincipal}":\n`);
  const canais = Object.keys(subCategorias);
  canais.forEach((canal, i) => console.log(`${i + 1}. ${canal}`));
  console.log(`${canais.length + 1}. VOLTAR\n`);

  let indiceCanal, canalSelecionado;
  while (true) {
    indiceCanal = await questionAsync(`DIGITE SUA OPÇÃO [1-${canais.length + 1}]: `);
    indiceCanal = parseInt(indiceCanal);

    if (indiceCanal === canais.length + 1) {
      return await selecionarCategoria();
    }

    if (indiceCanal >= 1 && indiceCanal <= canais.length) {
      canalSelecionado = canais[indiceCanal - 1];
      break;
    }
    console.log("OPÇÃO INVÁLIDA. TENTE NOVAMENTE.\n");
  }

  const opcoes = subCategorias[canalSelecionado];
  if (!opcoes || Object.keys(opcoes).length === 0) return `${catPrincipal} > ${canalSelecionado}`;

  console.log(`\nSELECIONE A OPÇÃO DENTRO DE "${canalSelecionado}":\n`);
  Object.entries(opcoes).forEach(([num, nome]) => console.log(`${num}. ${nome}`));
  const numerosOpcoes = Object.keys(opcoes).map(n => parseInt(n));
  const voltarNum = Math.max(...numerosOpcoes) + 1;
  console.log(`${voltarNum}. VOLTAR\n`);

  let indiceOpcao, opcaoSelecionada;
  while (true) {
    indiceOpcao = await questionAsync(`DIGITE SUA OPÇÃO [${numerosOpcoes[0]}-${voltarNum}]: `);
    indiceOpcao = parseInt(indiceOpcao);

    if (indiceOpcao === voltarNum) {
      return await selecionarCategoria({ catPrincipal, subCategorias });
    }

    if (numerosOpcoes.includes(indiceOpcao)) {
      opcaoSelecionada = opcoes[indiceOpcao];
      break;
    }
    console.log("OPÇÃO INVÁLIDA. TENTE NOVAMENTE.\n");
  }

  return `${catPrincipal} > ${canalSelecionado} > ${opcaoSelecionada}`;
}

// -------------------- ENTRADA DE DADOS --------------------
const PERGUNTAS = ["ATUAL", "D-1", "W-1", "W-4", "PEDIDOS PARADOS"];
let dados = {};

async function perguntarDados() {
  for (const campo of PERGUNTAS) {
    let valor;
    do {
      const resposta = await questionAsync(`${campo}: `);
      valor = validarEntrada(resposta);
      if (valor === null) console.log("POR FAVOR, INSIRA UM NÚMERO VÁLIDO.\n");
    } while (valor === null);
    dados[campo] = valor;
  }
}

// -------------------- CÁLCULO --------------------
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

// -------------------- EXIBIÇÃO DO RELATÓRIO --------------------
function exibirRelatorio(selecao, resultado) {
  const { atual, pedidosParados, atualTotal, d1, w1, w4, percD1, percW1, percW4, mediaHistorica, variacao } = resultado;

  // CABEÇALHOS
  const cabecalho = [
    "PARAMETRO".padEnd(10),
    "VALOR".padEnd(8),
    "VARIAÇÃO (%)".padEnd(12),
    "PEDIDOS PARADOS".padEnd(15),
    "TOTAL (ATUAL + PARADOS)".padEnd(20),
  ];

  // LINHAS DE DADOS
  const linhas = [
    ["ATUAL", atual, "", pedidosParados, atualTotal],
    ["D-1", d1, `${percD1}%`, "", ""],
    ["W-1", w1, `${percW1}%`, "", ""],
    ["W-4", w4, `${percW4}%`, "", ""],
  ];

  // TABELA
  const separador = "-".repeat(90);
  console.log(`\nCATEGORIA SELECIONADA: ${selecao}\n`);
  console.log(cabecalho.join(" | "));
  console.log(separador);
  linhas.forEach(linha => {
    console.log(
      linha[0].padEnd(10) + " | " +
      String(linha[1]).padEnd(8) + " | " +
      String(linha[2]).padEnd(12) + " | " +
      String(linha[3]).padEnd(15) + " | " +
      String(linha[4]).padEnd(20)
    );
  });
  console.log(separador);

  // MÉDIAS E RESULTADO FINAL
  const mediaPorcentagem = Math.round((percD1 + percW1 + percW4) / 3);

  console.log(`\nMÉDIA NUMÉRICA DOS PEDIDOS = ${Math.round(mediaHistorica)}`);
  console.log(`MÉDIA EM PORCENTAGEM DOS PEDIDOS = ${mediaPorcentagem}%\n`);
  console.log(`RESULTADO FINAL = ${variacao}%\n`);

  if (variacao <= 15) {
    console.log("É NECESSÁRIO ABRIR UM INCIDENTE CRÍTICO PARA O TEMA");
  } else {
    console.log("NÃO É NECESSÁRIO ABRIR UM INCIDENTE CRÍTICO");
  }
}

// -------------------- FLUXO PRINCIPAL --------------------
(async () => {
  const selecao = await selecionarCategoria();
  console.log(`\nVOCÊ SELECIONOU: ${selecao}\n`);

  console.log("AGORA INSIRA OS DADOS DE VENDAS:\n");
  await perguntarDados();

  const resultado = calcular();
  exibirRelatorio(selecao, resultado);

  rl.close();
})();
