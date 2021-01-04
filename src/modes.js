let HISTORY = 1;
let HASH = 2;
let MEMORY = 3;
let OFF = 4;

function run(mode,fnHistory,fnHash,fnMemory){
    return mode === HISTORY 
        ? fnHistory && fnHistory()
        : mode === HASH
            ? fnHash && fnHash()
            : fnMemory && fnMemory()
}

function getDeafault(){
    return !window || window.location.pathname === 'srcdoc' ? MEMORY : HISTORY;
}

export default {
    HISTORY,
    HASH,
    MEMORY,
    OFF,
    run,
    getDeafault
}