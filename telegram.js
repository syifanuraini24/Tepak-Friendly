/**
 * KONFIGURASI TELEGRAM NOTIFIKASI
 * Edit di sini jika ada perubahan Token atau Chat ID
 */
var TELEGRAM_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA",
  CHAT_ID: "-5327500047"
};

var TELEGRAM_JUALAN_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA",
  CHAT_ID: "-5317879702"
};

async function kirimTelegram(namaPemain, jadwalInfo, totalTagihan) {
  if (!TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID || TELEGRAM_CONFIG.BOT_TOKEN.includes("MASUKKAN")) {
    console.warn("Token atau Chat ID Telegram Mabar belum diatur.");
    return;
  }

  const formatHrg = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(totalTagihan) || 0);

  const pesan =
    `🏸 PENDAFTARAN MABAR BARU 🏸\n\n` +
    `👤 Nama Pemain: ${namaPemain}\n` +
    `📅 Jadwal: ${jadwalInfo}\n` +
    `💰 Total Tagihan: ${formatHrg}\n` +
    `⏳ Status: Menunggu Konfirmasi Pembayaran`;

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: pesan
      })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("Telegram API error:", data);
    }
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram mabar:", error);
  }
}

async function kirimTelegramJualan(namaPemesan, namaLapak, jadwalInfo, detailPesanan, totalTagihan) {
  if (!TELEGRAM_JUALAN_CONFIG.BOT_TOKEN || !TELEGRAM_JUALAN_CONFIG.CHAT_ID || TELEGRAM_JUALAN_CONFIG.BOT_TOKEN.includes("MASUKKAN")) {
    console.warn("Token atau Chat ID Telegram Jualan belum diatur.");
    return;
  }

  const formatHrg = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(totalTagihan) || 0);

  const pesan =
    `🛍️ PESANAN JAJANAN MASUK 🛍️\n\n` +
    `🏪 Lapak: ${namaLapak}\n` +
    `👤 Pemesan: ${namaPemesan}\n` +
    `📍 Jadwal: ${jadwalInfo}\n` +
    `📋 Rincian Pesanan: ${detailPesanan}\n` +
    `💰 Total Tagihan: ${formatHrg}\n` +
    `⏳ Status: Menunggu Konfirmasi Pembayaran`;

  const url = `https://api.telegram.org/bot${TELEGRAM_JUALAN_CONFIG.BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_JUALAN_CONFIG.CHAT_ID,
        text: pesan
      })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("Telegram Jualan API error:", data);
    }
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram jualan:", error);
  }
}