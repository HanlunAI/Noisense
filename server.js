const [mysql, calculate, fs] = [require('./mysql'), require('./calculation'), require('fs')];
const exp = require('express');
const app = exp();
app.use(exp.static('public'));
app.use(require('body-parser').json());
app.use(require('express-fileupload')({ createParentPath: true }));

const cred = {
    key: fs.readFileSync("../certs/hanlunil.com/privkey.pem"),
    cert: fs.readFileSync("../certs/hanlunil.com/cert.pem")
};
const server = require('http').createServer(app);
const io = new (require("socket.io").Server)(server);

const STATUS = new (require('./status.js'))({ project: 1 }, io);
io.on('connection', () => STATUS.init());

const standardize = date => `${1900 + date.getYear()}-${(1 + date.getMonth() + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')}`;
const tabulate = data => `<!doctype html><meta name=viewport content="width=device-width, initial-scale=1, user-scalable=1"><table><tr><th>${Object.keys(data[0]).join('<th>')}<tr><td>${data.map(d => Object.values(d).join('<td>')).join('<tr><td>')}</table>`;

const query = (sql, resp) => new Promise((res, rej) => mysql.query(sql, (er, re) => er ? rej(er) : res(re)))
    .then(re => resp ? resp.json(re) : re)
    .catch(er => {
        if (resp) return resp.status(500).json(er);
        throw er;
    });

setInterval(async () => await query(`SELECT count(*) from projects;`), 600 * 1000);

app.get('/api/project/:p/initialize', async ({ params }, resp) => {
    query(`SELECT id,location,threshold from devices WHERE project=${params.p ?? 1} and active=1`, resp);
});

/* GPS */
app.get('/api/GPS/:device/:date', async ({ params }, resp) => {
    const home = (await query(`SELECT location from devices where id=${params.device}`).catch(er => resp.status(500).json(er)))[0]?.location;
    const records = await query(`SELECT time,location from GPS where device=${params.device} and time like '${params.date} %' order by time`).catch(er => resp.status(500).json(er));
    if (!Array.isArray(records)) 
        return;

    const [lat, lon, allow] = [22.426, 114.2125, 0.001];
    let [data, day, min] = [[], new Date('2021-01-01 00:00:00'), 0];
    while (day.getDate() == 1) {
        const location = `${lat + Math.random() * allow * 1},${lon + Math.random() * allow * 1.5}`;
        data.push({
            time: day.toTimeString().match(/[\d:]+(?= GMT)/)[0],
            location: Math.random() < .2 ? null : location,
            distance: calculate.distance(location, home)
        });
        if (day.getMinutes() == 59)
            day.setHours(day.getHours() + 1);
        day.setMinutes(min++ % 60);
    }
    resp.json(data.sort((a, b) => a.time > b.time));
});
app.post('/api/GPS/', async ({ body }, resp) => {
    [body].flat().forEach(d => {
        STATUS.devices.get(d.device).updatePlace(d);
        //console.log(STATUS.devices.get(d.device));
    });
    query(`INSERT into gps (device,time,location) VALUES` + [body].flat().map(d => `(${d.device},'${d.time}','${d.location}')`), resp)
});

