// Konfigurasi Bot Telegram Khusus Jualan
  var TELEGRAM_JUALAN_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA", // Ganti dengan Token Bot Telegram
  CHAT_ID: "-5317879702"       // Ganti dengan Chat ID Telegram/Grup
};
async function kirimTelegramJualan(namaPemesan, namaLapak, jadwalInfo, detailPesanan, totalTagihan) {
  if (!TELEGRAM_JUALAN_CONFIG.BOT_TOKEN || TELEGRAM_JUALAN_CONFIG.BOT_TOKEN.includes("MASUKKAN")) return;
  
  const pesan = `🛒 <b>PESANAN JAJANAN MASUK!</b>\n\n` +
                `👤 Pemesan: <b>${namaPemesan}</b>\n` +
                `🏪 Lapak: <b>${namaLapak}</b>\n` +
                `📍 Jadwal: ${jadwalInfo}\n` +
                `📋 Menu: \n${detailPesanan}\n\n` +
                `💰 Total Tagihan: <b>Rp ${parseInt(totalTagihan).toLocaleString('id-ID')}</b>\n` +
                `⏳ Status: Menunggu Pembayaran`;

  const url = `https://api.telegram.org/bot${TELEGRAM_JUALAN_CONFIG.BOT_TOKEN}/sendMessage`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_JUALAN_CONFIG.CHAT_ID,
        text: pesan,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error("Gagal kirim telegram jualan:", e);
  }
}