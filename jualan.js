const GAS_URL = CONFIG.GAS_URL;
let lapakDipilih = null, jadwalDipilih = null, infoJadwalDipilih = null;
let menuParsedGlobal = [];

// Fungsi Toast Notification halus di pojok kanan bawah
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  const bgColors = type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-rose-600 text-white border-rose-500';
  const icon = type === 'success' ? '✨' : '⚠️';
  
  toast.className = `pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold transition-all duration-300 translate-y-2 opacity-0 ${bgColors}`;
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function gantiTab(tab) {
  if (tab === 'pesan') {
    document.getElementById('sectionPesan').classList.remove('hidden');
    document.getElementById('sectionDaftar').classList.add('hidden');
    document.getElementById('tabPesan').className = 'flex-1 bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition';
    document.getElementById('tabDaftar').className = 'flex-1 bg-transparent text-slate-600 font-bold text-xs py-2.5 rounded-xl transition';
  } else {
    document.getElementById('sectionPesan').classList.add('hidden');
    document.getElementById('sectionDaftar').classList.remove('hidden');
    document.getElementById('tabDaftar').className = 'flex-1 bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition';
    document.getElementById('tabPesan').className = 'flex-1 bg-transparent text-slate-600 font-bold text-xs py-2.5 rounded-xl transition';
  }
}

function updateCounters() {
  const katCards = document.querySelectorAll('.kategori-card');
  document.getElementById('counterKategori').innerText = `${katCards.length}/6 Kategori`;
  if (katCards.length >= 6) {
    document.getElementById('btnTambahKat').classList.add('hidden');
  } else {
    document.getElementById('btnTambahKat').classList.remove('hidden');
  }
  katCards.forEach(card => {
    const btnHapusKat = card.querySelector('.btn-hapus-kat');
    if (katCards.length > 1) btnHapusKat.classList.remove('hidden');
    else btnHapusKat.classList.add('hidden');
  });
}

function tambahKategori() {
  const container = document.getElementById('containerKategori');
  if (container.querySelectorAll('.kategori-card').length >= 6) return showToast('Maksimal 6 kategori!', 'error');

  const div = document.createElement('div');
  div.className = 'kategori-card bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2';
  div.innerHTML = `
    <div class="flex gap-2 items-center">
      <input type="text" placeholder="Nama Kategori" class="w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-blue-700 kategori-nama">
      <button type="button" onclick="hapusKategori(this)" class="bg-rose-50 text-rose-600 font-bold text-xs p-2.5 rounded-xl border border-rose-200 btn-hapus-kat">✕</button>
    </div>
    <div class="space-y-2 container-menu-item pl-2 border-l-2 border-blue-200">
      <div class="flex gap-2 menu-row items-center">
        <div class="w-3/5 space-y-1">
          <input type="text" placeholder="Nama Menu" class="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs menu-nama">
          <input type="text" placeholder="Deskripsi singkat" class="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-lg text-[10px] text-slate-500 menu-deskripsi">
        </div>
        <input type="number" placeholder="Harga (Rp)" class="w-2/5 p-2 border border-slate-200 bg-white rounded-lg text-xs menu-harga self-start">
        <button type="button" onclick="hapusMenuRow(this)" class="bg-rose-50 text-rose-600 font-bold text-[10px] p-2 rounded-lg border border-rose-200 self-start">✕</button>
      </div>
    </div>
    <button type="button" onclick="tambahBarisMenu(this)" class="w-full bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold py-1.5 px-3 rounded-lg transition border border-slate-200 shadow-2xs">
      + Tambah Menu di Kategori Ini
    </button>
  `;
  container.appendChild(div);
  updateCounters();
}

function hapusKategori(btn) {
  btn.closest('.kategori-card').remove();
  updateCounters();
}

function tambahBarisMenu(btn) {
  const containerCard = btn.closest('.kategori-card');
  const menuContainer = containerCard.querySelector('.container-menu-item');
  
  let totalMenu = 0;
  document.querySelectorAll('.menu-row').forEach(() => totalMenu++);
  if (totalMenu >= 30) return showToast('Maksimal total 30 menu!', 'error');

  const div = document.createElement('div');
  div.className = 'flex gap-2 menu-row items-center';
  div.innerHTML = `
    <div class="w-3/5 space-y-1">
      <input type="text" placeholder="Nama Menu" class="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs menu-nama">
      <input type="text" placeholder="Deskripsi singkat" class="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-lg text-[10px] text-slate-500 menu-deskripsi">
    </div>
    <input type="number" placeholder="Harga (Rp)" class="w-2/5 p-2 border border-slate-200 bg-white rounded-lg text-xs menu-harga self-start">
    <button type="button" onclick="hapusMenuRow(this)" class="bg-rose-50 text-rose-600 font-bold text-[10px] p-2 rounded-lg border border-rose-200 self-start">✕</button>
  `;
  menuContainer.appendChild(div);
  updateCounters();
}

