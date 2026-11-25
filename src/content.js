export const worlds = [
  { name: 'Lembah Bilangan', subtitle: 'Kenali angka dan lihat polanya', icon: '◉', color: 'mint', stages: ['Teman Angka','Satu Langkah Lagi','Urutkan Jejak','Lebih Banyak, Lebih Sedikit','Pasangan Sepuluh','Menuju Dua Puluh','Lompatan Bilangan','Temukan Angka Hilang','Pola yang Berulang','Gerbang Lembah'] },
  { name: 'Jembatan Tambah-Kurang', subtitle: 'Bangun strategi hitung yang cerdas', icon: '↗', color: 'peach', stages: ['Gabungkan Kelompok','Jembatan ke Sepuluh','Tambah dengan Lompatan','Kurangi dengan Mundur','Cari Jaraknya','Keluarga Fakta','Kotak Misteri','Benar atau Keliru?','Cerita Dua Langkah','Jembatan Besar'] },
  { name: 'Hutan Perkalian', subtitle: 'Temukan kelompok dan hubungan angka', icon: '✳', color: 'lilac', stages: ['Kelompok Setara','Tambah Berulang','Baris dan Kolom','Cermin Perkalian','Bagi dengan Adil','Bentuk Kelompok','Fakta Berpasangan','Faktor Misterius','Pilih Operasinya','Uji Rimba'] },
  { name: 'Pulau Pecahan', subtitle: 'Lihat satu utuh dari banyak cara', icon: '◒', color: 'blue', stages: ['Satu Utuh','Bagian yang Sama','Pecahan dari Kumpulan','Pecahan di Garis','Mana yang Lebih Besar?','Pecahan Kembar','Gabungkan Bagian','Bagian dari Jumlah','Lewat dari Satu','Jembatan Pecahan'] },
  { name: 'Kota Pola & Strategi', subtitle: 'Uji dugaan, cari cara, jelaskan alasan', icon: '⌘', color: 'gold', stages: ['Lanjutkan Polanya','Apa yang Berubah?','Seimbang di Dua Sisi','Pecah untuk Mudah','Tebak Sebelum Hitung','Semua Kemungkinan','Cara yang Berbeda','Detektif Kesalahan','Tantangan Baru','Menara Penalaran'] },
];
const q = (prompt, answer, choices, explain, visual = '') => ({ prompt, answer: String(answer), choices: choices.map(String), explain, visual });
function choice(answer, others, explain, prompt, visual = '') {
  const correct = String(answer), values = [...new Set([correct, ...others.map(String)])];
  for (let n = 0; values.length < 4; n++) if (!values.includes(String(Number(correct) + n + 1))) values.push(String(Number(correct) + n + 1));
  return q(prompt, correct, values.slice(0, 4).sort(() => 0.5 - Math.random()), explain, visual);
}
const wrap = (n, max) => ((n - 1) % max) + 1;

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
    if (stage === 4) return choice(`${num}/${den}`, [`${num+1}/${den}`,`${num}/${den+1}`,`${den}/${num}`], `Tiap bagian ukurannya ${num}/${den} dari satu utuh.`, `Tandai ${num}/${den} pada garis dari 0 sampai 1.`);
    if (stage === 5) return choice('1/2', ['1/3','1/4','3/4'], `Dua potong seperempat menutupi panjang yang sama dengan setengah.`, `Pilih pecahan yang sama dengan 2/4.`, '¼ + ¼ = ?');
    if (stage === 6) return choice('2/4', ['1/4','3/4','2/3'], `Dua potong seperempat menutupi panjang yang sama dengan setengah.`, `Dua potong 1/4 sama dengan pecahan mana?`);
    if (stage === 7) return choice(`${num+1}/${den}`, [`${num}/${den}`,`${num+2}/${den}`,`${num}/${den+1}`], `Penyebut sama: gabungkan pembilangnya, ${num}/${den}+1/${den}=${num+1}/${den}.`, `${num}/${den} + 1/${den} = ?`);
    if (stage === 8) return choice(15, [5,10,20], `Tiga perempat dari 20: 20÷4=5, lalu 5×3=15.`, `Berapa 3/4 dari 20?`);
    return choice('1 1/4', ['1/4','1 3/4','2'], `Empat perempat menjadi 1 utuh, sisa seperempat.`, `Lima potong 1/4 menjadi…`);
  }
  const a = 3 + seed % 10, b = 2 + (seed * 2) % 8;
  if (stage <= 2) return choice(a + b, [a+b-1,a+b+1,a*b], `Polanya bertambah ${b} setiap langkah.`, `Pola: ${a}, ${a+b}, ${a+2*b}, □`);
  if (stage === 3) return choice(a, [a-1,a+1,b], `Agar setara, isi kotak dengan ${a}.`, `${a} + ${b} = □ + ${b}`);
  if (stage === 4) return choice(42, [36,48,30], `Pisahkan 6×7 menjadi 6×5 + 6×2 = 30+12 = 42.`, `Hitung 6×7 dengan memecah 7 menjadi 5+2.`);
  if (stage === 5) return choice(a*b, [a+b,a*b-a,a*b+b], `Perkiraan dulu membantu memeriksa apakah jawaban masuk akal. Hasil tepatnya ${a*b}.`, `Tanpa menghitung panjang: ${a} kelompok berisi ${b}. Pilih hasil yang masuk akal.`);
  if (stage === 6) return choice(6, [4,5,8], `Tiga pilihan topi × dua pilihan tas = enam pasangan.`, `Ada 3 topi dan 2 tas. Berapa pasangan berbeda?`);
  if (stage === 7) return choice('Keduanya sama', ['Kiri lebih besar','Kanan lebih besar','Tidak bisa diketahui'], `Perkalian bisa dikelompokkan ulang tanpa mengubah hasil: (${a}×${b})×2 = ${a}×(${b}×2).`, `Mana yang lebih besar: (${a}×${b})×2 atau ${a}×(${b}×2)?`);
  if (stage === 8) return choice(a*b, [a*b+1,a*b-a,a+b], `Cara cek: hasil dibagi ${a} harus sama dengan ${b}.`, `Seseorang bilang ${a}×${b}=${a*b+1}. Apa hasil yang benar?`);
  return choice(a+b, [a+b-1,a+b+1,a*b], `Pola aturan: tambah ${b}. Menjelaskan aturan adalah bagian dari jawaban.`, `Angka pertama ${a}; tiap langkah tambah ${b}. Berapa angka ketiga?`);
}
export function getStageQuestions(world, stage) { return Array.from({ length: 5 }, (_, i) => makeQuestion(world, stage, i + 1)); }
