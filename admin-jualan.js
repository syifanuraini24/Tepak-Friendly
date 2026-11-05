const GAS_URL = CONFIG.GAS_URL;
let masterJadwalList = [];
let masterJualanList = [];

async function loadAdminJualanData() {
  const container = document.getElementById('containerAdminJualan');
  container.innerHTML = '<div class="text-center text-slate-400 text-xs py-8 bg-white rounded-2xl border border-slate-200">Memuat data pendaftaran mitra...</div>';

  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    masterJadwalList = data.jadwal || [];
    masterJualanList = data.jualan || [];

    // Hitung Stat Pending & Approved
    let countPending = 0, countApproved = 0;
    masterJualanList.forEach(item => {
      if (item.status && item.status.toString().toLowerCase().includes('disetujui')) {
        countApproved++;
      } else {
        countPending++;
      }
    });

    document.getElementById('statPending').innerText = countPending;
    document.getElementById('statApproved').innerText = countApproved;

    renderAdminJualanList();
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="text-center text-rose-500 text-xs py-8 bg-white rounded-2xl border border-rose-200">Gagal memuat data dari server.</div>';
  }
}

function renderAdminJualanList() {
  const container = document.getElementById('containerAdminJualan');
  container.innerHTML = '';

  if (masterJualanList.length === 0) {
    container.innerHTML = '<div class="text-center text-slate-400 text-xs py-8 bg-white rounded-2xl border border-slate-200">Belum ada pendaftaran mitra UMKM.</div>';
    return;
  }

  masterJualanList.forEach((j) => {
    const isDisetujui = j.status && j.status.toString().toLowerCase().includes('disetujui');
    const badgeStatus = isDisetujui 
      ? '<span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Disetujui 🟢</span>'
      : '<span class="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">Pending 🟡</span>';

    // Parse Jadwal ID Terpilih (Support Array / String Gabungan Koma)
    let selectedJadwalIds = [];
    if (j.jadwalId && j.jadwalId !== 'PENDING') {
      selectedJadwalIds = j.jadwalId.toString().split(',').map(id => id.trim());
    }

    // Generate Checkbox List Jadwal Mabar
    let checkboxJadwalHtml = '';
    if (masterJadwalList.length === 0) {
      checkboxJadwalHtml = '<div class="text-slate-400 text-[11px] italic">Tidak ada master jadwal mabar aktif.</div>';
    } else {
      masterJadwalList.forEach((m) => {
        const isChecked = selectedJadwalIds.includes(m.id.toString()) ? 'checked' : '';
        checkboxJadwalHtml += `
          <label class="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition text-xs">
            <input type="checkbox" name="jadwal_check_${j.rowIndex}" value="${m.id}" data-info="${m.info} (${m.jam})" ${isChecked} class="mt-0.5 accent-blue-600 rounded">
            <span class="leading-snug text-slate-700">
              <strong class="text-slate-900">[${m.id}]</strong> ${m.info} (${m.jam})
            </span>
          </label>
        `;
      });
    }

    // Render Card Item Admin
    const cardHtml = `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        
        <!-- Header Penjual & Status -->
        <div class="flex justify-between items-start gap-2">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              🛍️ ${j.namaPenjual}
            </h3>
            <p class="text-[11px] text-slate-500 font-mono mt-0.5">📱 WA: ${j.whatsapp}</p>
          </div>
          <div>${badgeStatus}</div>
        </div>

        <!-- Box Penugasan Jadwal Mabar -->
        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Assign ke Jadwal Mabar:</span>
          <div class="space-y-1.5 max-h-40 overflow-y-auto">
            ${checkboxJadwalHtml}
          </div>
          <button onclick="simpanPilihanJadwal(${j.rowIndex})" class="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition shadow-xs">
            💾 Simpan Pilihan Jadwal
          </button>
        </div>

        <!-- Accordion Rincian Menu Jualan -->
        <details class="bg-slate-50 rounded-xl border border-slate-200 text-xs group">
          <summary class="font-bold text-slate-700 p-2.5 cursor-pointer flex justify-between items-center select-none">
            <span>📜 Lihat Rincian Menu Jualan</span>
            <span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div class="p-3 pt-0 border-t border-slate-200/60 font-mono text-[11px] text-slate-600 whitespace-pre-line bg-white rounded-b-xl max-h-36 overflow-y-auto">
            ${j.menuJualan || 'Tidak ada rincian menu.'}
          </div>
        </details>

        <!-- Tombol Aksi Hapus -->
        <div class="flex justify-end gap-2 pt-1 border-t border-slate-100">
          <button onclick="hapusMitraJualan(${j.rowIndex})" class="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-2 px-4 rounded-xl border border-rose-200 transition">
            🗑️ Hapus Mitra
          </button>
        </div>

      </div>
    `;

    container.innerHTML += cardHtml;
  });
}

async function simpanPilihanJadwal(rowIndex) {
  const checkboxes = document.querySelectorAll(`input[name="jadwal_check_${rowIndex}"]:checked`);
  
  if (checkboxes.length === 0) {
    return alert('Pilih minimal 1 jadwal mabar untuk disetujui!');
  }

  let selectedIds = [];
  let selectedInfos = [];

  checkboxes.forEach(cb => {
    selectedIds.push(cb.value);
    selectedInfos.push(cb.getAttribute('data-info'));
  });

  const btn = event.target;
  btn.innerText = 'Menyimpan...';
  btn.disabled = true;

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_jualan_status_with_jadwal',
        rowIndex: rowIndex,
        jadwalId: selectedIds,
        jadwalInfo: selectedInfos
      })
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert('Pilihan jadwal berhasil disimpan & Mitra telah Disetujui!');
      loadAdminJualanData();
    } else {
      alert('Gagal menyimpan: ' + (result.message || 'Terjadi kesalahan.'));
    }
  } catch (err) {
    alert('Gagal terhubung ke server.');
  } finally {
    btn.innerText = '💾 Simpan Pilihan Jadwal';
    btn.disabled = false;
  }
}

async function hapusMitraJualan(rowIndex) {
  if (!confirm('Apakah kamu yakin ingin menghapus data mitra ini?')) return;

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete_jualan',
        rowIndex: rowIndex
      })
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert('Data mitra berhasil dihapus!');
      loadAdminJualanData();
    }
  } catch (err) {
    alert('Gagal menghapus data mitra.');
  }
}

document.addEventListener('DOMContentLoaded', loadAdminJualanData);