function hapusMenuRow(btn) {
  const menuRow = btn.closest('.menu-row');
  const containerCard = menuRow.closest('.kategori-card');
  if (containerCard.querySelectorAll('.menu-row').length <= 1) return showToast('Minimal 1 menu per kategori.', 'error');
  menuRow.remove();
  updateCounters();
}

async function loadDataJualanPage() {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    const container = document.getElementById('containerLapakPublik');
    container.innerHTML = '';
    
    const lapakDisetujui = (data.jualan || []).filter(l => l.status && l.status.toString().trim().toLowerCase().includes('disetujui'));

    if(lapakDisetujui.length === 0) {
      container.innerHTML = '<div class="text-center text-xs text-slate-400 py-8 bg-white rounded-2xl border border-slate-200">Belum ada lapak UMKM yang aktif saat ini.</div>';
      return;
    }

    const semuaPesanan = data.pesanan || [];

    lapakDisetujui.forEach(l => {
      const pesananLapak = semuaPesanan.filter(p => p.namaLapak && p.namaLapak.trim().toLowerCase() === l.namaPenjual.trim().toLowerCase());

      let listPesananHtml = '';
      if (pesananLapak.length === 0) {
        listPesananHtml = '<div class="text-[11px] text-slate-400 italic py-1 text-center">Belum ada pesanan di lapak ini.</div>';
      } else {
        pesananLapak.forEach((p, idx) => {
          const statusBadge = p.status && p.status.includes('Lunas') 
            ? '<span class="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-100">Lunas 🟢</span>' 
            : '<span class="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-100">Pending 🟡</span>';
          
          listItemsHtml += `
            <li class="py-1 px-2 rounded-lg bg-slate-50/80 border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <span class="font-bold text-slate-800">${idx + 1}. ${p.namaPemesan}</span>
                <span class="block text-[10px] text-slate-500 font-mono">${p.detailPesanan}</span>
              </div>
              <div>${statusBadge}</div>
            </li>`;
        });
      }

      container.innerHTML += `
        <div class="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
          <div>
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-sm text-slate-900">🛍️ ${l.namaPenjual}</h3>
              <span class="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-100">📍 ${l.jadwalId || 'Umum'}</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Jadwal: ${l.jadwalInfo || 'Menunggu Penugasan Admin'}</p>
            <div class="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line font-mono"><strong>Menu Tersedia:</strong><br>${l.menuJualan}</div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div class="bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 border-b border-slate-200 flex justify-between items-center">
              <span>📋 Daftar Pesanan Masuk</span>
              <span class="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">${pesananLapak.length} Pesanan</span>
            </div>
            <ul class="divide-y divide-slate-100 max-h-36 overflow-y-auto p-1.5 space-y-1">
              ${listPesananHtml}
            </ul>
          </div>

          <div class="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span class="text-[11px] text-slate-400 truncate max-w-[200px]">Email: ${l.emailPenjual || l.whatsapp || '-'}</span>
            <button onclick="bukaModalPesan('${l.namaPenjual}', '${l.jadwalId || 'UMUM'}', '${l.jadwalInfo || 'Mitra UMKM'}', \`${encodeURIComponent(l.menuJualan)}\`)" class="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs shrink-0">
              🛍️ Pesan Menu
            </button>
          </div>
        </div>`;
    });
  } catch (e) { console.error(e); }
}

