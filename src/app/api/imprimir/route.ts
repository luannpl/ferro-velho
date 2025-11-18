import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";

const asyncExec = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const dados = await req.json();

    // === MONTA ESC/POS ===
    let txt = "";
    txt += "\x1B\x40";       // reset
    txt += "\x1B\x61\x01";   // centralizado
    txt += "OSWALDO RECICLAGENS\n";
    txt += "\x1B\x61\x00";   // esquerda
    txt += "--------------------------------\n";
    txt += `Data: ${dados.dataCompra}\n`;
    txt += `Fornecedor: ${dados.fornecedor.nome}\n`;
    txt += "--------------------------------\n";
    txt += "Itens\n";

    for (const item of dados.itens) {
      txt += `${item.nome} (${item.quantidade}kg)\n`;
      txt += ` R$ ${item.precoTotal.toFixed(2)}\n`;
    }

    txt += "--------------------------------\n";
    txt += `TOTAL ITENS: ${dados.totalItens}\n`;
    txt += `TOTAL: R$ ${dados.valorTotal.toFixed(2)}\n`;
    txt += "--------------------------------\n";
    txt += "\nObrigado pela preferência!\n\n\n";
    txt += "\x1D\x56\x00"; // cut

    // === GARANTE PASTA /tmp/impressao ===
    const dir = "/tmp/impressao";
    await fs.mkdir(dir, { recursive: true });

    // === SALVA ARQUIVO ===
    const filePath = path.join(dir, `cupom_${Date.now()}.txt`);
    await fs.writeFile(filePath, txt, "binary");

    // === IMPRIME ===
    const cmd = `lp -d TM-T20X -o raw "${filePath}"`;
    await asyncExec(cmd);

    return NextResponse.json({ ok: true });

  } catch (e: any) {
    console.error("Erro impressão:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
