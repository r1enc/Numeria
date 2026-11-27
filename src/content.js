export const worlds = [
  { name: 'Lembah Bilangan', subtitle: 'Kenali angka dan lihat polanya', icon: '◉', color: 'mint', stages: ['Teman Angka','Satu Langkah Lagi','Urutkan Jejak','Lebih Banyak, Lebih Sedikit','Pasangan Sepuluh','Menuju Dua Puluh','Lompatan Bilangan','Temukan Angka Hilang','Pola yang Berulang','Gerbang Lembah'] },
  { name: 'Jembatan Tambah-Kurang', subtitle: 'Bangun strategi hitung yang cerdas', icon: '↗', color: 'peach', stages: ['Gabungkan Kelompok','Jembatan ke Sepuluh','Tambah dengan Lompatan','Kurangi dengan Mundur','Cari Jaraknya','Keluarga Fakta','Kotak Misteri','Benar atau Keliru?','Cerita Dua Langkah','Jembatan Besar'] },
  { name: 'Hutan Perkalian', subtitle: 'Temukan kelompok dan hubungan angka', icon: '✳', color: 'lilac', stages: ['Kelompok Setara','Tambah Berulang','Baris dan Kolom','Cermin Perkalian','Bagi dengan Adil','Bentuk Kelompok','Fakta Berpasangan','Faktor Misterius','Pilih Operasinya','Uji Rimba'] },
  { name: 'Pulau Pecahan', subtitle: 'Lihat satu utuh dari banyak cara', icon: '◒', color: 'blue', stages: ['Satu Utuh','Bagian yang Sama','Pecahan dari Kumpulan','Pecahan di Garis','Mana yang Lebih Besar?','Pecahan Kembar','Gabungkan Bagian','Bagian dari Jumlah','Lewat dari Satu','Jembatan Pecahan'] },
  { name: 'Kota Pola & Strategi', subtitle: 'Uji dugaan, cari cara, jelaskan alasan', icon: '⌘', color: 'gold', stages: ['Lanjutkan Polanya','Apa yang Berubah?','Seimbang di Dua Sisi','Pecah untuk Mudah','Tebak Sebelum Hitung','Semua Kemungkinan','Cara yang Berbeda','Detektif Kesalahan','Tantangan Baru','Menara Penalaran'] },
];
const hintFor = prompt => /fraction|pecahan|\d+\/\d+|bagian yang sama/i.test(prompt) ? 'Perhatikan berapa bagian yang sama besar dan berapa bagian yang sedang dibahas.' : /pola|angka setelah|lanjutkan/i.test(prompt) ? 'Bandingkan dua langkah berurutan. Apa yang berubah setiap kali?' : /kelompok|pasangan|×|dibagi|kali/i.test(prompt) ? 'Coba gambar kelompoknya atau susun kemungkinan satu per satu.' : /lebih besar|jarak|diambil|tersisa|berapa semuanya/i.test(prompt) ? 'Gambarkan situasinya, lalu tentukan apa yang diminta.' : 'Pecah tantangan ini menjadi langkah kecil. Informasi apa yang sudah diketahui?';
const q = (prompt, answer, choices, explain, visual = '', hint = hintFor(prompt)) => ({ prompt, answer: String(answer), choices: choices.map(String), explain, visual, hint });
function choice(answer, others, explain, prompt, visual = '', hint = hintFor(prompt)) {
  const correct = String(answer), values = [...new Set([correct, ...others.map(String)])];
  if (values.length < 4 && !Number.isFinite(Number(correct))) throw new Error(`Soal perlu empat pilihan unik: ${prompt}`);
  for (let n = 1; values.length < 4; n++) if (!values.includes(String(Number(correct) + n))) values.push(String(Number(correct) + n));
  for (let i = values.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; }
  return q(prompt, correct, values.slice(0, 4), explain, visual, hint);
}
const wrap = (n, max) => ((n - 1) % max) + 1;
const fractions = (answer, distractors, explain, prompt, visual = '', hint) => {
  const wrong = [...new Set(distractors.map(String).filter(item => item !== String(answer)))];
  for (let d = 2; wrong.length < 3 && d < 20; d++) for (let n = 1; n < d && wrong.length < 3; n++) { const candidate = `${n}/${d}`; if (candidate !== String(answer) && !wrong.includes(candidate)) wrong.push(candidate); }
  return choice(answer, wrong.slice(0, 3), explain, prompt, visual, hint || hintFor(prompt));
};