function parseMenuText(rawMenuText) {
  const lines = rawMenuText.split('\n');
  let menus = [];
  let currentKategori = "Menu Utama";
  let globalIdx = 0;
  let lastMenuObj = null;

  lines.forEach((line) => {
    let trimLine = line.trim();
    if (!trimLine) return;

    if (trimLine.startsWith('📁')) {
      currentKategori = trimLine.replace('📁', '').trim();
      lastMenuObj = null;
      return;
    }

    if (trimLine.startsWith('└')) {
      if (lastMenuObj) lastMenuObj.deskripsi = trimLine.replace('└', '').trim();
      return;
    }

    let cleanLine = trimLine.replace(/^[•\-\*]\s*/, '').trim();
    let harga = 0, namaMenu = cleanLine;
    const matchRp = cleanLine.match(/\(Rp\s*([\d\.]+)\)/i) || cleanLine.match(/Rp\.?\s*([\d\.]+)/i);
    if (matchRp) {
      harga = parseInt(matchRp[1].replace(/\./g, '')) || 0;
      namaMenu = cleanLine.replace(matchRp[0], '').trim();
    }
    
    lastMenuObj = { id: globalIdx++, kategori: currentKategori, nama: namaMenu, harga: harga, deskripsi: '', qty: 0 };
    menus.push(lastMenuObj);
  });
  return menus;
}

function bukaModalPesan(namaLapak, jId, jInfo, menuEncoded) {
  lapakDipilih = namaLapak; jadwalDipilih = jId; infoJadwalDipilih = jInfo;
  document.getElementById('modalLapakTitle').innerText = `Pesan ke: ${namaLapak}`;
  document.getElementById('pesanNama').value = '';
  document.getElementById('pesanNote').value = '';

  menuParsedGlobal = parseMenuText(decodeURIComponent(menuEncoded));
  renderListMenuInteraktif();
  document.getElementById('modalPesan').classList.remove('hidden');
}

function renderListMenuInteraktif() {
  const container = document.getElementById('containerMenuInteraktif');
  container.innerHTML = '';
  if (menuParsedGlobal.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-400 text-center py-2">Tidak ada menu tersedia.</div>';
    return;
  }

  let grouped = {};
  menuParsedGlobal.forEach(m => {
    if (!grouped[m.kategori]) grouped[m.kategori] = [];
    grouped[m.kategori].push(m);
  });

  for (let kat in grouped) {
    let katHtml = `<div class="space-y-1.5"><div class="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">📁 ${kat}</div>`;
    grouped[kat].forEach(m => {
      const formatHrg = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(m.harga);
      katHtml += `
        <div class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs ml-2">
          <div class="pr-2">
            <div class="font-bold text-slate-800">${m.nama}</div>
            ${m.deskripsi ? `<div class="text-[10px] text-slate-400 italic">${m.deskripsi}</div>` : ''}
            <div class="text-[10px] text-blue-600 font-semibold mt-0.5">${formatHrg}</div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="ubahQty(${m.id}, -1)" class="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-slate-700 flex items-center justify-center">-</button>
            <span id="qty_${m.id}" class="font-bold w-4 text-center">${m.qty}</span>
            <button type="button" onclick="ubahQty(${m.id}, 1)" class="w-6 h-6 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-md font-bold flex items-center justify-center">+</button>
          </div>
        </div>`;
    });
    katHtml += `</div>`;
    container.innerHTML += katHtml;
  }
  hitungTotalOtomatis();
}

function ubahQty(id, delta) {
  const item = menuParsedGlobal.find(m => m.id === id);
  if (item) {
    item.qty = Math.max(0, item.qty + delta);
    document.getElementById(`qty_${id}`).innerText = item.qty;
    hitungTotalOtomatis();
  }
}

function hitungTotalOtomatis() {
  let total = 0;
  menuParsedGlobal.forEach(m => { total += (m.harga * m.qty); });
  const formatRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total);
  document.getElementById('labelTotalHarga').innerText = formatRp;
  document.getElementById('labelTotalHarga').setAttribute('data-raw', total);
}

function tutupModalPesan() { 
  document.getElementById('modalPesan').classList.add('hidden'); 
}

