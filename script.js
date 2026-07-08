const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("fileInput");

const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const lineCount = document.getElementById("lineCount");

const downloadTxt = document.getElementById("downloadTxt");
const downloadIcccm = document.getElementById("downloadIcccm");
const downloadExcel = document.getElementById("downloadExcel");

const formatRadios = document.querySelectorAll('input[name="format"]');

let convertedContent = "";
let originalName = "";
let useQuotes = true;
let parsedData = [];


// ==========================
// Drag & Drop
// ==========================

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if(file){
        processFile(file);
    }

});

fileInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if(file){
        processFile(file);
    }

});


// ==========================
// Procesamiento
// ==========================

// function processFile(file){

//     originalName = file.name;

//     fileName.textContent = file.name;

//     const reader = new FileReader();

//     reader.onload = function(event){

//         const content = event.target.result;

//         const lines = content
//             .split(/\r?\n/)
//             .filter(line => line.trim() !== '');

//         // lineCount.textContent = lines.length;

//         // convertedContent = lines.map(line => {

//         //     return line
//         //         .split(',')
//         //         .map(field => `"${field.trim()}"`)
//         //         .join(',');

//         // }).join('\n');

//         const officeRules = {
//             omereque: {
//                 code: "15",
//                 office: "OFICINA EXTERNA OMEREQUE"
//             },
//             mizque: {
//                 code: "16",
//                 office: "OFICINA EXTERNA MIZQUE"
//             },
//             aiquile: {
//                 code: "17",
//                 office: "OFICINA EXTERNA AIQUILE"
//             }
//         };

//         const isOmereque = file.name
//     .toLowerCase()
//     .includes("omereque");

// convertedContent = lines.map((line, index) => {

//     const columns = line.split(',');

//     if(columns.length !== 8){
//         return null;
//     }

//     // Regla especial para archivos de Omereque
//     if(isOmereque){

//         columns[2] = "15"; // columna 3

//         columns[4] = "OFICINA EXTERNA OMEREQUE"; // columna 5

//     }

//     return columns
//         .map(field => `"${field.trim()}"`)
//         .join(',');

// })
// .filter(line => line !== null)
// .join('\n');

//         preview.value = convertedContent;

//         downloadTxt.disabled = false;
//         downloadIcccm.disabled = false;

//     };

//     reader.readAsText(file);

// }

function processFile(file) {

    originalName = file.name;

    fileName.textContent = file.name;

    const officeRules = {
        omereque: {
            code: "15",
            office: "OF. EXTERNA OMEREQUE"
        },
        saipina: {
            code: "11",
            office: "AGENCIA SAIPINA"
        },
        avenida: {
            code: "19",
            office: "AGENCIA AV. COMARAPA"
        }
    };

    const reader = new FileReader();

    reader.onload = function (event) {

        const content = event.target.result;

        const lines = content
            .split(/\r?\n/)
            .filter(line => line.trim() !== '');

        let validas = 0;
        let invalidas = 0;
        let errores = [];

        const fileNameLower = file.name.toLowerCase();

        parsedData = [];

        lines.forEach((line, index) => {

            const columns = line.split(',');

            if (columns.length !== 8) {

                invalidas++;

                errores.push(
                    `Línea ${index + 1}: ${columns.length} columnas`
                );

                return;
            }

            validas++;

            for (const officeKey in officeRules) {

                if (fileNameLower.includes(officeKey)) {

                    columns[2] = officeRules[officeKey].code;
                    columns[4] = officeRules[officeKey].office;

                    break;
                }
            }

            parsedData.push(columns.map(field => field.trim()));
        });

        applyFormat();

        // Si tienes un textarea para errores
        const erroresElement = document.getElementById("errores");

        if (erroresElement) {

            erroresElement.value = errores.length
                ? errores.join('\n')
                : 'Sin errores';
        }

        downloadTxt.disabled = false;
        downloadIcccm.disabled = false;
        downloadExcel.disabled = false;

        console.log(`Válidas: ${validas}`);
        console.log(`Inválidas: ${invalidas}`);

    };

    reader.readAsText(file);
}


// ==========================
// Formato (comillas / sin comillas)
// ==========================

function applyFormat() {

    convertedContent = parsedData
        .map(row => row
            .map(field => useQuotes ? `"${field}"` : field)
            .join(',')
        )
        .join('\n');

    // Estadísticas
    lineCount.textContent = parsedData.length;

    // Mostrar sólo las primeras 100 líneas
    preview.value = convertedContent
        .split('\n')
        .slice(0, 100)
        .join('\n');

}

formatRadios.forEach(radio => {
    radio.addEventListener("change", () => {

        document.querySelectorAll(".format-option").forEach(el => {
            el.classList.remove("active");
        });

        radio.closest(".format-option").classList.add("active");

        useQuotes = radio.value === "quoted";

        if (parsedData.length) {
            applyFormat();
        }

    });
});

// ==========================
// Descargas
// ==========================

function downloadFile(extension){

    const blob = new Blob(
        [convertedContent],
        {type:'text/plain'}
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    const baseName = originalName.replace(/\.[^/.]+$/, "");

    link.download = `${baseName}_convertido.${extension}`;

    link.click();

    URL.revokeObjectURL(link.href);
}

downloadTxt.addEventListener("click", () => {
    downloadFile("txt");
});

downloadIcccm.addEventListener("click", () => {
    downloadFile("ICCCM");
});

function formatDate(value) {

    if (typeof value !== "string") return value;

    const parts = value.split(/[-\/]/);

    if (parts.length === 3) {

        let [a, b, c] = parts;

        if (a.length === 4) {

            return `${c}/${b}/${a}`;
        }

        return `${a}/${b}/${c}`;
    }

    return value;
}

downloadExcel.addEventListener("click", () => {

    if (typeof XLSX === "undefined") return;

    const dateCols = new Set([1, 3]);

    const data = parsedData.map(row =>
        row.map((cell, i) => dateCols.has(i) ? formatDate(cell) : cell)
    );

    const header = ["CODENVIO", "FECHACORTE", "CODPAF", "FECHAATENCION", "DESCRIPCIONPAF", "TOTALFICHASCAJA", "NAC", "N30"];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    const baseName = originalName.replace(/\.[^/.]+$/, "");

    XLSX.writeFile(wb, `${baseName}_convertido.xlsx`);

});