function makeQuestion(world, stage, step) {
  const seed = stage * 5 + step;
  if (world === 0) {
    if (stage === 1) { const n = wrap(seed + 3, 10); return choice(n, [n + 1, n + 2, n - 1], `Ada ${n} titik. Satu titik mewakili satu benda, jadi jumlahnya ${n}.`, 'Berapa banyak titik yang kamu lihat?', '● '.repeat(n)); }
    if (stage === 2) { const n = 11 + seed % 8; return choice(n + 1, [n - 1, n + 2, n], `Angka setelah ${n} adalah ${n + 1}.`, `Angka setelah ${n} adalah…`); }
    if (stage === 3) { const n = 15 + seed % 10; return choice(n + 1, [n - 2, n, n - 1], `${n+1} paling besar karena nilainya satu lebih dari ${n}.`, `Mana yang paling besar: ${n-2}, ${n}, ${n-1}, atau ${n+1}?`, `${n-2}   ${n}   ${n-1}   ${n+1}`); }
    if (stage === 4) { const a = 4 + seed % 5, b = 10 - a; return choice(b, [b - 1, b + 1, a], `${a} dan ${b} membentuk 10 karena ${a}+${b}=10.`, `${a} + □ = 10`); }
    if (stage === 5) { const a = 12 + seed % 6, b = 20 - a; return choice(b, [b - 2, b + 1, a], `Melengkapi ${a} ke 20 perlu ${b}: ${a}+${b}=20.`, `${a} + □ = 20`); }
    if (stage === 6) { const start = 3 + seed % 5, jump = 2 + seed % 3; return choice(start + jump * 3, [start + jump * 2, start + jump * 4, start + jump + 3], `Setiap lompatan bertambah ${jump}; tiga lompatan dari ${start} sampai ${start + jump * 3}.`, `Mulai dari ${start}, lompat ${jump} tiga kali. Sampai di angka berapa?`); }
    if (stage === 7) { const a = 5 + seed % 8, b = 2 + seed % 4; return choice(b, [b - 1, b + 1, a], `${a}+${b}=${a+b}.`, `${a} + □ = ${a+b}`); }
    if (stage === 8) { const start = 1 + seed % 4, step = 2 + seed % 3; return choice(start + step * 3, [start + step * 2, start + step * 4, start + 3], `Pola bertambah ${step} setiap kali.`, `Lanjutkan pola: ${start}, ${start+step}, ${start+2*step}, □`); }
    const a = 6 + seed % 5, b = 4 + seed % 4; return choice(a + b, [a + b - 1, a + b + 1, a + b + 2], `Coba pecah ${b} agar ${a} genap menjadi 10; hasil akhirnya ${a+b}.`, `Tantangan: ${a} + ${b} = ?`, `${a} + ${b} = ?`);
  }
  if (world === 1) {
    const a = 8 + seed % 12, b = 3 + seed % 9;
    if (stage === 1) return choice(a + b, [a+b-1,a+b+1,a+b+2], `Menggabungkan ${a} dan ${b} benda menghasilkan ${a+b}.`, `${a} benda merah dan ${b} benda biru. Berapa semuanya?`);
    if (stage === 2) { const n = 8 + seed % 2, remainder = n + 5 - 10; return choice(remainder, [remainder+1,remainder-1,5], `Pindahkan ${10-n} dari 5 untuk melengkapi ${n} ke 10. Tersisa ${remainder}; jadi ${n}+5=10+${remainder}.`, `${n} + 5 = 10 + □. Berapa nilai kotaknya?`, `${n} + 5 = 10 + □`); }
    if (stage === 3) return choice(a + b, [a+b-2,a+b+2,a+b+1], `Lompatan maju ${b} dari ${a} berakhir di ${a+b}.`, `Di garis angka, mulai ${a} lalu lompat maju ${b}.`);
    if (stage === 4 || stage === 5) return choice(a - b, [a-b+1,a-b-1,a-b+2], `Selisih/jumlah tersisa: ${a}−${b}=${a-b}.`, stage === 4 ? `${a} benda, ${b} diambil. Berapa tersisa?` : `Berapa jarak antara ${b} dan ${a}?`);
    if (stage === 6) return choice(a-b, [a-b-1,a-b+1,b], `Karena ${b}+${a-b}=${a}, fakta pengurangannya ${a}−${b}=${a-b}.`, `Jika ${b} + □ = ${a}, berapa kotaknya?`);
    if (stage === 7) return choice(a, [a-2,a+1,b], `Kedua sisi harus sama nilainya. ${a-b}+${b}=${a}.`, `□ − ${b} = ${a-b}`);
    if (stage === 8) return choice('Benar', ['Salah','Tidak cukup informasi','Kadang benar'], `Kedua sisi bernilai ${a+b}; penjumlahan bisa dikelompokkan ulang.`, `Pernyataan ini benar atau salah? ${a} + ${b} = ${b} + ${a}`);
    if (stage === 9) return choice(a + b - 2, [a+b,a+b-1,a+b+2], `Langkah pertama: ${a}−2. Lalu tambah ${b}; hasil ${a+b-2}.`, `Ada ${a} apel. ${b} datang, lalu 2 dimakan. Berapa sekarang?`);
    return choice(a + b, [a+b-1,a+b+1,a+b+2], `Pecah ${b} untuk melengkapi ${a} ke 10, lalu hitung sisanya.`, `Cari strategi cepat: ${a} + ${b}`);
  }
  if (world === 2) {
    const a = 2 + seed % 8, b = 2 + (seed * 3) % 8;
    if (stage <= 4) return choice(a*b, [a*b-a,a*b+b,a+b], `Ada ${a} kelompok berisi ${b}. Jadi ${a}×${b}=${a*b}.`, `${a} kelompok, masing-masing ${b}. Berapa semuanya?`, `${('● '.repeat(b)+'\n').repeat(a)}`);
    if (stage === 5 || stage === 6) return choice(a, [a-1,a+1,b], `${a*b} dibagi rata menjadi ${b} kelompok memberi ${a} di tiap kelompok.`, `${a*b} benda dibagi rata ke ${b} kelompok. Berapa tiap kelompok?`);
    if (stage === 7) return choice(b, [b-1,b+1,a], `Perkalian dan pembagian berkaitan: ${a}×${b}=${a*b}, maka ${a*b}÷${a}=${b}.`, `Jika ${a} × ${b} = ${a*b}, maka ${a*b} ÷ ${a} = ?`);
    if (stage === 8) return choice(a*b, [a*b-a,a*b+1,a+b], `${a}×${b}=${a*b}; cek dengan membagi hasilnya oleh ${a}.`, `${a} × □ = ${a*b}`);
    return choice(a*b, [a*b-1,a*b+a,a+b], `Buat ${a} kelompok sama banyak. Jumlah seluruhnya ${a*b}.`, `Rancang ${a} kelompok dengan ${b} benda tiap kelompok. Berapa totalnya?`);
  }
  if (world === 3) {
    const den = [2,3,4,5,6][seed % 5], num = 1 + seed % (den-1);
    if (stage <= 2) return choice(`${num}/${den}`, [`${num+1}/${den}`,`${num}/${den+1}`,`${den}/${num}`], `Satu utuh dibagi ${den} bagian sama, lalu diambil ${num}; itu ${num}/${den}.`, `Jika ${den} bagian sama besar dan diarsir ${num}, pecahannya berapa?`, `${'■ '.repeat(num)}${'□ '.repeat(den-num)}`);
    if (stage === 3) return choice(num, [num+1,den,num-1], `${num}/${den} dari ${den} benda adalah ${num} benda.`, `Berapa ${num}/${den} dari ${den} benda?`);
    if (stage === 4) {
      const x = 10 + 80 * num / den, ticks = Array.from({ length: den + 1 }, (_, i) => { const tx = 10 + 80 * i / den; return `<line x1="${tx}" y1="43" x2="${tx}" y2="57" stroke="#47775c" stroke-width="2"/>`; }).join('');
      const line = `<svg viewBox="0 0 100 82" role="img" aria-label="Garis bilangan dari nol sampai satu dengan titik P di salah satu tanda"><line x1="10" y1="50" x2="90" y2="50" stroke="#47775c" stroke-width="3"/>${ticks}<circle cx="${x}" cy="50" r="4" fill="#ee9368"/><text x="${x}" y="31" text-anchor="middle" font-size="12" fill="#a75b3d">P</text><text x="8" y="72" font-size="10" fill="#53675a">0</text><text x="88" y="72" font-size="10" fill="#53675a">1</text></svg>`;
      return fractions(`${num}/${den}`, [`${num+1}/${den}`,`${num}/${den+1}`,`${den-num}/${den}`,`${num}/${den+2}`], `Setiap jarak kecil pada garis bernilai 1/${den}. Titik P berada di tanda ke-${num}, jadi nilainya ${num}/${den}.`, `Nilai pecahan di titik P adalah…`, line, 'Hitung jumlah jarak yang sama dari 0 ke 1, lalu lihat jarak dari 0 sampai P.');
    }
    if (stage === 5) { const d = 3 + step, n = 1 + (step % (d - 2)), equivalent = `${n*2}/${d*2}`; return fractions(equivalent, [`${n+1}/${d}`,`${n}/${d+1}`,`${d}/${n}`], `Kalikan pembilang dan penyebut ${n}/${d} dengan 2 untuk mendapat ${equivalent}.`, `Pilih pecahan yang senilai dengan ${n}/${d}.`); }
    if (stage === 6) { const d = 2 * (step + 1), simple = `1/${step+1}`; return fractions(simple, [`2/${d}`,`1/${d}`,`3/${d}`,`2/${step+1}`], `Dua bagian ${1}/${d} membentuk ${2}/${d}; sederhanakan dengan membagi pembilang dan penyebut dengan 2.`, `Dua potong 1/${d} sama dengan pecahan paling sederhana yang mana?`, '', 'Gabungkan dulu dua potong itu. Lalu bagi pembilang dan penyebut dengan bilangan yang sama.'); }
    if (stage === 7) return choice(`${num+1}/${den}`, [`${num}/${den}`,`${num+2}/${den}`,`${num}/${den+1}`], `Penyebut sama: gabungkan pembilangnya, ${num}/${den}+1/${den}=${num+1}/${den}.`, `${num}/${den} + 1/${den} = ?`);
    if (stage === 8) { const total = 12 + (step - 1) * 4, result = total * 3 / 4; return choice(result, [result-1,result+1,total/2,total], `Bagi ${total} menjadi 4 kelompok sama besar, lalu ambil 3 kelompok: ${result}.`, `Berapa 3/4 dari ${total}?`); }
    if (stage === 9) { const whole = (step + 1) * 4, result = whole * 5 / 4; return choice(result, [result-1,result+1,whole,whole+1], `Lima bagian seperempat adalah satu utuh ditambah seperempat. Jadi 5/4 dari ${whole} adalah ${result}.`, `Berapa 5/4 dari ${whole}?`); }
    { const d = step + 3, n = 1 + (step % (d - 2)), result = `${n+1}/${d}`; return fractions(result, [`${n}/${d}`,`${n+2}/${d}`,`${n+1}/${d+1}`,`${d}/${n+1}`], `Gabungkan ${n}/${d} dan 1/${d}: pembilangnya menjadi ${n+1}, penyebut tetap ${d}.`, `${n}/${d} + 1/${d} = ?`); }
  }
  const a = 3 + seed % 10, b = 2 + (seed * 2) % 8;
  if (stage <= 2) return choice(a + b, [a+b-1,a+b+1,a*b], `Polanya bertambah ${b} setiap langkah.`, `Pola: ${a}, ${a+b}, ${a+2*b}, □`);
  if (stage === 3) return choice(a, [a-1,a+1,b], `Agar setara, isi kotak dengan ${a}.`, `${a} + ${b} = □ + ${b}`);
  if (stage === 4) { const x = step + 2, y = step + 5, result = x * y; return choice(result, [result-x,result+x,result-2], `Pecah ${y} menjadi ${y-2}+2, lalu hitung ${x}×${y-2} dan ${x}×2 sebelum menjumlahkan.`, `Hitung ${x} × ${y} dengan memecah ${y} menjadi ${y-2} + 2.`); }
  if (stage === 5) return choice(a*b, [a+b,a*b-a,a*b+b], `Perkiraan dulu membantu memeriksa apakah jawaban masuk akal. Hasil tepatnya ${a*b}.`, `Tanpa menghitung panjang: ${a} kelompok berisi ${b}. Pilih hasil yang masuk akal.`);
  if (stage === 6) { const hats = step + 2, bags = step + 1, total = hats * bags; return choice(total, [total-1,total+1,hats+bags], `Setiap topi bisa dipasangkan dengan masing-masing tas. Jadi ada ${hats}×${bags} pasangan.`, `Ada ${hats} topi dan ${bags} tas. Berapa pasangan berbeda?`, '', 'Buat satu baris untuk tiap topi, lalu hitung berapa tas yang bisa dipasangkan pada tiap baris.'); }
  if (stage === 7) return choice('Keduanya sama', ['Kiri lebih besar','Kanan lebih besar','Tidak bisa diketahui'], `Perkalian bisa dikelompokkan ulang tanpa mengubah hasil: (${a}×${b})×2 = ${a}×(${b}×2).`, `Mana yang lebih besar: (${a}×${b})×2 atau ${a}×(${b}×2)?`);
  if (stage === 8) return choice(a*b, [a*b+1,a*b-a,a+b], `Cara cek: hasil dibagi ${a} harus sama dengan ${b}.`, `Seseorang bilang ${a}×${b}=${a*b+1}. Apa hasil yang benar?`);
  return choice(a+b, [a+b-1,a+b+1,a*b], `Pola aturan: tambah ${b}. Menjelaskan aturan adalah bagian dari jawaban.`, `Angka pertama ${a}; tiap langkah tambah ${b}. Berapa angka ketiga?`);
}
export function getStageQuestions(world, stage) { return Array.from({ length: 5 }, (_, i) => makeQuestion(world, stage, i + 1)); }
