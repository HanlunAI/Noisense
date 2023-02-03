const mysql = require('./mysql');
const calculate = require('./calculation');
const cp = require('child_process');

class STATUS {
    constructor({ project }, socket) {
        [this.devices, this.socket] = [new Map(), socket];
        this.getDevices(project).then(() => {
            setInterval(this.checkLastTime, 10000);
            setInterval(this.output02s, 2000);
            setInterval(this.output60s, 60000);
        });
        this.deviceFilter = `project=${project} and active=1`;
    }
    init = () => this.getPlace().then(() => this.getVideo()).then(() => this.output02s()).then(() => this.output60s()).catch(er => console.log(er));

    checkLastTime = () => [...this.devices].forEach(([, status]) => status.checkLastTime());

    getDevices = async project => {
        (await STATUS.query(`SELECT id,location,threshold from devices WHERE project=${project} and active=1`)).forEach(device => {
            this.devices.set(device.id, new status(device.id));
        });
    }
    getPlace = async () => {
        (await STATUS.query(`WITH 
            t as (SELECT *, ROW_NUMBER() over (PARTITION BY device order by time desc) as rn from gps where location!='')
            SELECT devices.id,devices.location as home,devices.threshold,time,t.location from devices left join t on t.device=devices.id where ${this.deviceFilter} and (t.rn=1 or t.rn is null)`
        )).forEach(d => this.devices.get(d.id).updatePlace(d));
    }
    getAudio = async () => {
        const tables = (await STATUS.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'noisense' AND table_name like 'audio-%' ORDER by create_time desc limit 3`))
            .map(row => row.TABLE_NAME);
        (await STATUS.query(`WITH 
            ${tables.map((t, i) => `t${i} as (SELECT *, "${t.substring(6)}" as date, ROW_NUMBER() over (PARTITION BY device order by time desc) as rn from \`${t}\` where level is not null)`).join(',')}
            ${tables.map((t, i) => `SELECT devices.id,t${i}.level,t${i}.class,t${i}.date,t${i}.time from devices left join t${i} on t${i}.device=devices.id where ${this.deviceFilter} and (t${i}.rn=1 or t${i}.rn is null)`).join(' UNION ')}
            order by id, date asc`
        )).forEach(d => this.devices.get(d.id).updateAudio(d));
    }
    getVideo = async () => {
        [...this.devices].forEach(([, status]) => status.updateVideo());
    }
    output02s = () => this.socket.emit('status', [...this.devices].sort(([id1], [id2]) => id1 - id2).map(([, { place, ...others }]) => others));
    output60s = () => this.socket.emit('status', [...this.devices].sort(([id1], [id2]) => id1 - id2).map(([, { place }]) => ({ place: place })));

    static query = sql => new Promise((res, rej) => mysql.query(sql, (er, re) => er ? rej(er) : res(re))).catch(er => console.log(er));
}
class status {
    static items = ['place', 'audio', 'video'];
    static downtimeLimit = { place: 120, audio: 60, video: 60 }; //seconds
    constructor(device) {
        this.device = device;
        const s = {
            status: null,
            lastTime: null,
            errors: 0,
            lastError: null,
            raiseError: function () {
                this.status = 'error';
                this.lastError = new Date();
            }
        }
        this.status = null;
        status.items.forEach(item => this[item] = { ...s });
    }
    updateMainStatus = () => {
        this.status =
            status.items.every(item => !this[item].status || this[item].status == 'error') ? 'error' :
                status.items.every(item => this[item].status && this[item].status != 'error') ? 'normal' : 'warning';
    }
    checkLastTime = () => {
        status.items.forEach(item => {
            //item == 'place' && console.log(new Date().toLocaleString())
            if (new Date() - new Date(this[item].lastTime) > status.downtimeLimit[item] * 1000) {
                item == 'audio' && this.audio.status == 'normal' && this.alert();                
                this[item].raiseError();
            }
        });
        this.updateMainStatus();
    }
    update = (item, data, { errorDeterminant, errorLimit }) => {
        // if (new Date(data.date).toLocaleDateString() == 'Invalid Date')
        //     throw new Error('Date format error: ' + data.date);
        this[item].lastTime = data.date ? `${data.date} ${data.time}` : data.time;
        this[item].status = new Date(this[item].lastTime) - item.lastError < 24 * 60 * 60 * 1000 ? 'warning' : 'normal';
        item == 'audio' ? this[item].value = data.level : null;

        errorDeterminant ? this[item].errors++ : this[item].errors = 0;
        if (this[item].errors >= errorLimit) {
            item == 'audio' && this.audio.status == 'normal' && this.alert();
            this[item].raiseError();
        }
        this.updateMainStatus();
    }
    updatePlace = data => this.update('place', data, { errorDeterminant: calculate.distance(data.location, data.home) > data.threshold, errorLimit: 2 });
    updateAudio = data => this.update('audio', data, { errorDeterminant: data.level >= 75, errorLimit: 1 });
    updateVideo = data => {
        if (data?.normal) {
            this.video.lastTime = new Date();
            this.video.status = new Date() - this.video.lastError < 24 * 60 * 60 * 1000 ? 'warning' : 'normal';
        }
        else if (!data?.normal || !data)
            this.video.raiseError();
    }
    alert() {
        cp.execSync(`sudo /root/trigger${this.device}.php`);
        [85252688254, 85252996748].forEach(phone => {
            const order = `curl -X POST https://messages-sandbox.nexmo.com/v0.1/messages -u '78359c86:9vVCAC5XJEed20av' -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"from":{"type":"whatsapp","number":"14157386170"},"to":{"type":"whatsapp","number":"${phone}"},"message":{"content":{"type":"text","text":"Device ${this.device} receives no processed data. Either it is disconnected, or a server is down."}}}'`
            console.log(order);
            cp.execSync(order);
        });
    }
}
module.exports = STATUS;