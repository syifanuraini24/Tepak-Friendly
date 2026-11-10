const GAS_URL = CONFIG.GAS_URL;
let cacheLapakData = [];
let cacheJadwalList = [];
let cacheSemuaPesanan = [];
let currentTabPesanan = 'aktif'; // 'aktif' atau 'history'

// Fungsi Toast Notification
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

document.addEventListener('DOMContentLoaded', () => {
  const isLogged = sessionStorage.getItem('admin_jualan_logged');
  if (isLogged === 'true') {
    bukaDashboardAdmin();
  }
});

async function loginAdminJualan() {
  const passwordInput = document.getElementById('passwordAdmin');
  const password = passwordInput ? passwordInput.value.trim() : '';
  if (!password) return showToast('Masukkan password terlebih dahulu!', 'error');
  
  const btn = document.getElementById('btnLogin');
  if (btn) {
    btn.innerText = 'Memeriksa...';
    btn.disabled = true;
  }

  try {
    const response = await fetch(GAS_URL, { 
      method: 'POST', 
      body: JSON.stringify({ action: 'login_admin_jualan', password }) 
    });
    const result = await response.json();
    if (result.status === 'success') {
      sessionStorage.setItem('admin_jualan_logged', 'true');
      bukaDashboardAdmin();
      showToast('Berhasil masuk ke Panel Admin!');
    } else { 
      showToast(result.message || 'Password salah!', 'error'); 
    }
  } catch (e) { 
    showToast('Gagal terhubung ke server.', 'error'); 
  } finally {
    if (btn) {
      btn.innerText = 'Masuk Panel Admin';
      btn.disabled = false;
    }
  }
}

function bukaDashboardAdmin() {
  document.getElementById('sectionLogin').classList.add('hidden');
  document.getElementById('sectionDashboard').classList.remove('hidden');
  document.getElementById('headerActions').classList.remove('hidden');
  document.getElementById('linkKembaliJualan').classList.add('hidden');
  loadDataAdminJualan();
}

function logoutAdmin() {
  sessionStorage.removeItem('admin_jualan_logged');
  document.getElementById('sectionDashboard').classList.add('hidden');
  document.getElementById('headerActions').classList.add('hidden');
  document.getElementById('linkKembaliJualan').classList.remove('hidden');
  document.getElementById('sectionLogin').classList.remove('hidden');
  const passEl = document.getElementById('passwordAdmin');
  if (passEl) passEl.value = '';
  showToast('Berhasil logout.');
}

async function refreshDataAdmin(btnElement) {
  const txt = document.getElementById('refreshText');
  if (txt) txt.innerText = 'Memuat...';
  if (btnElement) btnElement.disabled = true;

  await loadDataAdminJualan();

  if (txt) txt.innerText = 'Refresh';
  if (btnElement) btnElement.disabled = false;
  showToast('Data berhasil diperbarui!');
}

function gantiTabPesanan(tab) {
  currentTabPesanan = tab;
  const btnAktif = document.getElementById('tabPesananAktif');
  const btnHistory = document.getElementById('tabPesananHistory');
  const divAktif = document.getElementById('containerPesananAdmin');
  const divHistory = document.getElementById('containerHistoryAdmin');

  if (tab === 'aktif') {
    btnAktif.className = 'flex-1 bg-white text-slate-900 font-bold text-xs py-2 rounded-lg shadow-2xs transition';
    btnHistory.className = 'flex-1 bg-transparent text-slate-500 font-bold text-xs py-2 transition';
    divAktif.classList.remove('hidden');
    divHistory.classList.add('hidden');
  } else {
    btnHistory.className = 'flex-1 bg-white text-slate-900 font-bold text-xs py-2 rounded-lg shadow-2xs transition';
    btnAktif.className = 'flex-1 bg-transparent text-slate-500 font-bold text-xs py-2 transition';
    divHistory.classList.remove('hidden');
    divAktif.classList.add('hidden');
  }
  renderPesananUI();
}

async function loadDataAdminJualan() {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    cacheJadwalList = data.jadwal || [];
    cacheLapakData = data.jualan || [];
    cacheSemuaPesanan = data.pesanan || [];

    renderPesananUI();
    renderLapakAdminUI();
  } catch (e) { 
    console.error('Error loading data:', e); 
  }
}

