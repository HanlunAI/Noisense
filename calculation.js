module.exports = {
    distance: (c1, c2) => {
        if ([c1, c2].some(c => !/^\d+\.\d+,\s?\d+\.\d+$/.test(c))) return 1000;
        [c1, c2] = [c1.split(',').map(deg => deg * Math.PI / 180), c2.split(',').map(deg => deg * Math.PI / 180)];
        const a = Math.sin((c2[0] - c1[0]) / 2) ** 2 + Math.cos(c1[0]) * Math.cos(c2[0]) * Math.sin((c2[1] - c1[1]) / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(c * 6371000);
    },
    Leq: dBs => 10 * Math.log10(dBs.reduce((sum, dB) => sum += Math.pow(10, dB / 10), 0) / dBs.length)
}