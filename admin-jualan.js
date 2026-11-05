async function loadDataAdminJualan() {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    cacheJadwalList = data.jadwal || [];
    cacheLapakData = data.jualan || [];

    // 1. Render Pesanan Dikelompokkan Per Lapak
    const containerPesanan = document.getElementById('containerPesananAdmin');
    const listPesanan = data.pesanan || [];
    containerPesanan.innerHTML = '';
    document.getElementById('badgeTotalPesanan').innerText = `${listPesanan.length} Pesanan`;

    if (listPesanan.length === 0) {
      containerPesanan.innerHTML = '<div class="text-center text-xs text-slate-400 py-4 italic">Belum ada pesanan masuk.</div>';
    } else {
      let groupedPesanan = {};
      listPesanan.forEach(p => {
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

        containerPesanan.innerHTML += `
          <div id="card-lapak-${encodeURIComponent(lapak)}" class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <!-- HEADER LAPAK + TOMBOL SAMPING -->
            <div class="flex justify-between items-center border-b border-slate-200 pb-2 gap-2">
              <div class="min-w-0 flex-1">
                <span class="font-extrabold text-sm text-blue-700 block truncate">🛍️ ${lapak}</span>
                <span class="block text-[10px] text-slate-500">${pesananArray.length} Pesanan (Total: <strong>${formatTotalSemua}</strong>)</span>
              </div>
              
              <!-- TOMBOL PRINT & CLOSE ORDER DI SEBELAH NAMA LAPAK -->
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

    // 2. Render Lapak Mitra
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
          checkboxHtml += `
            <label class="flex items-center gap-2 text-xs py-1 px-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" value="${j.id}" ${isChecked} class="checkbox-jadwal-${l.rowIndex} rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5">
              <span class="text-slate-700 font-medium"><strong>[${j.id}]</strong> ${j.info} (${j.jam})</span>
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
  } catch (e) { 
    console.error('Error loading data:', e); 
  }
}

// 1. Cetak Ringkasan Khusus 1 Lapak
function cetakSummaryLapak(namaLapak) {
  const lapakCard = document.getElementById(`card-lapak-${encodeURIComponent(namaLapak)}`);
  if (!lapakCard) return showToast('Data lapak tidak ditemukan!', 'error');

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  const tgl = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Clone elemen untuk membuang tombol cetak saat diprint
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