function renderPesananUI() {
  const containerPesanan = document.getElementById('containerPesananAdmin');
  const containerHistory = document.getElementById('containerHistoryAdmin');

  // Ambil daftar ID jadwal aktif & nonaktif
  const idJadwalAktif = cacheJadwalList
    .filter(j => !j.status || !j.status.toString().toLowerCase().includes('nonaktif'))
    .map(j => String(j.id));

  // Pisahkan pesanan menjadi Aktif dan History
  const listPesananAktif = cacheSemuaPesanan.filter(p => {
    if (p.jadwalId && idJadwalAktif.includes(String(p.jadwalId))) return true;
    return !p.jadwalId;
  });

  const listPesananHistory = cacheSemuaPesanan.filter(p => {
    if (p.jadwalId && !idJadwalAktif.includes(String(p.jadwalId))) return true;
    return false;
  });

  document.getElementById('badgeTotalPesanan').innerText = `${currentTabPesanan === 'aktif' ? listPesananAktif.length : listPesananHistory.length} Pesanan`;

  // Render Tab Aktif
  renderGroupedPesanan(listPesananAktif, containerPesanan, 'Belum ada pesanan aktif dari jadwal berjalan.');
  // Render Tab History
  renderGroupedPesanan(listPesananHistory, containerHistory, 'Belum ada riwayat pesanan dari jadwal yang sudah selesai.');
}

function renderGroupedPesanan(pesananArrayData, containerTarget, emptyText) {
  containerTarget.innerHTML = '';

  if (pesananArrayData.length === 0) {
    containerTarget.innerHTML = `<div class="text-center text-xs text-slate-400 py-6 italic">${emptyText}</div>`;
    return;
  }

  let groupedPesanan = {};
  pesananArrayData.forEach(p => {
    let lapak = p.namaLapak || 'Lainnya';
    if (!groupedPesanan[lapak]) groupedPesanan[lapak] = [];
    groupedPesanan[lapak].push(p);
  });

  for (let lapak in groupedPesanan) {
    let pesananArray = groupedPesanan[lapak];
    let totalSemuaLapak = 0;
    let listItemsHtml = '';

    pesananArray.forEach(p => {
      totalSemuaLapak += (parseInt(p.totalTagihan) || 0);
      const statusStr = p.status ? p.status.toString().trim() : '';
      const isLunas = statusStr.toLowerCase().includes('lunas');
      const formatHrg = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.totalTagihan || 0);
      
      listItemsHtml += `
        <div class="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
          <div class="flex justify-between items-center">
            <span class="font-extrabold text-slate-900">👤 ${p.namaPemesan || '-'}</span>
            <span class="font-bold text-slate-700">${formatHrg}</span>
          </div>
          <div class="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border font-mono">${p.detailPesanan || '-'}</div>
          <div class="text-[10px] text-blue-600 font-medium">📍 Jadwal: ${p.jadwalInfo || p.jadwalId || '-'}</div>
          <div class="flex justify-between items-center pt-1">
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${isLunas ? 'bg-emerald-50 text-emerald-700 border' : 'bg-amber-50 text-amber-700 border'}">${p.status || 'Pending 🟡'}</span>
            <div class="flex gap-1">
              ${!isLunas ? `<button onclick="aksiKonfirmasiPesanan(${p.rowIndex}, 'acc')" class="bg-emerald-600 text-white font-bold text-[9px] px-2 py-1 rounded-md">ACC</button>` : ''}
              <button onclick="aksiKonfirmasiPesanan(${p.rowIndex}, 'hapus')" class="bg-rose-50 text-rose-600 border font-bold text-[9px] px-2 py-1 rounded-md">Hapus</button>
            </div>
          </div>
        </div>`;
    });

    const formatTotalSemua = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalSemuaLapak);
    const lapakEscaped = lapak.replace(/'/g, "\\'");

    containerTarget.innerHTML += `
      <div id="card-lapak-${encodeURIComponent(lapak)}" class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
        <div class="flex justify-between items-center border-b border-slate-200 pb-2 gap-2">
          <div class="min-w-0 flex-1">
            <span class="font-extrabold text-sm text-blue-700 block truncate">🛍️ ${lapak}</span>
            <span class="block text-[10px] text-slate-500">${pesananArray.length} Pesanan (Total: <strong>${formatTotalSemua}</strong>)</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="cetakSummaryLapak('${lapakEscaped}')" title="Print Rekap Pesanan" 
              class="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition flex items-center gap-1 shadow-2xs">
              🖨️ <span class="hidden sm:inline">Print</span>
            </button>
            <button onclick="kirimEmailCloseOrderLapak('${lapakEscaped}', this)" title="Close Order & Send Email" 
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition flex items-center gap-1 shadow-2xs">
              📧 <span class="hidden sm:inline">Close Order</span>
            </button>
          </div>
        </div>
        <div class="space-y-2">
          ${listItemsHtml}
        </div>
      </div>`;
  }
}

