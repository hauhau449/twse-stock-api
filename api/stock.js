export default async function handler(req, res) {

  const type = req.query.type || "stock";

  try {

    // =========================
    // 個股日K
    // =========================
    if (type === "stock") {

      const stockNo = req.query.stockNo || "2330";

            const months = [];

      for (let i = 0; i < 6; i++) {

        const d = new Date();

        d.setMonth(d.getMonth() - i);

        const yyyy = d.getFullYear();

        const mm =
          String(d.getMonth() + 1).padStart(2, "0");

        const date = `${yyyy}${mm}01`;

        months.push(date);
      }

      let allData = [];

      for (const date of months) {

        const api =
          `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${stockNo}`;

        const response = await fetch(api, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        const data = await response.json();

        if (data.data) {

          allData = [
            ...allData,
            ...data.data
          ];
        }
      }

return res.status(200).json({
  success: true,
  type: "stock",
  stockNo,
  data: allData
});
    }

    // =========================
    // 大盤指數
    // =========================
    if (type === "market") {

      const now = new Date();

      const yyyy = now.getFullYear();

      const mm =
        String(now.getMonth() + 1).padStart(2, "0");

      const dd =
        String(now.getDate()).padStart(2, "0");

      const date = `${yyyy}${mm}${dd}`;

      const api =
        `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date=${date}&type=ALL`;

      const response = await fetch(api, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const data = await response.json();

      return res.status(200).json({
        success: true,
        type: "market",
        date,
        data
      });
    }

    // =========================
    // 三大法人
    // =========================
    if (type === "institution") {

      const now = new Date();

      const yyyy = now.getFullYear();

      const mm =
        String(now.getMonth() + 1).padStart(2, "0");

      const dd =
        String(now.getDate()).padStart(2, "0");

      const date = `${yyyy}${mm}${dd}`;

      const api =
        `https://www.twse.com.tw/fund/BFI82U?response=json&dayDate=${date}&type=day`;

      const response = await fetch(api, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const data = await response.json();

      return res.status(200).json({
        success: true,
        type: "institution",
        date,
        data
      });
    }
    // =========================
    // 個股三大法人 T86
    // =========================
    if (type === "t86") {

      const stockNo =
        req.query.stockNo || "2330";

      let stockData = null;

      let finalDate = null;

      for (let i = 0; i < 7; i++) {

        const d = new Date();

        d.setDate(d.getDate() - i);

        const yyyy = d.getFullYear();

        const mm =
          String(d.getMonth() + 1).padStart(2, "0");

        const dd =
          String(d.getDate()).padStart(2, "0");

        const date = `${yyyy}${mm}${dd}`;

        const api =
          `https://www.twse.com.tw/rwd/zh/fund/T86?response=json&date=${date}&selectType=ALLBUT0999`;

        const response = await fetch(api, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        const data = await response.json();

        if (data.data) {

          stockData =
            data.data.find(
              item => item[0] === stockNo
            );

          if (stockData) {

            finalDate = date;

            break;
          }
        }
      }

      const api =
        `https://www.twse.com.tw/rwd/zh/fund/T86?response=json&date=${date}&selectType=ALLBUT0999`;

      const response = await fetch(api, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const data = await response.json();

      let stockData = null;

      if (data.data) {

        stockData =
          data.data.find(
            item => item[0] === stockNo
          );
      }

      return res.status(200).json({
        success: true,
        type: "t86",
        stockNo,
        date: finalDate,
        data: stockData
      });
    }
    return res.status(400).json({
      success: false,
      error: "invalid type"
    });

  } catch (e) {

    return res.status(500).json({
      success: false,
      error: e.toString()
    });
  }
}
