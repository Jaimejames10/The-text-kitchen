const processingOrder = [
    "av_comarapa",
    "comarapa",
    "saipina",
    "san_isidro",
    "los_negros",
    "santa_cruz",
    "omereque",
    "cochabamba",
];

const officeRules = {
    comarapa: {
        code: "10",
        office: "OF. CENTRAL"
    },

    saipina: {
        code: "11",
        office: "AGENCIA SAIPINA"
    },

    san_isidro: {
        code: "12",
        office: "AGENCIA SAN ISIDRO"
    },

    los_negros: {
        code: "13",
        office: "AGENCIA LOS NEGROS"
    },

    santa_cruz: {
        code: "14",
        office: "AGENCIA SANTA CRUZ"
    },

    omereque: {
        code: "15",
        office: "OF. EXTERNA OMEREQUE"
    },

    cochabamba: {
        code: "16",
        office: "AGENCIA COCHABAMBA"
    },

    av_comarapa: {
        code: "19",
        office: "AGENCIA AV. COMARAPA"
    }
};

let processedFiles = {};

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

const totalRecords =
    document.getElementById("totalRecords");

const agencyList =
    document.getElementById("agencyList");

const downloadTxt =
    document.getElementById("downloadTxt");

const downloadIcccm =
    document.getElementById("downloadIcccm");

renderAgencyStatus();

dropZone.addEventListener("dragover", e => {
    e.preventDefault();
});

dropZone.addEventListener("drop", e => {

    e.preventDefault();

    handleFiles(
        Array.from(e.dataTransfer.files)
    );

});

fileInput.addEventListener("change", e => {

    handleFiles(
        Array.from(e.target.files)
    );

});

async function handleFiles(files){

    processedFiles = {};

    let total = 0;

    for(const file of files){

        const office =
            detectOffice(file.name);

        if(!office){
            continue;
        }

        const content =
            await readFile(file);

        let lines = content
            .split(/\r?\n/)
            .filter(line => line.trim());

        // eliminar encabezado
        lines = lines.slice(1);

        const processedLines = [];

        for(const line of lines){

            const columns = line.split(',');

            if(columns.length !== 8){
                continue;
            }

            const rule =
                officeRules[office];

            columns[2] = rule.code;
            columns[4] = rule.office;

            processedLines.push(

                columns
                    .map(v => `"${v.trim()}"`)
                    .join(',')

            );

            total++;

        }

        processedFiles[office] =
            processedLines;

    }

    totalRecords.textContent = total;

    renderAgencyStatus();

    validateFiles();

}

function normalizeFilename(filename){

    return filename
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[\-\.]+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

function detectOffice(filename){

    const normalizedFile =
        normalizeFilename(filename);

    const compactFile =
        normalizedFile.replace(/_/g, "");

    for(const office of processingOrder){

        const compactOffice =
            office.replace(/_/g, "");

        if(
            normalizedFile.includes(office) ||
            compactFile.includes(compactOffice)
        ){
            return office;
        }
    }

    return null;
}

function readFile(file){

    return new Promise(resolve => {

        const reader =
            new FileReader();

        reader.onload =
            e => resolve(e.target.result);

        reader.readAsText(file);

    });

}

function renderAgencyStatus(){

    agencyList.innerHTML = "";

    processingOrder.forEach(office => {

        const li =
            document.createElement("li");

        li.innerHTML =
            processedFiles[office]
                ? `🟢 ${office}`
                : `🔴 ${office}`;

        agencyList.appendChild(li);

    });

}

function validateFiles(){

    const missing =
        processingOrder.filter(
            office => !processedFiles[office]
        );

    const ok =
        missing.length === 0;

    downloadTxt.disabled = !ok;
    downloadIcccm.disabled = !ok;

}

function buildFinalContent(){

    const finalProcessingOrder = [
        "comarapa",
        "saipina",
        "san_isidro",
        "los_negros",
        "santa_cruz",
        "omereque",
        "cochabamba",
        "av_comarapa",
    ];

    const finalLines = [];

    finalProcessingOrder.forEach(office => {

        if(processedFiles[office]){

            finalLines.push(
                ...processedFiles[office]
            );

        }

    });

    return finalLines.join("\n");

}

function download(extension){

    const content =
        buildFinalContent();

    const blob =
        new Blob(
            [content],
            {type:"text/plain"}
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    const now =
        new Date()
            .toISOString()
            .slice(0,10)
            .replaceAll("-","");

    link.download =
        `Consolidado_ICCCM_${now}.${extension}`;

    link.click();

}

downloadTxt.addEventListener(
    "click",
    () => download("txt")
);

downloadIcccm.addEventListener(
    "click",
    () => download("ICCCM")
);
