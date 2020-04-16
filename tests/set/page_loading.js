module.exports = async function (t,p) {

    await p.goto(`http://localhost:5000`);
    t.equal((await p.title()),'Tinro Test Page','Page is loaded');
    
}