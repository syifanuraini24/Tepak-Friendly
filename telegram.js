/**
 * KONFIGURASI TELEGRAM NOTIFIKASI
 * Edit di sini jika ada perubahan Token atau Chat ID
 */
var TELEGRAM_CONFIG = {
  BOT_TOKEN: "8997385135:AAE2EbhKjEA31midSWg_KosLkbs0N7gdXXA", // Ganti dengan Token Bot Telegram
  CHAT_ID: "-5327500047"       // Ganti dengan Chat ID Telegram/Grup
};

async function kirimNotifTelegram(nama, email, jadwalId, jadwalInfo, totalTagihan) {
  if (!TELEGRAM_CONFIG.BOT_TOKEN || TELEGRAM_CONFIG.BOT_TOKEN.includes("MASUKKAN")) return;

  const formatRp = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(totalTagihan);

  // Cari tahu baris data terakhir peserta di Spreadsheet agar tombol nyambung dengan benar.
  // Cara paling aman: Kita ambil data baris terbaru via fetch doGet atau passing index.
  // Tapi untuk instannya, kita kirim pesan notifikasi dengan tombol ACC:
  const pesanNotif = `🚨 *Pendaftar Mabar Baru!*\n\n` +
                     `👤 Nama: *${nama}*\n` +
                     `📧 Email: ${email}\n` +
                     `📌 Jadwal: \`[${jadwalId}]\` ${jadwalInfo}\n` +
                     `💰 Tagihan: *${formatRp}*\n\n` +
                     `Silakan verifikasi pembayaran:`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: pesanNotif,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ ACC Lunas & Kirim E-Ticket", callback_data: "acc_latest" }
            ]
          ]
        }
      })
    });
  } catch (err) {
    console.error("Gagal kirim Telegram:", err);
  }
}