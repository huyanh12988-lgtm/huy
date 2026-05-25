import { Candidate } from '../types';
import { COMBINATIONS, COMBINATION_LABELS } from '../constants';

export const printCandidateForms = (candidates: Candidate[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = candidates.map(candidate => {
    const isCNQP = candidate.system?.toLowerCase().includes('cnqp');
    const isDansu = candidate.system?.toLowerCase().includes('dân sự');
    const isCaodang = candidate.level?.toLowerCase().includes('cao đẳng');
    const isTrungcap = candidate.level?.toLowerCase().includes('trung cấp');

    // Attempt to parse date for the footer
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();

    return `
      <div class="page">
        <div class="header-section">
          <div class="header-left">
            TỔNG CỤC CÔNG NGHIỆP QUỐC PHÒNG<br/>
            <strong>TRƯỜNG CAO ĐẲNG CÔNG NGHIỆP QUỐC PHÒNG</strong>
          </div>
          <div class="header-right">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
            <strong>Độc lập - Tự do - Hạnh phúc</strong>
            <div class="divider"></div>
          </div>
        </div>

        <div class="title-section">
          <h1 class="main-title">PHIẾU ĐĂNG KÝ DỰ TUYỂN CAO ĐẲNG, TRUNG CẤP NĂM 2026</h1>
          <h2 class="sub-title">HỆ CHỈ TIÊU CNQP VÀ HỆ DÂN SỰ</h2>
          <div class="form-number">Số phiếu: ${candidate.examRegistrationNumber || ''}</div>
        </div>

        <table class="form-table">
          <tr>
            <td colspan="4" class="no-border-left no-border-right">
              <strong>Tên trường dự tuyển: Cao đẳng Công nghiệp quốc phòng</strong>
              <span style="float: right"><strong>Mã trường: QPH</strong></span>
            </td>
          </tr>
          <tr>
            <td class="col-num">1.</td>
            <td colspan="3">
              Chỉ tiêu dự tuyển: 
              <span class="checkbox-group">
                Chỉ tiêu CNQP <span class="box">${isCNQP ? 'X' : ''}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Chỉ tiêu Dân sự <span class="box">${isDansu ? 'X' : ''}</span>
              </span>
            </td>
          </tr>
          <tr>
            <td class="col-num">2.</td>
            <td colspan="3">
              Trình độ đào tạo:
              <span class="checkbox-group">
                Cao đẳng <span class="box">${isCaodang ? 'X' : ''}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Trung cấp <span class="box">${isTrungcap ? 'X' : ''}</span>
              </span>
            </td>
          </tr>
          <tr>
            <td class="col-num">3.</td>
            <td colspan="3" class="nested-cell">
              Phương thức xét tuyển:
              <div class="method-row">
                (1) Tuyển thẳng, ưu tiên xét tuyển: <span class="box"></span> (Cao đẳng – Trung cấp)
              </div>
              <div class="method-row">
                (2) Xét tuyển theo kết quả thi ĐGNL: <span class="box"></span> (Cao đẳng): HSA: <span class="box"></span> APT: <span class="box"></span> QDA: <span class="box"></span>
              </div>
              <div class="method-row">
                (3) Xét tuyển theo kết quả thi THPT: <span class="box">X</span> (Cao đẳng). Tổ hợp môn thi: <span class="score-box">A00, A01...</span>
              </div>
              <div class="method-row">
                (4) Xét tuyển theo học bạ THPT: <span class="box"></span> (Trung cấp)
              </div>
            </td>
          </tr>
          <tr>
            <td class="col-num">4.</td>
            <td colspan="2">Tên ngành/nghề dự tuyển: <span class="dotted-val">${candidate.major || ''}</span></td>
            <td class="col-code">Mã ngành: <span class="score-box" style="width: 100px; display: inline-block;"></span></td>
          </tr>
          <tr>
            <td class="col-num">5.</td>
            <td colspan="3">Họ và tên thí sinh: <span class="dotted-val" style="text-transform: uppercase; font-weight: bold;">${candidate.fullName}</span></td>
          </tr>
          <tr>
            <td class="col-num">6.</td>
            <td colspan="2">Ngày, tháng, năm sinh: <span class="dotted-val">${candidate.dateOfBirth}</span></td>
            <td>Nơi sinh: <span class="dotted-val">${candidate.birthPlace || ''}</span></td>
          </tr>
          <tr>
            <td class="col-num">7.</td>
            <td colspan="2">Dân tộc: <span class="dotted-val">${candidate.ethnicity || ''}</span></td>
            <td>
              Giới tính: &nbsp;&nbsp;
              Nam <span class="box">${candidate.gender?.toLowerCase() === 'nam' ? 'X' : ''}</span> &nbsp;&nbsp;
              Nữ <span class="box">${candidate.gender?.toLowerCase() === 'nữ' ? 'X' : ''}</span>
            </td>
          </tr>
          <tr>
            <td class="col-num">8.</td>
            <td colspan="2">Số Căn cước/CCCD: <span class="dotted-val">${candidate.identificationNumber}</span></td>
            <td>Ngày cấp: <span class="dotted-val"></span></td>
          </tr>
          <tr>
            <td class="col-num">9.</td>
            <td colspan="2">Đối tượng ưu tiên (nếu có): <span class="dotted-val"></span></td>
            <td>Khu vực ưu tiên: <span class="dotted-val"></span></td>
          </tr>
          <tr>
            <td class="col-num">10.</td>
            <td colspan="3">Hộ khẩu thường trú:<br/><span class="dotted-val">${candidate.permanentAddress || ''}</span></td>
          </tr>
          <tr>
            <td class="col-num" rowspan="4">11.</td>
            <td colspan="3">Tên trường THPT đã học các năm:</td>
          </tr>
          <tr><td colspan="3">Lớp 10: <span class="dotted-val"></span></td></tr>
          <tr><td colspan="3">Lớp 11: <span class="dotted-val"></span></td></tr>
          <tr><td colspan="3">Lớp 12: <span class="dotted-val">${candidate.highSchool || ''}</span></td></tr>
          <tr>
            <td class="col-num">12.</td>
            <td colspan="3">Năm tốt nghiệp THPT: <span class="dotted-val">${candidate.graduationYear || ''}</span></td>
          </tr>
          <tr>
            <td class="col-num">13.</td>
            <td colspan="2">Điện thoại liên hệ: <span class="dotted-val">${candidate.phone}</span></td>
            <td>Email: <span class="dotted-val">${candidate.email}</span></td>
          </tr>
          <tr>
            <td class="col-num">14.</td>
            <td colspan="3">
              Địa chỉ liên hệ:<br/>
              <span class="dotted-val">${candidate.fullName}, ${candidate.permanentAddress || ''}</span>
              <br/>
              <span style="float: right; margin-top: 5px;">Số điện thoại người nhận: <span class="dotted-val">${candidate.phone}</span></span>
            </td>
          </tr>
        </table>

        <div class="footer-section">
          <div class="footer-left">
            <strong>NGƯỜI TƯ VẤN TUYỂN SINH</strong><br/>
            <em>(Ký, ghi rõ họ tên, Đơn vị công tác)</em>
            <div style="margin-top: 30px; font-weight: bold;">${candidate.consultantName || ''}</div>
          </div>
          <div class="footer-right">
            <div class="date-line">................, ngày ${day} tháng ${month} năm ${year}</div>
            <strong>NGƯỜI ĐĂNG KÝ</strong><br/>
            <em>(Ký, ghi rõ họ tên)</em>
          </div>
        </div>
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>In Phiếu Đăng Ký Dự Tuyển</title>
        <style>
          @page { 
            size: A4; 
            margin: 0; /* This hides default browser headers and footers */
          }
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 11pt; 
            line-height: 1.25; 
            color: #000;
            margin: 0;
            padding: 0;
          }
          .page {
            page-break-after: always;
            position: relative;
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
            border: none;
            padding: 15mm;
            margin: 0 auto;
          }
          .page:last-child { page-break-after: auto; }
          
          .header-section {
            display: flex;
            justify-content: space-between;
            text-align: center;
            margin-bottom: 10px;
          }
          .header-left { font-size: 10pt; }
          .header-right { font-size: 10pt; position: relative; }
          .divider {
            width: 120px;
            height: 1px;
            background: #000;
            margin: 3px auto 0;
          }

          .title-section {
            text-align: center;
            margin: 10px 0;
          }
          .main-title { font-size: 14pt; font-weight: bold; margin: 0; }
          .sub-title { font-size: 12pt; font-weight: bold; margin: 3px 0; border-bottom: 1px double #000; display: inline-block; padding-bottom: 2px; }
          .form-number { text-align: right; margin-top: 5px; font-size: 11pt; }

          .form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .form-table td {
            border: 1px dotted #888;
            padding: 3px 6px;
            vertical-align: top;
          }
          .form-table .col-num {
            width: 25px;
            text-align: center;
            border-left: 1px solid #000;
            font-weight: bold;
          }
          .form-table td:last-child { border-right: 1px solid #000; }
          .form-table tr:first-child td { border-top: 1px solid #000; border-bottom: 1px solid #000; }
          .form-table tr:last-child td { border-bottom: 1px solid #000; }
          
          .no-border-left { border-left: none !important; }
          .no-border-right { border-right: none !important; }
          
          .box {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 1px solid #000;
            text-align: center;
            line-height: 18px;
            vertical-align: middle;
            margin: 0 3px;
            font-weight: bold;
          }
          .score-box {
            display: inline-block;
            width: 80px;
            height: 20px;
            border: 1px solid #000;
            vertical-align: middle;
            margin-left: 5px;
            text-align: center;
            line-height: 20px;
            font-size: 9pt;
          }
          
          .dotted-val {
            border-bottom: 1px dotted #000;
            display: inline-block;
            min-width: 50px;
            padding: 0 5px;
          }
          
          .method-row { margin: 5px 0; }
          
          .footer-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            text-align: center;
          }
          .footer-left { width: 45%; }
          .footer-right { width: 45%; }
          .date-line { margin-bottom: 5px; font-style: italic; }

          @media print {
            body { margin: 0; }
            .page { border: none; }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
