/**
 * KONFIGURASI TELEGRAM NOTIFIKASI
 * Edit di sini jika ada perubahan Token atau Chat ID
 */
// --- 1. KONFIGURASI BOT TELEGRAM MABAR ---
var TELEGRAM_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA", // Ganti dengan Token Bot Telegram
  CHAT_ID: "-5327500047"       // Ganti dengan Chat ID Telegram/Grup
};

// --- 2. KONFIGURASI BOT TELEGRAM JAJANAAN UMKM ---
var TELEGRAM_JUALAN_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA", // Ganti dengan Token Bot Telegram
  CHAT_ID: "-5317879702"       // Ganti dengan Chat ID Telegram/Grup
};


// --- FUNGSI 1: KHUSUS KIRIM NOTIFIKASI MABAR ---
async function kirimTelegram(namaPemain, jadwalInfo, totalTagihan) {
  if (!TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID || TELEGRAM_CONFIG.BOT_TOKEN.includes("MASUKKAN")) {
    console.warn("Token atau Chat ID Telegram Mabar belum diatur.");
    return;
  }

  const formatHrg = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalTagihan);

  // Format pesan khusus Mabar
  const pesan = `🏸 *PENDAFTARAN MABAR BARU* 🏸\n\n` +
                `👤 *Nama Pemain:* ${namaPemain}\n` +
                `📅 *Jadwal:* ${jadwalInfo}\n` +
                `💰 *Total Tagihan:* ${formatHrg}\n` +
                `⏳ *Status:* Menunggu Konfirmasi Pembayaran\n\n` +
                `_Mohon lakukan transfer sesuai nominal termasuk 3 digit kode unik._`;

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: pesan,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram mabar:", error);
  }
}


// --- FUNGSI 2: KHUSUS KIRIM NOTIFIKASI JAJANAN UMKM ---
async function kirimTelegramJualan(namaPemesan, namaLapak, jadwalInfo, detailPesanan, totalTagihan) {
  if (!TELEGRAM_JUALAN_CONFIG.BOT_TOKEN || !TELEGRAM_JUALAN_CONFIG.CHAT_ID || TELEGRAM_JUALAN_CONFIG.BOT_TOKEN.includes("MASUKKAN")) {
    console.warn("Token atau Chat ID Telegram Jualan belum diatur.");
    return;
  }

  const formatHrg = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalTagihan);

  // Format pesan khusus Jajanan UMKM
  const pesan = `🛍️ *PESANAN JAJANAN MASUK* 🛍️\n\n` +
                `🏪 *Lapak:* ${namaLapak}\n` +
                `👤 *Pemesan:* ${namaPemesan}\n` +
                `📍 *Jadwal:* ${jadwalInfo}\n` +
                `📋 *Rincian Pesanan:* ${detailPesanan}\n` +
                `💰 *Total Tagihan:* ${formatHrg}\n` +
                `⏳ *Status:* Menunggu Konfirmasi Pembayaran\n\n` +
                `_Silakan cek bukti transfer dengan kode unik._`;

  const url = `https://api.telegram.org/bot${TELEGRAM_JUALAN_CONFIG.BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_JUALAN_CONFIG.CHAT_ID,
        text: pesan,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram jualan:", error);
  }
}