/* Audio */
app.get('/api/audio/:device/:date/:period/', async ({ params, query: q }, resp) => {
    params.date = params.date == 'today' ? standardize(new Date()) : params.date;
    if (/^..\:..$/.test(params.period))
        return query(`SELECT time,level,class from \`audio-${params.date}\` where device=${params.device} and time>='${params.period}' and time<addtime('${params.period}','00:01') order by time`, resp);
    if (/^..\:..\:..$/.test(params.period))
        return query(`SELECT time,level,class from \`audio-${params.date}\` where device=${params.device} and time>=addtime('${params.period}','-00:00:02') and time<=addtime('${params.period}','00:00:12') order by time`, resp);
    if (!/^\d+$/.test(params.period) && params.period != 'raw')
        return resp.status(400).end();

    let raw = await query(`SELECT time,level,class from \`audio-${params.date}\` where device=${params.device} order by time desc`).catch(er => resp.status(500).json(er));
    if (!Array.isArray(raw)) 
        return;
    if (raw.length == 0) 
        return resp.json([]).end();
    if (params.period == 'raw')
        return q.table === '' ? resp.end(tabulate(raw)) : resp.json(raw);

    let [calculated, time] = [[], new Date('2021-01-01 23:59:00')];
    while (time.getDate() == 1) {
        let timeMinute = time.toTimeString().substring(0, 6), end;
        const start = raw.findIndex(r => r.time.includes(timeMinute));
        let l = raw.length;
        while (l--) 
            if (raw[l].time.includes(timeMinute)) {
                end = l;
                break;
            }
        time = new Date(time.getTime() - 60 * 1000);
        let thisMinute = start < 0 && !end ? [] : raw.splice(start, end >= 0 ? end + 1 : raw.length);
        calculated.push({
            time: timeMinute.substring(0, 5),
            n: thisMinute.length,
            LAeq: thisMinute.length > 0 && Math.round(calculate.Leq(thisMinute.map(r => r.level)) * 100) / 100,
            proportion: thisMinute.length > 0 && [...Array(14).keys()].map(c => Math.round(thisMinute.filter(r => r.class == c).length / thisMinute.length * 1000) / 10)
        });
    }
    if (params.period != 1)
        calculated = calculated.map((r, i, ar) => {
            const thisPeriod = ar.slice(i, i + parseInt(params.period));
            return thisPeriod.filter(r => r.n > 0).length < params.period ? {time: thisPeriod[0].time, n: 0, LAeq: false, proportion: false} : {
                time: thisPeriod[0].time,
                n: thisPeriod.reduce((sum, r) => sum += r.n, 0),
                LAeq: thisPeriod.some(r => r.n > 0) && Math.round(calculate.Leq(thisPeriod.map(r => r.LAeq)) * 100) / 100,
                proportion: thisPeriod.some(r => r.n > 0) && [...Array(15).keys()].map(c => thisPeriod.reduce((sum, r) => sum += (r.proportion?.[c] ?? 0 ) * r.n, 0) / thisPeriod.reduce((sum, r) => sum += r.n, 0))
            };
        });
    return q.csv === '' ? resp.end(calculated.map(r => `${Object.values(r)}`).join('\n')) : resp.json(calculated);
});
app.post('/api/audio/', async ({ body }, resp) => {
    let initPromise;
    if (['device', 'date', 'time', 'audioPath', 'level', 'class'].every(item => body[item] != null)) {
        STATUS.devices.get(body.device)?.updateAudio(body);
        await query(`CREATE TABLE if not exists \`audio-${body.date}\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`device\` INT NOT NULL,
            \`audioPath\` VARCHAR(255) NULL,
            \`level\` DECIMAL(5,2) NULL,
            \`fast\` DECIMAL(5,2) NULL,
            \`class\` INT NULL,
            \`time\` TIME NOT NULL,
            PRIMARY KEY (\`id\`)
        );`);
        query(`INSERT into \`audio-${body.date}\` 
            (device, audioPath, time, level, class) VALUES 
            (${body.device}, '${body.audioPath}', '${body.time}', '${body.level}', '${body.class}');`, resp);
    }
    // (initPromise ?? new Promise(res => res())).then(() =>
    //     query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'noisense' AND table_name like 'audio-%' ORDER by create_time desc limit 3`)
    // ).then(tables =>
    //     query(tables.map(t => `SELECT '${t.TABLE_NAME.substring(6)}' as date, id, device, audioPath from \`${t.TABLE_NAME}\` WHERE level is null`).join(' UNION ') + ' ORDER by date, id', resp)
    // ).catch(er => resp.status(500).json(er));
});

/* Video */
app.put('/api/video/', async ({ body }, resp) => {
    [body].flat().forEach(device => STATUS.devices.get(device.device)?.updateVideo({ normal: device.normal }));
    resp.status(200).end();
});
app.post('/api/device/stream/', async ({ body }, resp) => {
    io.emit('stream', { device: body.d });
    if (body.d == 'all') {
        const devices = [{ id: 1, src: 'http://ps1.hanlunil.com:8090/cam1.flv' }, { id: 2, src: 'http://ps1.hanlunil.com:8090/cam2.flv' }, { id: 3, src: 'http://ps1.hanlunil.com:8090/cam3.flv' }, { id: 4, src: 'http://ps1.hanlunil.com:8090/cam4.flv' }];
        await Promise.all(devices.map(device => new Promise((res, rej) =>
            mysql.query(`INSERT into abnormalities (device,type) VALUES (${device.id},'manual')`, (er, re) => er ? rej(er) : res(device.record = re.insertId))
        ))).catch(er => resp.status(500).json(er));
        resp.json(devices);
    }
    else {
        const device = { id: body.d, src: 'b' };
        await query(`INSERT into abnormalities (device,type) VALUES (${device.id},'manual')`)
            .then(re => device.record = re.insertId)
            .catch(er => resp.status(500).json(er));
        resp.json(device);
    }
});
app.put('/api/stream-end/', async ({ body }, resp) => {
    await query(`UPDATE abnormalities SET streamDuration=timediff(current_timestamp,time) WHERE id=${body.record}`, resp);
});
app.put('/api/device/:d/home', async ({ body, params }, resp) => {
    await query(`UPDATE devices SET location=${body.home} WHERE id=${params.d}`, resp);
});
app.put('/api/device/:d/threshold', async ({ body, params }, resp) => {
    await query(`UPDATE devices SET threshold=${body.threshold} WHERE id=${params.d}`, resp);
});

server.listen(3000, () => console.log('On 3000'));