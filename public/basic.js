const Q = (el, func) => func ? document.querySelectorAll(el).forEach(func) : document.querySelector(el);
document.addEventListener('DOMContentLoaded', () => {
    Q('#nav li', li => li.onclick = () => window.location.hash = li.title);
    Q('#popup').onchange = ev => ev.target.checked ? Q('#popup+label').style.height = Q('html').scrollHeight + 'px' : null;
});

const Cookie = {
    get get() { return document.cookie.split(/;\s?/).map(c => c.split('=')).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}); },
    set: (key, value) => document.cookie = `${key}=${value}; max-age=22222222; path=/`,
};

const fetchPut = (href, body) => fetch(href, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
});
const fetchPost = (href, body) => fetch(href, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
});

window.addEventListener('DOMContentLoaded', () => {
});
const Stream = {
    start: async () => {
        (await (await fetchPost('/api/device/stream', { d: 'all' })).json()).forEach(d =>
            Q('#videos').insertAdjacentHTML('beforeend', `<video title=${d.id} src=${d.src} data-record=${d.record} autoplay></video>`)
        );
        Q('#stream button').title = 'playing';
    },
    stop: () => {
        Q('#videos video', async video => {
            await fetchPut(`/api/stream-end`, { record: video.getAttribute('data-record') });
            video.remove();
        });
        Q('#stream button').title = '';
    }
}

class Chart {
    constructor(data, which, op) {
        const stretcher = 3;
        [this.data, this.which] = [JSON.parse(JSON.stringify(op.reverse ? [...data].reverse() : data)), which];
        this.data.forEach(d => d[which] *= stretcher);
        op.threshold &&= op.threshold * stretcher;
        [this.max, this.count] = [Math.max(...this.data.map(d => d[which])), this.data.length];

        this.chart = document.createElement('figure');
        this.chart.innerHTML = `
            <svg viewBox='0 0 ${this.count} ${this.max - 35 * stretcher}' style='width:${this.count}px;${this.max < 100 ? `height:${this.max}px;` : ''}'></svg>
            <figcaption style='width:${this.count}px'>${this.labels(15)}</figcaption>`;

        this.chart.querySelector('svg').innerHTML = (op.threshold ? `<rect class=error x=0 width=100% y=0 height=${this.max - op.threshold > 0 ? this.max - op.threshold : 0}></rect>` : ``) +
            `<path d="${this.data.map(op.line ? this.line : this.bar).join(' ')}" />` +
            [...Array(14).keys()].map(l => `<line x1=2% y1=${this.max - 10 * (l + 1) * stretcher} x2=98% y2=${this.max - 10 * (l + 1) * stretcher}></line>`).join('') + 
            [...Array(14).keys()].map(l => [1, 99].map(x => `<text x=${x}% y=${this.max - 10 * (l + 1) * stretcher}>${10 * (l + 1)}</text>`).join('')).join('');
    }
    labels = n => [...new Array(n).keys()].map(p => p / n + .05).map(p => `<time style='left:${p * 100}%'>${this.data[Math.round(this.count * p)].time}</time>`).join('');
    line = (d, i) => d[this.which] ? `${i == 0 ? 'M' : 'L'} ${i},${this.max - d[this.which]}` : '';
    bar = (d, i) => d[this.which] ? `M ${i},${this.max} v -${d[this.which]}` : '';
}
class Criteria {
    constructor(criteria) {
        this.reset();
        this.criteria = criteria;
    }
    reset = () => {
        this.consecutive = this.start = this.end = false;
        this.playback = [];
        this.values = [];
    }
    returnNormal = () => {
        const content = {
            offline: this.values.filter(d => d).length == 0,
            ...this
        };
        this.reset();
        if (content.start)
            return content;
    }
    recordAbnormal = d => {
        this.consecutive ? this.end = d.time : this.start = d.time;
        this.consecutive = true;
        this.playback.push(d[Criteria.playback]);
        this.values.push(d[Criteria.which]);
    }
    verify = d => this.criteria(d);
}
class Table {
    constructor(data, which, op) {
        [Criteria.playback, Criteria.which] = [op?.playback, which];
        this.table = document.createElement('table');
        if (op.every) 
            return this.table.innerHTML = Table.tabulate(data);

        this.table.innerHTML = `
            <thead><th>Time<th>${[...which].map((l, i) => i === 0 ? l.toUpperCase() : l).join('')}${op?.playback ? '<th>▶️' : ''}${data[0].proportion ? '<th>Sources' : ''}</thead>
            <tbody></tbody>`;
        const normality = [op?.threshold ? new Criteria(d => d[which] <= op.threshold) : null, new Criteria(d => d[which] != null)].filter(c => c);
        for (const d of data)
            normality.forEach(cr => cr.verify(d) ? this.createRow(cr.returnNormal(), { proportion: d.proportion }) : cr.recordAbnormal(d));
    }
    createRow(content, { proportion }) {
        console.log(proportion)
        if (!content) return;
        this.table.querySelector('tbody').insertAdjacentHTML('beforeend', `<tr>
            <td>${content.start}${content.end ? ` ~ ${content.end}` : ''}
            <td>${content.offline ? 'Error' : `${Math.min(...content.values)} ~ ${Math.max(...content.values)}`}` +
            (proportion ? `<td>${Table.stack(proportion)}` :
                `<td ${content.offline ? '>' : `data-coords='${JSON.stringify(content.playback)}'>📍`}`)
        );
    }
    static tabulate = data => `<thead><th>${Table.replace(Object.keys(data[0])).join('<th>')}<tbody><tr><td>${data.filter(d => d.n === undefined || d.n > 0).map(d => Object.values(d).map(v => Array.isArray(v) ? Table.stack(v) : v).join('<td>')).join('<tr><td>')}`;
    static stack = proportion => `<stacked-bar proportion='${JSON.stringify(proportion.reduce((obj, percent, i) => ({ ...obj, [i]: percent }), {}))}'></stacked-bar>`;
    static replace = terms => [terms].flat().map(t => t.replace('Aeq', '<sub>Aeq</sub>'));
}