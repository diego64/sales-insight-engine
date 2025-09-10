const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PERGUNTAS = ["ATUAL", "D-1", "W-1", "W-4", "PEDIDOS PARADOS"];
let dados = {};

console.log("✒️  Insira os dados abaixo:\n");

function validarEntrada(resposta) {
  const valor = parseFloat(resposta.replace(",", "."));
  return isNaN(valor) ? null : valor;
}

function perguntar(campo) {
  return new Promise((resolve) => {
    rl.question(`${campo}: `, (resposta) => {
      const valor = validarEntrada(resposta);
      if (valor === null) {
        console.log("⚠️  Por favor, insira um número válido.\n");
        return resolve(perguntar(campo));
      }
      dados[campo] = valor;
      resolve();
    });
  });
}

async function main() {
  for (const campo of PERGUNTAS) {
    await perguntar(campo);
  }
  calcular();
  rl.close();
}

function calcular() {
  const { "ATUAL": atual, "D-1": d1, "W-1": w1, "W-4": w4, "PEDIDOS PARADOS": pedidosParados } = dados;

  const atualTotal = atual + pedidosParados;
  const mediaHistorica = (d1 + w1 + w4) / 3;

  // Percentuais individuais arredondados
  const percD1 = Math.round(((atual - d1) / d1) * 100);
  const percW1 = Math.round(((atual - w1) / w1) * 100);
  const percW4 = Math.round(((atual - w4) / w4) * 100);

  // Variação final arredondada
  const variacao = Math.round(((atualTotal - mediaHistorica) / mediaHistorica) * 100);

  exibirRelatorio({ atual, pedidosParados, atualTotal, d1, w1, w4, percD1, percW1, percW4, mediaHistorica, variacao });
}

function exibirRelatorio({ atual, pedidosParados, atualTotal, d1, w1, w4, percD1, percW1, percW4, mediaHistorica, variacao }) {
  console.log("\n##############################################");
  console.log("📋 Relatório de Vendas\n");

  console.log(`ATUAL: ${atual}`);
  console.log(`D-1: ${d1} (${percD1}%)`);
  console.log(`W-1: ${w1} (${percW1}%)`);
  console.log(`W-4: ${w4} (${percW4}%)`);
  console.log(`PEDIDOS PARADOS: ${pedidosParados}`);
  console.log(`ATUAL + PEDIDOS PARADOS: ${atualTotal}`);
  console.log(`Média Histórica (D-1, W-1, W-4): ${Math.round(mediaHistorica)}\n`);

  console.log(`📊 Variação Final: ${variacao}%\n`);

  if (Math.abs(variacao) < 15) {
    console.log("✅ NÃO É NECESSÁRIO ABRIR UM INCIDENTE CRÍTICO");
  } else {
    console.log("🚨 É NECESSÁRIO ABRIR UM INCIDENTE CRÍTICO PARA O TEMA");
  }

  console.log("##############################################\n");
}

main();
