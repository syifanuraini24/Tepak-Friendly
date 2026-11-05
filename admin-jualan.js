// 3. Ambil Data Jualan / Mitra UMKM (Data_Jualan)
  const sheetJualan = ss.getSheetByName('Data_Jualan') || ss.insertSheet('Data_Jualan');
  const dataJualan = sheetJualan.getDataRange().getValues();
  let jualan = [];
  for (let i = 1; i < dataJualan.length; i++) {
    if (dataJualan[i][2]) {
      jualan.push({
        jadwalId: dataJualan[i][0],
        jadwalInfo: dataJualan[i][1],
        namaPenjual: dataJualan[i][2],
        emailPenjual: dataJualan[i][3] || '', // Kolom D: Email Penjual
        menuJualan: dataJualan[i][4],     // Kolom E: Menu Jualan
        status: dataJualan[i][5],         // Kolom F: Status
        rowIndex: i + 1
      });
    }
  }