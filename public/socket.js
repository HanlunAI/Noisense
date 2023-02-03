const socket = io();
socket.on('status', devices => {
    const board = Q('device-status');
    if (devices[0].status) 
        board.setAttribute('status', JSON.stringify(devices.map(d => d.status)));
    devices.forEach((d, i) => {
        if (d.audio?.value) {
            const gauge = Q(`device-details:nth-of-type(${i+1})`)?.shadowRoot.querySelector('gauge-meter');
            gauge.setAttribute('value', Math.round(d.audio.value * 10) / 10);
            gauge.title = d.audio.lastTime;
        }
        Object.keys(d).forEach(item => {
            const indicator = Q(`device-details:nth-of-type(${i+1})`)?.shadowRoot.querySelector(`li[title=${item}]`);
            indicator?.classList.remove('normal', 'warning', 'error');
            indicator?.classList.add(d[item].status);
        });
    });
});