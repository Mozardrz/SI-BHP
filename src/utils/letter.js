import { KOP_LOGO } from '../data/kopLogo';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Opens an HTML preview of the request letter in a new window (KRS-style):
 * the page shows a "Cetak" button that triggers the browser's native print dialog.
 * Two variants: mahasiswa (Nama/NIM/Kelas) and dosen (Nama, signs with NIP).
 * The "Kepala Laboratorium" signatory follows the selected lab.
 */
export const openLetterPreview = ({ request, material, course, lab, applicant }) => {
  const isMhs = applicant.type === 'mahasiswa';
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const idRows = isMhs
    ? [
        ['Nama', applicant.name],
        ['NIM', applicant.nim],
        ['Prodi/Kelas', `${applicant.prodi || '-'} / ${applicant.kelas || '-'}`],
        ['Laboratorium', lab?.lab_name]
      ]
    : [['Nama', applicant.name], ['Laboratorium', lab?.lab_name]];

  const idRowsHtml = idRows
    .map(([k, v]) => `<tr><td>${esc(k)}</td><td>:</td><td>${esc(v || '-')}</td></tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Surat Permohonan BHP - ${esc(applicant.name || 'Pemohon')}</title>
<style>
  @page { size: A4; margin: 18mm 20mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.25; color: #000; margin: 0; background: #f3f4f6; }
  .sheet { background: #fff; width: 210mm; min-height: 297mm; margin: 24px auto; padding: 16mm 20mm; box-shadow: 0 2px 12px rgba(0,0,0,.15); }
  .toolbar { position: fixed; top: 14px; left: 14px; z-index: 10; }
  .toolbar button { font-family: Arial, sans-serif; font-size: 13px; padding: 8px 18px; border: 1px solid #94a3b8; background: #fff; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.15); }
  .toolbar button:hover { background: #f1f5f9; }
  .kop { display: flex; align-items: center; gap: 14px; border-bottom: 3px double #000; padding-bottom: 5px; }
  .kop img { width: 78px; height: auto; }
  .kop .txt { flex: 1; text-align: center; line-height: 1.2; }
  .kop .txt .l1 { font-weight: bold; font-size: 12pt; }
  .kop .txt .l2 { font-weight: bold; font-size: 15pt; }
  .kop .txt .l3 { font-size: 9pt; }
  h1.title { text-align: center; font-size: 13pt; font-weight: bold; margin: 14px 0 1px; line-height: 1.15; }
  h1.title span { display: block; }
  h1.title span:first-child { text-decoration: underline; }
  h1.title span:last-child { text-decoration: underline; }
  p { margin: 3px 0; text-align: justify; }
  .idtable td { padding: 0 6px 0 0; vertical-align: top; }
  .idtable td:first-child { width: 130px; }
  .idtable td:nth-child(2) { width: 12px; }
  table.rincian { border-collapse: collapse; width: 100%; margin: 6px 0; }
  table.rincian th, table.rincian td { border: 1px solid #000; padding: 3px 7px; }
  table.rincian th { text-align: center; }
  table.sig { width: 100%; border-collapse: collapse; margin-top: 2px; }
  table.sig td { width: 50%; text-align: center; vertical-align: top; line-height: 1.3; }
  .sig .gap { height: 52px; }
  .right { text-align: right; }
  .datesig { text-align: right; margin: 12px 0 0; padding-right: 6%; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Cetak</button></div>
  <div class="sheet">
    <div class="kop">
      <img src="${KOP_LOGO}" alt="Logo Polbeng">
      <div class="txt">
        <div class="l1">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
        <div class="l2">POLITEKNIK NEGERI BENGKALIS</div>
        <div class="l3">Jln. Bathin Alam, Sungai Alam, Bengkalis-Riau-Indonesia</div>
        <div class="l3">Telp (+62766) 24566, 24577 &nbsp; Fax (+62766) 8001000</div>
        <div class="l3">Website: www.polbeng.ac.id &nbsp; Email: polbeng@polbeng.ac.id</div>
      </div>
    </div>

    <h1 class="title"><span>SURAT PERMOHONAN &amp; PEMAKAIAN</span><span>BAHAN HABIS PAKAI</span></h1>

    <p style="text-align:left;margin:14px 0 0;">Kepada</p>
    <p style="text-align:left;margin:0;">Kepala ${esc(lab?.lab_name || '..............................................')}</p>
    <p style="text-align:left;margin:0;">Di Tempat</p>

    <p style="margin-top:10px;">Dengan hormat,</p>
    <p style="margin:0;">Yang bertanda tangan di bawah ini:</p>

    <table class="idtable" style="margin:5px 0;"><tbody>${idRowsHtml}</tbody></table>

    <p>dengan ini mengajukan permohonan pemakaian bahan habis pakai untuk keperluan praktikum/penelitian di laboratorium tersebut, dengan rincian sebagai berikut:</p>

    <table class="rincian">
      <thead>
        <tr><th style="width:34px;">No</th><th>Nama Bahan</th><th>Spesifikasi</th><th style="width:70px;">Jumlah</th><th style="width:80px;">Satuan</th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;">1</td>
          <td>${esc(material?.material_name || '-')}</td>
          <td>${esc(material?.specification || '-')}</td>
          <td style="text-align:center;">${esc(request.quantity)}</td>
          <td style="text-align:center;">${esc(material?.unit || '-')}</td>
        </tr>
      </tbody>
    </table>

    <p>Demikian permohonan ini kami sampaikan. Atas perhatian dan izin Bapak/Ibu, kami ucapkan terima kasih.</p>

    <p class="datesig">Bengkalis, ${esc(today)}</p>

    <table class="sig">
      <tr>
        <td>
          <div>Pemohon,</div>
          <div>${isMhs ? 'Mahasiswa' : 'Dosen'}</div>
          <div class="gap"></div>
          <div><b>( ${esc(applicant.name || '.....................................')} )</b></div>
          ${isMhs ? `<div>NIM. ${esc(applicant.nim || '...............................')}</div>` : ''}
        </td>
        <td>
          <div>Mengetahui,</div>
          <div>Kepala ${esc(lab?.lab_name || 'Laboratorium')}</div>
          <div class="gap"></div>
          <div><b>( ${esc(lab?.head_name || '.....................................')} )</b></div>
          <div>NIP. ${esc(lab?.head_nip || '...............................')}</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup diblokir browser. Izinkan popup untuk menampilkan preview surat.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
};
