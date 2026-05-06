export default async function handler(req, res) {

  const stockNo = req.query.stockNo || "2330";

  const now = new Date();

  const yyyy = now.getFullYear();

  const mm =
    String(now.getMonth() + 1).padStart(2, "0");

  const date = `${yyyy}${mm}01`;

  const api =
    `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${stockNo}`;

  try {

    const response = await fetch(api, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const data = await response.json();

    res.status(200).json({
      success: true,
      stockNo,
      date,
      data
    });

  } catch (e) {

    res.status(500).json({
      success: false,
      error: e.toString()
    });

  }
}
