customElements.define('device-status', class extends HTMLElement {
    static observedAttributes = ['status'];
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <div id=board>
            <ol role=h3></ol>
        </div>` + this.css;
    }
    css = `<link rel=stylesheet href=/basic.css>
    <style>
    #legend {
        display:block;
        text-align:right;
        font-size:.8em;
        margin:.1em;
    }
    #legend li {
        margin-right:.5em;
        display:inline-flex;align-items:center;
    }
    #board {
        padding:1rem .5rem;
        background:white;
    }
    #board ol {
        display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;
    }
    #board .indicator {
        margin-right:0;
        font-size:2em;
        position:relative;
    }
    #board .indicator::before {
        content:attr(for);
        position:absolute;right:-.2em;bottom:-.2em;
        font-size:.5em;
        width:1.2em;height:1.2em;
        text-align:center;line-height:1.2em;
        background:inherit;
        border-radius:9em;
    }
    #board input:checked+label::after {
        content:'🔰';
        font-size:.5em;
        line-height:1em;
        transform:rotate(45deg);
        position:absolute;right:-.6em;top:-.5em;
    }
    .idle {
        background:hsl(200,80%,80%);
    }
    .normal {
        background:hsl(120,80%,80%);
    }
    .warning {
        background:hsl(50,80%,80%);
    }
    #board section {
        display:none;
        text-align:left;
    }
    </style>`;

    attributeChangedCallback(attr, before, after) {
        if (attr == 'status')
            JSON.parse(after).forEach((s, i) => {
                const label = this.shadowRoot.querySelector(`ol li:nth-child(${i + 1}) label`);
                label?.classList.remove('normal', 'warning', 'error');
                label?.classList.add(s);
            });
    }
    async connectedCallback() {
        const devices = await (await fetch('/api/project/1/initialize')).json();
        
        this.board = this.shadowRoot.querySelector('ol');
        devices.forEach(d => {
            this.board.insertAdjacentHTML('beforeend', `<li><input type=radio name=device id=${d.id}><label for=${d.id} class='indicator'>🎤</label>`);
            this.parentElement.insertAdjacentHTML('beforeend', `<device-details hidden device=${d.id} location='${d.location}' threshold=${d.threshold}></device-details>`);
        });
        this.board.querySelectorAll('input').forEach((input, i) => input.onchange = () => input.checked ? this.details(i + 1) : null);
        this.setAttribute('status', JSON.stringify(devices.map(d => d.status)));
    }
    details(device) {
        Q(`device-details`, el => el.hidden = true);
        Q(`device-details:nth-of-type(${device})`).hidden = false;
        this.board.querySelectorAll(`li`).forEach(li => li.removeAttribute('selected'));
        this.board.querySelector(`li:nth-of-type(${device})`).setAttribute('selected', true);
    }
});

customElements.define('device-details', class extends HTMLElement {
    static observedAttributes = ['threshold'];
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <input type=radio name=section id=1>
        <input type=radio name=section id=2>
        <input type=radio name=section id=3>
        <gauge-meter min=30 max=120 limit=75 value></gauge-meter>
        <menu role=h4>
            <li title=place><label for=1>🗺️</label>
            <li title=audio><label for=2>🎤</label>
            <li title=video><label for=3>📹</label>
        </menu>
        <section id=place>
            <h5>Location<time></time></h5>
            <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=114.15215492248537%2C22.36349086898618%2C114.23704147338869%2C22.453869898715592&amp;layer=mapnik"></iframe>
            <h5>Date<input type=date></h5>
            <span class=input>
                <b>Distance</b>
                <label>Threshold<input type=number name=threshold><button>🖋</button></label>
            </span>
        </section>
        <section id=audio>
            <h5>Date<input type=date></h5>
            <div id=period>
                <label id=raw>Raw</label>
                <input type=radio name=period value=1 id=1-min checked><label for=1-min>1 min</label>
                <input type=radio name=period value=5 id=5-min><label for=5-min>5 min</label>
                <input type=radio name=period value=30 id=30-min><label for=30-min>30 min</label>
                <label id=csv>CSV</label>
                <span>Every min</span>
                <input type=checkbox id=rolling checked><label for=rolling></label>
            </div>
            <b></b>
        </section>
        <section id=video>
            <button class=action>Live stream</button>
            <h5>Date<input type=date></h5>
            <b></b>
            <ol></ol>
        </section>` + this.css;
    }
    css = `<link rel=stylesheet href=/basic.css>
    <link rel=stylesheet href=/device-details.css>`;
    place = {
        init: () => {
            this.place.supposed = this.getAttribute('location');
            this.place.threshold = this.place.section.querySelector('input[name=threshold]').value = this.getAttribute('threshold');
        },
        reset: () => this.place.section.querySelectorAll('figure,table').forEach(el => el?.remove()),
        review: async date => {
            const records = await (await fetch(`/api/GPS/${this.getAttribute('device')}/${date ?? '_'}`)).json();

            this.place.reset();
            this.place.section.appendChild(new Chart(records, 'distance', { threshold: this.place.threshold }).chart);
            this.place.section.appendChild(new Table(records, 'distance', { threshold: this.place.threshold, playback: 'location' }).table);
            this.place.section.querySelectorAll('td[data-coords]').forEach(td => td.onclick = this.place.playback);
        },
        playback: ev => {
            clearInterval(this.loop);
            this.scrollIntoView();
            this.place.section.querySelector('h5 time').textContent = this.place.section.querySelector('input[type=date]').value + ev.target.parentElement.querySelector('td:first-child').textContent;
            const [map, coords] = [this.place.section.querySelector('iframe'), JSON.parse(ev.target.getAttribute('data-coords'))];
            const [minX, minY, maxX, maxY] = [...[0, 1].map(i => Math.min(...coords.map(cs => cs.split(',')[i])) - .002), ...[0, 1].map(i => Math.max(...coords.map(cs => cs.split(',')[i])) + .002)];
            this.loop = setInterval(() => coords.forEach((cs, i) =>
                setTimeout(() => map.src = `https://www.openstreetmap.org/export/embed.html?bbox=${minY},${minX},${maxY},${maxX},&marker=${cs}`, i * 500)
            ), coords.length * 500 + 1000);
        },
        update: async content => {
            const resp = await fetchPut(`/api/device/${this.getAttribute('device')}/threshold`, content);
            if (resp.status == 200) {
                Object.entries(content).forEach(([a, v]) => this.setAttribute(a, v));
                this.place.review();
            }
        }
    }
    audio = {
        review: async date => {
            setTimeout(() => this.audio.section.querySelector('b').innerText = `Loading...`);
            let records = await fetch(`/api/audio/${this.getAttribute('device')}/${date ?? this.audio.getDate()}/${this.audio.getPeriod()}`);
            this.audio.reset();
            if (records.status == 500 || (records = await records.json()).length == 0)
                return this.audio.section.querySelector('b').innerText = records?.sqlMessage ?? 'No records';

            this.audio.section.querySelector('b').innerText = '';
            this.audio.section.appendChild(new Chart(records, `LAeq`, { threshold: 75, reverse: true }).chart);
            this.audio.section.appendChild(new Table(records, 'LAeq', { threshold: 75, every: true }).table);
            $(this.shadowRoot).find('#audio table').tablesorter();
            this.audio.section.querySelectorAll('tbody tr').forEach(tr => tr.onclick = this.audio.playback);

            this.audio.rolling();
            this.audio.section.querySelector('#rolling').onchange = this.audio.rolling;
        },
        playback: async ev => {
            Q('#popup').click();
            const [device, date, minute] = [this.getAttribute('device'), this.audio.getDate(), ev.target.parentElement.querySelector('td:first-child').innerText];
            Q('#popup+label').innerHTML = '<table>' + (await (await fetch(`/api/audio/${device}/${date}/${minute}/`)).json()).map(r => 
                `<tr><td>${r.level}<td style='--hue:calc(360/14*${r.class})'>${r.class}<td><button onclick='this.nextElementSibling.play()'>${r.time}</button>
                <audio src=https://ps1.hanlunil.com:3001/audio/p/ch${device}/${date == 'today' ? new Date().toISOString().substring(0, 10) : date}/${r.time.replace(/\:/g, '-')}.wav></audio>`
            ).join('');
        },
        rolling: () => {
            const n = this.audio.getPeriod();
            const checked = this.audio.section.querySelector('#rolling').checked;
            if (n > 1)
                this.audio.section.querySelectorAll(`#audio tbody tr:not(:nth-child(${n}n))`).forEach(tr => tr.hidden = !checked);
        },
        getDate: () => this.audio.section.querySelector('input[type=date]').value || 'today',
        getPeriod: () => this.audio.section.querySelector('input[name=period]:checked').value,
        reset: () => this.audio.section.querySelectorAll('figure,table').forEach(el => el?.remove()),
    }
    video = {
        streamStart: async () => {
            const stream = await (await fetchPost(`/api/device/stream`, { d: this.getAttribute('device') })).json();
            this.streamer = document.createElement('video');
            const player = flvjs.createPlayer({type: 'flv', url: stream.src});
            player.attachMediaElement(this.streamer);
            player.load();
            player.play();
            //this.streamer.src = stream.src;
            this.streamer.setAttribute('data-record', stream.record);
            this.shadowRoot.querySelector('#video button').insertAdjacentElement('afterend', this.streamer);
        },
        review: async date => {
            setTimeout(() => this.video.section.querySelector('b').innerText = `Loading...`);
            let files = await fetch(`https://ps1.hanlunil.com:3001/api/video/${this.getAttribute('device')}/${date ?? this.video.getDate()}`);
            if (files.status == 500 || (files = await files.json()).length == 0)
                return this.video.section.querySelector('b').innerText = 'No records';

            let audio = await (await fetch(`/api/audio/${this.getAttribute('device')}/${date ?? this.video.getDate()}/raw/`)).json();
            files = files.map(f => {
                const t = f.match(/\d{6}(?=\.)/)[0].replace(/(\d{2})(?=.)/g,'$1:');
                let i = audio.findIndex(({time}) => time == t);
                if (i == -1) 
                    i = audio.findIndex(({time}) => time == new Date(new Date(`2020-01-01 ${t}`).getTime() - 1000).toTimeString().substring(0, 8));
                if (i == -1)
                    i = audio.findIndex(({time}) => time == new Date(new Date(`2020-01-01 ${t}`).getTime() + 1000).toTimeString().substring(0, 8));                
                i == -1 && console.log(f);
                if (i > -1) 
                    audio = audio.slice(i);
                return [f, t, Math.round(audio[0].level * 10) / 10];
            });
            this.video.section.querySelector('ol').innerHTML = files.map(f => `<li id=${f[0]} title=${f[2]}>${f[1]}`).join('');
            this.video.section.querySelectorAll('ol li').forEach(li => li.onclick = this.video.playback);
            this.video.section.querySelector('b').innerText = '';
        },
        playback: async ev => {
            const [device, date, second] = [this.getAttribute('device'), this.video.getDate(), ev.target.innerText];
            Q('#popup').click();
            const src = `https://ps1.hanlunil.com:3001/video/ch${device}/${ev.target.id}`;
            Q('#popup+label').innerHTML = `<a href=${src} target=_blank></a><div id=video-wrap><video src=${src}></video></div>`;
            Q('#popup+label video').load();
            setTimeout(() => Q('#popup+label video').play(), 100);
            Q('#popup+label').insertAdjacentHTML('beforeend', '<table>' + (await (await fetch(`/api/audio/${device}/${date}/${second}/`)).json())
                .map(r => 
                `<tr><td>${r.level}<td style='--hue:calc(360/14*${r.class})'>${r.class}<td><button onclick='this.nextElementSibling.play()'>${r.time}</button>
                <audio src=https://ps1.hanlunil.com:3001/audio/p/ch${device}/${date == 'today' ? new Date().toISOString().substring(0, 10) : date}/${r.time.replace(/\:/g, '-')}.wav></audio>`
            ).join(''));
        },
        getDate: () => this.video.section.querySelector('input[type=date]').value || 'today',
    }
    connectedCallback() {
        ['place', 'audio', 'video'].forEach((s, i) => {
            this[s].section = this.shadowRoot.getElementById(s);
            const radio = this.shadowRoot.querySelector(`input[id='${i + 1}']`);
            const date = this[s].section.querySelector('input[type=date]');
            this.shadowRoot.querySelector(`menu li:nth-child(${i + 1})`).onclick = () => radio.checked ? radio.checked = false : !date.value ? this[s].review() : null;
            date.onchange = ev => this[s].review(ev.target.value);
        });
        this.place.section.querySelector('button').onclick = () => this.place.update({ threshold: this.shadowRoot.querySelector('input[name=threshold]').value });

        this.audio.section.querySelector('#raw').onclick = () => window.open(`/api/audio/${this.getAttribute('device')}/${this.audio.getDate()}/raw/`);
        this.audio.section.querySelector('#csv').onclick = () => {
            const a = document.createElement('a');
            [a.href, a.download] = [`/api/audio/${this.getAttribute('device')}/${this.audio.getDate()}/${this.audio.getPeriod()}/?csv`, `Device-${this.getAttribute('device')}-${this.audio.getDate()}-${this.audio.getPeriod()}-min.csv`];
            a.click();
        }
        this.audio.section.querySelectorAll('#period label[for$=min]').forEach(input => input.onclick = () => setTimeout(this.audio.review));

        this.video.section.querySelector('button').onclick = () => this.video.streamStart();
        this.attributeChangedCallback();
    }
    attributeChangedCallback() {
        setTimeout(() => this.place.init());
    }
});