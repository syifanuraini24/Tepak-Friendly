/**
 * KONFIGURASI TELEGRAM NOTIFIKASI
 * Edit di sini jika ada perubahan Token atau Chat ID
 */
const TELEGRAM_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA", // Ganti dengan Token Bot Telegram
  CHAT_ID: "1273652411"       // Ganti dengan Chat ID Telegram/Grup
};

/**
 * Fungsi untuk mengirim notifikasi pendaftar baru ke Telegram
 */
async function kirimNotifTelegram(nama, email, jadwalId, jadwalInfo, totalTagihan) {
  // Cegah pengiriman jika token/chat ID belum diisi
  if (!TELEGRAM_CONFIG.BOT_TOKEN || TELEGRAM_CONFIG.BOT_TOKEN.includes("MASUKKAN")) {
    console.warn("Notifikasi Telegram skipped: Token atau Chat ID belum dikonfigurasi.");
    return;
  }

  const formatRp = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(totalTagihan);

  const pesanNotif = `🚨 *Pendaftar Mabar Baru!*\n\n` +
                     `👤 Nama: *${nama}*\n` +
                     `📧 Email: ${email}\n` +
                     `📌 Jadwal: \`[${jadwalId}]\` ${jadwalInfo}\n` +
                     `💰 Tagihan: *${formatRp}*\n\n` +
                     `Silakan cek panel admin untuk konfirmasi pembayaran.`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: pesanNotif,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.error("Gagal kirim notif Telegram:", result.description);
    }
  } catch (err) {
    console.error("Error jaringan saat kirim Telegram:", err);
  }
}