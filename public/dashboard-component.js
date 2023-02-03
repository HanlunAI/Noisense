customElements.define('gauge-meter', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=/basic.css>
        <style>
        :host::after {
            content:attr(title);
            display:block;
            font-size:.8em;
            margin-bottom:1em;
            white-space:nowrap;
        }
        meter {
            all:unset;
            display:inline-block;
            width:5em;height:5em;
            --until:320deg;
            --threshold:calc((var(--limit) - var(--min))/(var(--max) - var(--min))*var(--until));
            background:conic-gradient(white 0deg,hsl(200,80%,60%),hsl(180,80%,60%),hsl(160,80%,60%),hsl(140,80%,60%),hsl(120,80%,60%),hsl(100,80%,60%),hsl(80,80%,60%),hsl(60,80%,60%),hsl(40,80%,60%),hsl(20,80%,60%),hsl(0,80%,60%),hsl(-20,80%,60%),hsl(-40,80%,60%) var(--until),white calc(var(--until) + 15deg) 360deg);
            border-radius:50%;border:.15rem inset silver;
            position:relative;
            color:silver;
        }
        :host(.limit) meter {
            background:conic-gradient(white 0deg,hsl(200,80%,60%),hsl(180,80%,60%),hsl(160,80%,60%),hsl(140,80%,60%),hsl(120,80%,60%),hsl(100,80%,60%),hsl(80,80%,60%),hsl(60,80%,60%),hsl(40,80%,60%) var(--threshold),hsl(0,80%,60%) var(--threshold),hsl(-20,80%,60%),hsl(-40,80%,60%) var(--until),white calc(var(--until) + 15deg) 360deg);
            border-radius:9em;
        }
        meter::before {
            content:attr(value);
            width:80%;height:80%;
            display:flex;justify-content:center;align-items:center;
            font-size:1.6em;color:inherit;
            position:absolute;left:50%;top:50%;
            transform:translate(-50%,-50%);
            background:white;
            border-radius:50%;border:.15rem outset silver;
        }
        meter::after {
            content:'';
            border-style:solid;
            border-width:0 .1em 2.5em .1em;
            border-color:transparent transparent black transparent;
            position:absolute;left:calc(50% - .1em);top:25%;
            transform:rotate(calc((var(--value) - var(--min))/(var(--max) - var(--min))*var(--until))) translate(0%,-1.1em);
            transition:transform .5s;
        }
        :host([discrete]) meter::after {
            transform:rotate(calc((var(--value) + 0.5)/(var(--max) + 1)*360deg)) translate(0%,-1.1em);
        }
        </style>
        <meter></meter>`;
    }
    connectedCallback() {
        ['min', 'max', 'limit', 'value'].forEach(attr => this.attributeChangedCallback(attr, null, this.getAttribute(attr)));
        this.hasAttribute('limit') && this.classList.add('limit');
        if (this.hasAttribute('discrete')) {
            const max = parseInt(this.getAttribute('max'));
            this.shadowRoot.querySelector('meter').style.background = 'conic-gradient(' +
                [...Array(max + 1).keys()].map(i => `hsl(${360 / (max + 1) * i},80%,60%) ${360 / (max + 1) * i}deg, hsl(${360 / (max + 1) * i},80%,60%) ${360 / (max + 1) * (i + 1)}deg`)
            + ')';
        }
    }
    attributeChangedCallback(attr, before, after) {
        after && this.style.setProperty(`--${attr}`, after);
        if (attr == 'value' && after) {
            this.shadowRoot.querySelector('meter').value = this.getAttribute('value');
            this.shadowRoot.querySelector('meter').style.color = parseFloat(after) > parseFloat(this.getAttribute('limit')) ? 'red' : 'silver';
        }
    }
    static observedAttributes = ['min', 'max', 'limit', 'value'];
});
customElements.define('stacked-bar', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=/basic.css>
        <style>
        :host {
            pointer-events:none;
        }
        #bar {
            width:100%;
            white-space:nowrap;
        }
        div {
            height:1em;
            background:hsl(var(--hue),60%,80%);
            margin:auto;
            display:inline-block;
            text-align:left;
        }
        div[title]:not([style^='width:0%'])::before {
            content:attr(title);
            letter-spacing:-.1em;
        }
        </style>
        <div id=bar></div>`;
    }
    connectedCallback() {
        this.attributeChangedCallback('proportion', null, this.getAttribute('proportion'));
    }
    attributeChangedCallback(attr, before, after) {
        after = Object.entries(JSON.parse(after));
        this.shadowRoot.querySelector('#bar').innerHTML = after.map(([type, proportion], i) =>
            `<div title='${type}' style='width:${proportion}%;--hue:${360 / after.length * i}'></div>`
        ).join('');
    }
    static observedAttributes = ['proportion'];
});