export default async function handler(req, res) {

  const type = req.query.type || "stock";

  try {

    // =========================
    // 股票日K
    // =========================

    if (type === "stock") {

      const stockNo =
        req.query.stockNo || "2330";

      const months = [];

      for (let i = 0; i < 6; i++) {

        const d = new Date();

        d.setMonth(d.getMonth() - i);

        const yyyy = d.getFullYear();

        const mm =
          String(d.getMonth() + 1)
          .padStart(2, "0");

        const date =
          `${yyyy}${mm}01`;

        months.push(date);
      }

      let allData = [];

      for (const date of months) {

        const api =
          `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${stockNo}`;

        const response =
          await fetch(api, {
            headers: {
              "User-Agent":
                "Mozilla/5.0"
            }
          });

        const data =
          await response.json();

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
    // 大盤
    // =========================

    if (type === "market") {

      const date =
        await getLatestTWSEDate(
          d =>
            `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date=${d}&type=ALL`
        );

      const api =
        `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date=${date}&type=ALL`;

      const response =
        await fetch(api, {
          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        });

      const data =
        await response.json();

      return res.status(200).json({
        success: true,
        type: "market",
        date,
        data
      });
    }

    // =========================
    // 市場法人
    // =========================

    if (type === "institution") {

      const date =
        await getLatestTWSEDate(
          d =>
            `https://www.twse.com.tw/fund/BFI82U?response=json&dayDate=${d}&type=day`
        );

      const api =
        `https://www.twse.com.tw/fund/BFI82U?response=json&dayDate=${date}&type=day`;

      const response =
        await fetch(api, {
          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        });

      const data =
        await response.json();

      return res.status(200).json({
        success: true,
        type: "institution",
        date,
        data
      });
    }

    // =========================
    // 個股法人 T86
    // =========================

if (type === "t86") {

  const stockNo =
    req.query.stockNo || "2330";

  let stockData = null;

  let finalDate = null;

  // 往前找 10 天
  for (let i = 0; i < 10; i++) {

    const d = new Date();

    d.setDate(d.getDate() - i);

    const yyyy =
      d.getFullYear();

    const mm =
      String(d.getMonth() + 1)
      .padStart(2, "0");

    const dd =
      String(d.getDate())
      .padStart(2, "0");

    const date =
      `${yyyy}${mm}${dd}`;

    const api =
      `https://www.twse.com.tw/rwd/zh/fund/T86?response=json&date=${date}&selectType=ALLBUT0999`;

    try {

      const response =
        await fetch(api, {
          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        });

      const json =
        await response.json();

      const rows =
        json.data ||
        json.tables?.[0]?.data ||
        [];

      // 有資料才繼續
      if (rows.length > 0) {

        stockData =
          rows.find(
            item =>
              String(item[0]).trim() ===
              String(stockNo)
          );

        // 找到股票
        if (stockData) {

          finalDate = date;

          break;
        }
      }

    } catch (e) {

    }
  }

  // 找不到
  if (!stockData) {

    return res.status(200).json({
      success: false,
      type: "t86",
      stockNo,
      error:
        "official data unavailable"
    });
  }

  // 成功
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

// =========================
// fallback 日期
// =========================

async function getLatestTWSEDate(
  checkUrlBuilder
) {

  for (let i = 0; i < 10; i++) {

    const d = new Date();

    d.setDate(d.getDate() - i);

    const yyyy = d.getFullYear();

    const mm =
      String(d.getMonth() + 1)
      .padStart(2, "0");

    const dd =
      String(d.getDate())
      .padStart(2, "0");

    const date =
      `${yyyy}${mm}${dd}`;

    const url =
      checkUrlBuilder(date);

    try {

      const response =
        await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        });

      const data =
        await response.json();

      if (
        data &&
        (
          data.data ||
          data.tables
        )
      ) {

        return date;
      }

    } catch (e) {

    }
  }

  return null;
}
