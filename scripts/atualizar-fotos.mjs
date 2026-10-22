// Lê o álbum compartilhado do Google Fotos e grava fotos.json para a galeria do site.
// Executado pela GitHub Action .github/workflows/atualizar-fotos.yml.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const ALBUM = 'https://photos.app.goo.gl/umKXMonhrW921ksP6';
const OUT = 'fotos.json';

const res = await fetch(ALBUM, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'pt-BR' }, redirect: 'follow' });
if (!res.ok) throw new Error(`Falha ao abrir o álbum: HTTP ${res.status}`);
const html = await res.text();

const seen = new Set();
const photos = [];
for (const m of html.matchAll(/\["(https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]+)",(\d+),(\d+)/g)) {
  if (seen.has(m[1])) continue;
  seen.add(m[1]);
  photos.push({ url: m[1], w: +m[2], h: +m[3] });
}

// Não apaga a galeria se a leitura falhar (ex.: mudança no Google Fotos).
if (!photos.length) {
  console.error('Nenhuma foto encontrada; fotos.json mantido.');
  process.exit(existsSync(OUT) ? 0 : 1);
}

const json = JSON.stringify({ album: ALBUM, photos }, null, 1) + '\n';
if (existsSync(OUT) && readFileSync(OUT, 'utf8') === json) {
  console.log(`Sem alterações (${photos.length} fotos).`);
} else {
  writeFileSync(OUT, json);
  console.log(`fotos.json atualizado: ${photos.length} fotos.`);
}
