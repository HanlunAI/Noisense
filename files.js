const exp = require('express');
const app = exp();
const cp = require('child_process');
cp.exec(`echo 1047alfh | sudo -S /root/trigger2.php`);
setInterval(() => {
    cp.exec(`echo 1047alfh | sudo -S /root/trigger4.php`);
    cp.exec(`echo 1047alfh | sudo -S /root/trigger2.php`);
}, 120*1000);

app.use(require('cors')());
const fs = require('fs');
const today = () => {
    let today = new Date();
    return `${1900 + today.getYear()}-${(1 + today.getMonth() + '').padStart(2, '0')}-${(today.getDate() + '').padStart(2, '0')}`;
}

const files = (path, device) => new Promise(res => 
    fs.readdir(`${path}/${device}/${today()}/`, (er, files) =>
        res(`<table id=${device}>` + (files ?? []).reverse().slice(0, 2000).map(f => `<tr><td><a href=/audio/p/${device}/${today()}/${f}>${f}</a><td>${fs.statSync(`${path}/${device}/${today()}/${f}`).mtime}`).join('') + `</table>`)
    )
);
const filesV = (path, device) => new Promise(res => !device ? 
    fs.readdir(path, (er, files) =>
        res((files ?? []).reverse().slice(0, 2000).map(f => ({f: f, mtime: fs.statSync(`${path}/${f}`).mtime})))
    ) :
    fs.readdir(`${path}/${device}/`, (er, files) =>
        res(`<table id=${device}>` + (files ?? []).reverse().slice(0, 2000).map(f => `<tr><td><a href=/video/${device}/${f}>${f}</a><td>${fs.statSync(`${path}/${device}/${f}`).mtime}`).join('') + `</table>`)
    )
);
const page = async path => `<!doctype html>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=1">
    <style>body>a[href]{display:inline-block;margin:0 .5em;font-size:2em;} table:not(:target){display:none;}</style>
    <time>${today()}</time><a href=/audio/p/>Processed</a><a href=/audio/u/>Unprocessed</a>` + 
    [1, 2, 3, 4].map(d => `<a href=#ch${d}>ch${d}</a>`).join('') + 
    (await Promise.all([1, 2, 3, 4].map(d => files(path, `ch${d}`)))).join('');

const pageV = async path => `<!doctype html>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=1">
    <style>body>a[href]{display:inline-block;margin:0 .5em;font-size:2em;} table:not(:target){display:none;}</style>
    <time>${today()}</time><a href=/audio/p/>Processed</a><a href=/audio/u/>Unprocessed</a>` + 
    [1, 2, 3, 4].map(d => `<a href=#ch${d}>ch${d}</a>`).join('') + 
    (await Promise.all([1, 2, 3, 4].map(d => filesV(path, `ch${d}`)))).join('');

app.get('/audio/p/', async (_, resp) => resp.end(await page(`../drchoi/htdocs/__processed__`)));
app.get('/audio/u/', async (_, resp) => resp.end(await page(`../drchoi/htdocs/__broadcasting__`)));
app.use(`/audio/p/`, exp.static(`../drchoi/htdocs/__processed__/`));
app.use(`/audio/u/`, exp.static(`../drchoi/htdocs/__broadcasting__/`));

app.get('/video/', async ({query}, resp) => query.d ? 
    resp.json(await filesV(`../drchoi/htdocs/video/ch${query.d}/`)) : 
    resp.end(await pageV(`../drchoi/htdocs/video`))
);
app.get('/api/video/:device/:date/', async ({ params: {device, date}}, resp) => {
    date = (date == 'today' ? today() : date).replace(/\-/g, '');
    const files = (await new Promise( res => fs.readdir(`../drchoi/htdocs/video/ch${device}/`, (er, files) => res(er ? [] : files)) ))
        .filter(f => f.indexOf(date) == 0).reverse();
    resp.json(files);
});
app.use(`/video/`, exp.static(`../drchoi/htdocs/video/`));

app.get('/api/audio/:device/:date/:minute/', async ({ params: {device, date, minute} }, resp) => {
    [date, minute] = [date == 'today' ? today() : date, minute.replace(':', '-')];
    const files = (await new Promise( res => fs.readdir(`../drchoi/htdocs/__processed__/ch${device}/${date}/`, (er, files) => res(er ? [] : files)) ))
        .filter(f => f.indexOf(minute) == 0).map(f => `${date}/${f}`);
    resp.json(files);
});

const cred = {
    key: fs.readFileSync("../certs/hanlunil.com/privkey.pem"),
    cert: fs.readFileSync("../certs/hanlunil.com/cert.pem")
};
require('https').createServer(cred, app).listen(3001, () => console.log('On 3001'));