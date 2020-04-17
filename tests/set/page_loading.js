module.exports = async function (t,p) {

    t.equal((await p.title()),'Tinro Test Page','Page is loaded');

}