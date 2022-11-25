import * as express from "express";
import * as mysql from "mysql2";
import * as cors from "cors";
const app = express();

app.use(cors());

const getSQLConnection = (
  errorResponse: express.Response
): Promise<mysql.PoolConnection> => {
  return new Promise((resolve, reject) => {
    mysql
      .createPool({
        user: "root",
        password: "",
        host: "127.0.0.1",
        port: 3306,
        database: "seven",
        namedPlaceholders: true,
      })
      .getConnection((err, conn) => {
        if (err) {
          errorResponse.json({ status: "not ok", error: err });
          return resolve(null);
        }
        return resolve(conn);
      });
  });
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.get('/getstore', async (req, res) => {
//     const sql = `SELECT * FROM store WHERE store_id = ${req.query.id}`
//     console.log(req.query);
//     const conn = await getSQLConnection(res)
//     if(!conn) return;
//     conn.execute(sql, (err, result: any[]) => {
//         if (err) return res.status(400).json({ status: "not ok", error: err });
//         if (result.length == 0) return res.status(400).json({ status: "not found" });
//         return res.status(200).json({ status: "ok", result: result })
//     })
// })

app.get("/getstore", async (req, res) => {
  const sql = `SELECT store.store_name 
  ,store.store_id 
  ,store.store_latitude
  ,store.store_longitude
  ,night.weatherIconUrl
  ,night.date
  ,night.weatherDesc
  ,night.tempC
  ,night.windspeedKmph
  ,night.humidity 
  ,day.weatherIconUrl AS day_weatherIconUrl
  ,day.date AS day_date
  ,day.weatherDesc AS day_weatherDesc
  ,day.tempC AS day_tempC
  ,day.windspeedKmph AS day_windspeedKmph
  ,day.humidity  AS day_humidity
  FROM store JOIN night ON store.store_id = night.store_id JOIN day ON store.store_id = day.store_id 
  WHERE store.store_id = ${req.query.id} AND night.date = CURRENT_DATE() AND day.date = CURRENT_DATE()`;
  console.log(req.query);
  const conn = await getSQLConnection(res);
  if (!conn) return;
  conn.execute(sql, (err, result: any[]) => {
    if (err) return res.status(400).json({ status: "not ok", error: err });
    if (result.length == 0)
      return res.status(400).json({ status: "not found" });
    return res.status(200).json({ status: "ok", result: result });
  });
});

app.get("/getlatlong", async (req, res) => {
    const sql = `SELECT store.store_name 
    ,store.store_id 
    ,store.store_latitude
    ,store.store_longitude
    ,night.weatherIconUrl
    ,night.date
    ,night.weatherDesc
    ,night.tempC
    ,night.windspeedKmph
    ,night.humidity 
    ,day.weatherIconUrl AS day_weatherIconUrl
    ,day.date AS day_date
    ,day.weatherDesc AS day_weatherDesc
    ,day.tempC AS day_tempC
    ,day.windspeedKmph AS day_windspeedKmph
    ,day.humidity  AS day_humidity
    FROM store JOIN night ON store.store_id = night.store_id JOIN day ON store.store_id = day.store_id 
    WHERE store.store_latitude = ${req.query.lat} AND store.store_longitude = ${req.query.long} AND night.date = CURRENT_DATE() AND day.date = CURRENT_DATE()`;
  console.log(req.query);
  const conn = await getSQLConnection(res);
  if (!conn) return;
  conn.execute(sql, (err, result: any[]) => {
    if (err) return res.status(400).json({ status: "not ok", error: err });
    if (result.length == 0)
      return res.status(400).json({ status: "not found" });
    return res.status(200).json({ status: "ok", result: result });
  });
});

// app.post('/login', async (req, res) => {
//     const body = req.body ?? {}
//     const conn = await getSQLConnection(res)
//     if(!conn) return;
//     const loginSQL = `SELECT * FROM stroe`;
//     conn.execute(loginSQL, {
//         user: body.username ?? "",
//         pass: body.password ?? "",
//     }, (err, result: any[]) => {
//         if (err) return res.status(400).json({ status: "not ok", error: err });
//         if (result.length == 0) return res.status(400).json({ status: "not found: user or password wrong" });
//         return res.status(200).json({ status: "ok", result: result[0] })
//     })
// })

// app.get('/getSuggestList', async (req, res) => {
//     const isfull = req.query.full == "true"
//     const requester = req.query.requester;

//     if (!requester) return res.status(400).json({ status: "not ok, id not found" });

//     const sql = isfull ? `SELECT s.*, concat(u.fname, " ", u.lname) as requester_name
//     ,t.label as topic_label
//     FROM suggest s
//     left join user u on u.id = s.requester
//     left join topic t on s.topic_id = t.id
//     ` :
//     `SELECT s.*, concat(u.fname, " ", u.lname) as requester_name
//     ,t.label as topic_label
//     FROM suggest s
//     left join user u on u.id = s.requester
//     left join topic t on s.topic_id = t.id
//     where requester = :requester`;
//     const conn = await getSQLConnection(res)
//     if(!conn) return;
//     conn.execute(sql, { requester }, (err, result: any[]) => {
//         if (err) return res.status(400).json({ status: "not ok", error: err });
//         if (result.length == 0) return res.status(400).json({ status: "not found" });
//         return res.status(200).json({ status: "ok", result: result })
//     })
// })

// app.post('/postSuggest', async (req, res) => {
//     const requester = req.body.requester;
//     const topic = req.body.topic;
//     const text = req.body.text;
//     const type = req.body.type;

//     if (!requester || !topic || !text) return res.status(400).json({ status: "not ok, invalid param" });

//     // 0 = เปิดเผย
//     // 1 = ส่วนตัว

//     const sql = `insert into suggest (requester, approver, topic_id, suggestion, create_date, update_date, suggest_type, complete) value (:requester, null, :topic, :text,  now(), now(), :type, 0)`;
//     const conn = await getSQLConnection(res)
//     if(!conn) return;
//     conn.execute(sql, { requester, topic, text, type }, (err, result) => {
//         if (err) return res.status(400).json({ status: "not ok", error: err });
//         // if (result.length == 0) return res.status(400).json({ status: "not found" });
//         return res.status(200).json({ status: "ok", result: result })
//     })
// })

// app.post('/confirm', async (req, res) => {
//     const approver = req.body.approver;
//     const suggest = req.body.suggest;

//     if (!approver || !suggest) return res.status(400).json({ status: "not ok, invalid param" });

//     const sql = `update suggest set complete = 1, approver = :approver where id = :id`;
//     const conn = await getSQLConnection(res)
//     if(!conn) return;
//     conn.execute(sql, { id: suggest, approver }, (err, result: any) => {
//         if (err) return res.status(400).json({ status: "not ok", error: err });
//         if (result.affectedRows == 0) return res.status(400).json({ status: "error, no change" });
//         return res.status(200).json({ status: "ok", result: result })
//     })
// })

app.listen(3000, () => {
  console.log("Start server at port 3000.");
});