async function kirimPesanan() {
  const nama = document.getElementById('pesanNama').value.trim();
  const note = document.getElementById('pesanNote').value.trim();
  const totalHargaRaw = parseInt(document.getElementById('labelTotalHarga').getAttribute('data-raw')) || 0;

  if (!nama) return showToast('Nama pemesan harus diisi!', 'error');
  if (totalHargaRaw <= 0) return showToast('Pilih minimal 1 menu!', 'error');

  let detailRincian = [];
  menuParsedGlobal.forEach(m => { if (m.qty > 0) detailRincian.push(`${m.nama} (${m.qty}x)`); });
  
  let detailString = detailRincian.join(', ');
  if (note) {
    detailString += ` | Note: "${note}"`;
  }

  const btn = document.getElementById('btnKirimPesan');
  btn.innerText = 'Memproses...';
  btn.disabled = true;

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'register_pesanan', 
        namaPemesan: nama, 
        namaLapak: lapakDipilih, 
        detailPesanan: detailString, 
        totalHarga: totalHargaRaw, 
        jadwalId: jadwalDipilih, 
        jadwalInfo: infoJadwalDipilih 
      })
    });
    
    const result = await response.json();
    tutupModalPesan();

    try {
      if (typeof kirimTelegramJualan === 'function') {
        await kirimTelegramJualan(nama, lapakDipilih, infoJadwalDipilih, detailString, (result ? result.totalTagihan : totalHargaRaw));
      }
    } catch (errTelegram) { console.warn("Telegram warning:", errTelegram); }

    const finalTagihan = (result && result.totalTagihan) ? result.totalTagihan : totalHargaRaw;

    document.getElementById('invNamaLapak').innerText = `Lapak: ${lapakDipilih}`;
    document.getElementById('invNamaPemesan').innerText = nama;
    
    const formatJadwal = (infoJadwalDipilih || '-').replace(/\s*\|\s*/g, '\n• ');
    document.getElementById('invJadwal').innerText = formatJadwal.includes('• ') ? '• ' + formatJadwal : formatJadwal;

    document.getElementById('invDetailMenu').innerText = detailString;
    document.getElementById('invTotalTagihan').innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(finalTagihan);
    
    document.getElementById('modalInvoicePesanan').classList.remove('hidden');
    showToast('Pesanan berhasil dibuat!');
  } catch (e) { 
    showToast('Gagal mengirim pesanan.', 'error'); 
  } finally {
    btn.innerText = 'Pesan & Bayar';
    btn.disabled = false;
  }
}

function downloadResiGambar() {
  const btn = document.getElementById('btnDownloadImg');
  btn.innerText = 'Membuat Gambar...';
  btn.disabled = true;

  const element = document.getElementById('areaStrukResi');
  const pemesan = document.getElementById('invNamaPemesan').innerText;

  html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Resi-Pesanan-${pemesan.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    btn.innerText = '📥 Download Resi (Gambar PNG)';
    btn.disabled = false;
  });
}

function selesaiBayarPesanan() { 
  document.getElementById('modalInvoicePesanan').classList.add('hidden'); 
  window.location.reload(); 
}

async function daftarJualan() {
  const namaPenjual = document.getElementById('namaPenjual').value.trim();
  const emailPenjual = document.getElementById('emailPenjual').value.trim();
  if(!namaPenjual || !emailPenjual) return showToast('Nama brand dan Email Penjual harus diisi!', 'error');

  let hasilMenuGabung = [];
  let totalMenuCount = 0;

  const katCards = document.querySelectorAll('.kategori-card');
  for (let card of katCards) {
    const namaKat = card.querySelector('.kategori-nama').value.trim();
    if (!namaKat) return showToast('Nama kategori tidak boleh kosong!', 'error');

    hasilMenuGabung.push(`📁 ${namaKat}`);

    const menuRows = card.querySelectorAll('.menu-row');
    for (let row of menuRows) {
      const m = row.querySelector('.menu-nama').value.trim();
      const d = row.querySelector('.menu-deskripsi').value.trim();
      const h = row.querySelector('.menu-harga').value.trim();
      if (m && h) {
        hasilMenuGabung.push(`• ${m} (Rp ${parseInt(h).toLocaleString('id-ID')})`);
        if (d) hasilMenuGabung.push(`  └ ${d}`);
        totalMenuCount++;
      }
    }
  }

  if (totalMenuCount === 0) return showToast('Minimal masukkan 1 menu beserta harganya!', 'error');

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'register_jualan', namaPenjual, menuJualan: hasilMenuGabung.join('\n'), emailPenjual })
    });
    if ((await response.json()).status === 'success') {
      showToast('Pendaftaran mitra berhasil! Menunggu penugasan jadwal dari Admin.');
      gantiTab('pesan');
      loadDataJualanPage();
    }
  } catch (e) { 
    showToast('Gagal daftar lapak.', 'error'); 
  }
}

document.addEventListener('DOMContentLoaded', loadDataJualanPage);