function renderLapakAdminUI() {
  const containerLapak = document.getElementById('containerLapakAdmin');
  containerLapak.innerHTML = '';

  if (cacheLapakData.length === 0) {
    containerLapak.innerHTML = '<div class="text-center text-xs text-slate-400 py-4 italic">Belum ada pendaftaran mitra.</div>';
    return;
  }

  cacheLapakData.forEach((l, idx) => {
    const isDisetujui = l.status && l.status.toLowerCase().includes('disetujui');
    const assignedIds = (l.jadwalId || '').toString().split(',').map(s => s.trim());

    let checkboxHtml = '';
    if (cacheJadwalList.length === 0) {
      checkboxHtml = '<span class="text-[10px] text-slate-400 italic">Belum ada jadwal mabar dibuat.</span>';
    } else {
      cacheJadwalList.forEach(j => {
        const isChecked = assignedIds.includes(String(j.id)) ? 'checked' : '';
        const isNonaktif = j.status && j.status.toString().toLowerCase().includes('nonaktif');

        checkboxHtml += `
          <label class="flex items-center gap-2 text-xs py-1 px-2 rounded-lg ${isNonaktif ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75' : 'hover:bg-slate-50 cursor-pointer'}">
            <input type="checkbox" value="${j.id}" ${isChecked} ${isNonaktif ? 'disabled' : ''} class="checkbox-jadwal-${l.rowIndex} rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5">
            <span class="${isNonaktif ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}"><strong>[${j.id}]</strong> ${j.info} (${j.jam}) ${isNonaktif ? ' - (Nonaktif 🔴)' : ''}</span>
          </label>`;
      });
    }

    const menuTextSafe = (l.menuJualan !== null && l.menuJualan !== undefined) ? String(l.menuJualan) : '';

    containerLapak.innerHTML += `
      <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5">
        <div class="flex justify-between items-start">
          <div>
            <span class="font-bold text-slate-900 text-sm">🛍️ ${l.namaPenjual || 'Mitra'}</span>
            <span class="block text-[10px] text-slate-500">Email: ${l.emailPenjual || l.whatsapp || '-'}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isDisetujui ? 'bg-emerald-50 text-emerald-700 border' : 'bg-blue-50 text-blue-700 border'}">${l.status || 'Pending'}</span>
        </div>

        <div class="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
          <span class="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">Assign ke Jadwal Mabar (Bisa Pilih Banyak):</span>
          <div class="max-h-36 overflow-y-auto space-y-0.5 pr-1 border border-slate-100 rounded-lg p-1 bg-slate-50/50">
            ${checkboxHtml}
          </div>
          <button onclick="simpanAssignMultipleJadwal(${l.rowIndex}, this)" class="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-2 rounded-lg transition shadow-2xs">Simpan Pilihan Jadwal</button>
        </div>

        <div class="text-[11px] text-slate-600 bg-white p-2 rounded-lg border whitespace-pre-line font-mono max-h-28 overflow-y-auto">${menuTextSafe || 'Belum ada menu.'}</div>
        
        <div class="flex gap-2 pt-1 border-t border-slate-200">
          ${!isDisetujui ? `<button onclick="aksiAccLapak(${l.rowIndex}, this)" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 rounded-lg transition">ACC Mitra 🟢</button>` : ''}
          <button onclick="bukaModalEditIndex(${idx})" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] py-2 rounded-lg">Edit Menu</button>
          <button onclick="aksiKonfirmasiJualan(${l.rowIndex})" class="bg-rose-50 text-rose-600 border font-bold text-[10px] px-3 py-2 rounded-lg">Hapus</button>
        </div>
      </div>`;
  });
}

// 1. Cetak Ringkasan Khusus 1 Lapak
function cetakSummaryLapak(namaLapak) {
  const lapakCard = document.getElementById(`card-lapak-${encodeURIComponent(namaLapak)}`);
  if (!lapakCard) return showToast('Data lapak tidak ditemukan!', 'error');

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  const tgl = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const cloneCard = lapakCard.cloneNode(true);
  const btns = cloneCard.querySelectorAll('button');
  btns.forEach(b => b.remove());

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Summary Order - ${namaLapak}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p { font-size: 12px; color: #666; margin-top: 0; }
        .bg-slate-50 { border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
        .font-extrabold { font-weight: bold; }
        .text-blue-700 { color: #1d4ed8; font-size: 16px; }
        .bg-white { border: 1px solid #eee; padding: 8px 12px; margin-top: 8px; border-radius: 6px; }
        .font-mono { font-family: monospace; background: #f8fafc; padding: 4px; border-radius: 4px; }
        span.px-2 { display: none !important; }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <h1>📋 Rekap Pesanan (Close Order)</h1>
      <p>Lapak: <strong>${namaLapak}</strong> | Tanggal: ${tgl}</p>
      <hr style="margin-bottom: 15px; border: 0.5px solid #ccc;"/>
      ${cloneCard.innerHTML}
      <br/>
      <button class="no-print" onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #1d4ed8; color: white; border: none; border-radius: 8px; cursor: pointer;">Print / Simpan PDF</button>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 2. Kirim Email Close Order Khusus 1 Lapak
async function kirimEmailCloseOrderLapak(namaLapak, btnElement) {
  if (!confirm(`Kirim email rekap pesanan ke penjual ${namaLapak}?`)) return;

  const originalText = btnElement.innerText;
  btnElement.innerText = 'Sending...';
  btnElement.disabled = true;

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'close_order_single_lapak', namaLapak })
    });
    const result = await response.json();
    if (result.status === 'success') {
      showToast(result.message || `Berhasil mengirim email ke ${namaLapak}!`);
    } else {
      throw new Error(result.message || 'Gagal mengirim email');
    }
  } catch (e) {
    showToast('Gagal kirim email: ' + e.message, 'error');
  } finally {
    btnElement.innerText = originalText;
    btnElement.disabled = false;
  }
}

async function simpanAssignMultipleJadwal(rowIndex, btnElement) {
  const checkboxes = document.querySelectorAll(`.checkbox-jadwal-${rowIndex}:checked`);
  let selectedIds = [];
  let selectedInfos = [];

  checkboxes.forEach(cb => {
    const jId = cb.value;
    selectedIds.push(jId);
    const matched = cacheJadwalList.find(j => String(j.id) === String(jId));
    if (matched) {
      selectedInfos.push(`${matched.id}\n${matched.info} (${matched.jam})`);
    } else {
      selectedInfos.push(jId);
    }
  });

  if (selectedIds.length === 0) {
    return showToast('Pilih minimal 1 jadwal mabar!', 'error');
  }

  const originalText = btnElement.innerText;
  btnElement.innerText = 'Menyimpan...';
  btnElement.disabled = true;

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_jualan_status_with_jadwal',
        rowIndex: parseInt(rowIndex),
        jadwalId: selectedIds,
        jadwalInfo: selectedInfos
      })
    });
    const result = await response.json();
    if (result.status === 'success') {
      showToast('Berhasil memperbarui jadwal assign!');
      loadDataAdminJualan();
    } else {
      throw new Error(result.message || 'Gagal menyimpan');
    }
  } catch (e) {
    showToast('Gagal menyimpan jadwal: ' + e.message, 'error');
  } finally {
    btnElement.innerText = originalText;
    btnElement.disabled = false;
  }
}

async function aksiAccLapak(rowIndex, btnElement) {
  if (btnElement) {
    btnElement.innerText = 'Memproses...';
    btnElement.disabled = true;
  }
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update_jualan_status', rowIndex, status: 'Disetujui 🟢' })
    });
    await loadDataAdminJualan();
    showToast('Mitra berhasil di-ACC!');
  } catch (e) { 
    showToast('Gagal ACC lapak.', 'error'); 
    if (btnElement) {
      btnElement.innerText = 'ACC Mitra 🟢';
      btnElement.disabled = false;
    }
  }
}

function aksiKonfirmasiPesanan(rowIndex, tipe) {
  const modal = document.getElementById('modalKonfirmasi');
  document.getElementById('konfirmasiTitle').innerText = tipe === 'acc' ? 'ACC Pembayaran Lunas?' : 'Hapus Pesanan?';
  document.getElementById('btnKonfirmasiYa').onclick = async function() {
    tutupModalKonfirmasi();
    await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: tipe === 'acc' ? 'update_pesanan_status' : 'delete_pesanan', rowIndex }) });
    loadDataAdminJualan();
    showToast('Aksi pesanan berhasil disimpan!');
  };
  modal.classList.remove('hidden');
}

function aksiKonfirmasiJualan(rowIndex) {
  const modal = document.getElementById('modalKonfirmasi');
  document.getElementById('konfirmasiTitle').innerText = 'Hapus Lapak Mitra?';
  document.getElementById('btnKonfirmasiYa').onclick = async function() {
    tutupModalKonfirmasi();
    await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'delete_jualan', rowIndex }) });
    loadDataAdminJualan();
    showToast('Lapak mitra berhasil dihapus.');
  };
  modal.classList.remove('hidden');
}

function tutupModalKonfirmasi() { 
  document.getElementById('modalKonfirmasi').classList.add('hidden'); 
}

function bukaModalEditIndex(arrayIndex) {
  const l = cacheLapakData[arrayIndex];
  if (!l) return;
  document.getElementById('editRowIndex').value = l.rowIndex;
  document.getElementById('editNamaPenjual').value = l.namaPenjual || '';
  document.getElementById('editEmailPenjual').value = l.emailPenjual || l.whatsapp || '';
  buildEditFormFromText(l.menuJualan);
  document.getElementById('modalEditLapak').classList.remove('hidden');
}

function buildEditFormFromText(rawText) {
  const container = document.getElementById('editContainerKategori');
  container.innerHTML = '';

  const text = (rawText !== null && rawText !== undefined) ? String(rawText) : "";
  const lines = text.split('\n');
  
  let categories = [];
  let currentCat = { nama: "Menu Utama", items: [] };
  let lastItem = null;

  lines.forEach(line => {
    let trim = line.trim();
    if (!trim) return;
    
    if (trim.startsWith('📁')) {
      if (currentCat.items.length > 0 || currentCat.nama !== "Menu Utama") {
        categories.push(currentCat);
      }
      currentCat = { nama: trim.replace('📁', '').trim(), items: [] };
      lastItem = null;
    } else if (trim.startsWith('└')) {
      if (lastItem) lastItem.deskripsi = trim.replace('└', '').trim();
    } else {
      let clean = trim.replace(/^[•\-\*]\s*/, '').trim();
      let harga = 0, namaMenu = clean;
      const matchRp = clean.match(/\(Rp\s*([\d\.]+)\)/i) || clean.match(/Rp\.?\s*([\d\.]+)/i);
      if (matchRp) {
        harga = parseInt(matchRp[1].replace(/\./g, '')) || 0;
        namaMenu = clean.replace(matchRp[0], '').trim();
      }
      lastItem = { nama: namaMenu, harga: harga, deskripsi: '' };
      currentCat.items.push(lastItem);
    }
  });

  if (currentCat.items.length > 0 || currentCat.nama !== "Menu Utama" || categories.length === 0) {
    categories.push(currentCat);
  }

  categories.forEach(cat => editTambahKategori(cat.nama, cat.items));
  updateEditCounters();
}

function updateEditCounters() {
  const katCards = document.querySelectorAll('#editContainerKategori .edit-kategori-card');
  const counterEl = document.getElementById('editCounterKategori');
  const btnTambahEl = document.getElementById('editBtnTambahKat');
  
  if (counterEl) counterEl.innerText = `${katCards.length}/6 Kategori`;
  if (btnTambahEl) btnTambahEl.classList.toggle('hidden', katCards.length >= 6);
  
  katCards.forEach(card => {
    const btnHapus = card.querySelector('.edit-btn-hapus-kat');
    if (btnHapus) btnHapus.classList.toggle('hidden', katCards.length <= 1);
  });
}

function editTambahKategori(namaKat = '', items = [{ nama: '', harga: '', deskripsi: '' }]) {
  const container = document.getElementById('editContainerKategori');
  if (container.querySelectorAll('.edit-kategori-card').length >= 6) return showToast('Maksimal 6 kategori!', 'error');

  const div = document.createElement('div');
  div.className = 'edit-kategori-card bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2';
  
  let itemsHtml = '';
  const itemList = (Array.isArray(items) && items.length > 0) ? items : [{ nama: '', harga: '', deskripsi: '' }];
  
  itemList.forEach(item => {
    itemsHtml += `
      <div class="flex gap-2 edit-menu-row items-center">
        <div class="w-3/5 space-y-1">
          <input type="text" placeholder="Nama Menu" value="${item.nama || ''}" class="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs edit-menu-nama">
          <input type="text" placeholder="Deskripsi" value="${item.deskripsi || ''}" class="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-lg text-[10px] text-slate-500 edit-menu-deskripsi">
        </div>
        <input type="number" placeholder="Harga" value="${item.harga || ''}" class="w-2/5 p-2 border border-slate-200 bg-white rounded-lg text-xs edit-menu-harga self-start">
        <button type="button" onclick="this.closest('.edit-menu-row').remove(); updateEditCounters();" class="bg-rose-50 text-rose-600 font-bold text-[10px] p-2 rounded-lg border self-start">✕</button>
      </div>`;
  });

  div.innerHTML = `
    <div class="flex gap-2 items-center">
      <input type="text" placeholder="Nama Kategori" value="${namaKat}" class="w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-blue-700 edit-kategori-nama">
      <button type="button" onclick="this.closest('.edit-kategori-card').remove(); updateEditCounters();" class="bg-rose-50 text-rose-600 font-bold text-xs p-2.5 rounded-xl border edit-btn-hapus-kat">✕</button>
    </div>
    <div class="space-y-1.5 edit-container-menu-item pl-2 border-l-2 border-blue-200">${itemsHtml}</div>
    <button type="button" onclick="editTambahBarisMenu(this)" class="w-full bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold py-1.5 px-3 rounded-lg transition border shadow-2xs">+ Tambah Menu</button>
  `;
  container.appendChild(div);
  updateEditCounters();
}

function editTambahBarisMenu(btn) {
  const menuContainer = btn.closest('.edit-kategori-card').querySelector('.edit-container-menu-item');
  const div = document.createElement('div');
  div.className = 'flex gap-2 edit-menu-row items-center';
  div.innerHTML = `
    <div class="w-3/5 space-y-1">
      <input type="text" placeholder="Nama Menu" class="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs edit-menu-nama">
      <input type="text" placeholder="Deskripsi" class="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-lg text-[10px] text-slate-500 edit-menu-deskripsi">
    </div>
    <input type="number" placeholder="Harga" class="w-2/5 p-2 border border-slate-200 bg-white rounded-lg text-xs edit-menu-harga self-start">
    <button type="button" onclick="this.closest('.edit-menu-row').remove(); updateEditCounters();" class="bg-rose-50 text-rose-600 font-bold text-[10px] p-2 rounded-lg border self-start">✕</button>
  `;
  menuContainer.appendChild(div);
  updateEditCounters();
}

function tutupModalEdit() { 
  document.getElementById('modalEditLapak').classList.add('hidden'); 
}

async function simpanEditLapak() {
  const rowIndex = document.getElementById('editRowIndex').value;
  nowrowIndex = parseInt(rowIndex);
  const namaPenjual = document.getElementById('editNamaPenjual').value.trim();
  const emailPenjual = document.getElementById('editEmailPenjual').value.trim();
  if (!namaPenjual || !emailPenjual) return showToast('Nama dan Email wajib diisi!', 'error');

  let hasilMenuGabung = [];
  const katCards = document.querySelectorAll('#editContainerKategori .edit-kategori-card');
  for (let card of katCards) {
    const namaKat = card.querySelector('.edit-kategori-nama').value.trim();
    if (namaKat) hasilMenuGabung.push(`📁 ${namaKat}`);
    card.querySelectorAll('.edit-menu-row').forEach(row => {
      const m = row.querySelector('.edit-menu-nama').value.trim();
      const d = row.querySelector('.edit-menu-deskripsi').value.trim();
      const h = row.querySelector('.edit-menu-harga').value.trim();
      if (m && h) {
        hasilMenuGabung.push(`• ${m} (Rp ${parseInt(h).toLocaleString('id-ID')})`);
        if (d) hasilMenuGabung.push(`   └ ${d}`);
      }
    });
  }

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'edit_jualan', rowIndex, namaPenjual, emailPenjual, menuJualan: hasilMenuGabung.join('\n') })
    });
    tutupModalEdit();
    refreshDataAdmin();
    showToast('Perubahan menu berhasil disimpan!');
  } catch (e) { 
    showToast('Gagal menyimpan perubahan.', 'error'); 
  }
}