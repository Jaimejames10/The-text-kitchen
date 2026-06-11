const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("fileInput");

const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const lineCount = document.getElementById("lineCount");

const downloadTxt = document.getElementById("downloadTxt");
const downloadIcccm = document.getElementById("downloadIcccm");

let convertedContent = "";
let originalName = "";


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

        convertedContent = lines.map((line, index) => {

            const columns = line.split(',');

            // Validar cantidad de columnas
            if (columns.length !== 8) {

                invalidas++;

                errores.push(
                    `Línea ${index + 1}: ${columns.length} columnas`
                );

                return null;
            }

            validas++;

            // Aplicar reglas según el nombre del archivo
            for (const officeKey in officeRules) {

                if (fileNameLower.includes(officeKey)) {

                    columns[2] = officeRules[officeKey].code;
                    columns[4] = officeRules[officeKey].office;

                    break;
                }
            }

            return columns
                .map(field => `"${field.trim()}"`)
                .join(',');

        })
        .filter(line => line !== null)
        .join('\n');

        // Estadísticas
        lineCount.textContent = validas;

        // Mostrar sólo las primeras 100 líneas
        preview.value = convertedContent
            .split('\n')
            .slice(0, 100)
            .join('\n');

        // Si tienes un textarea para errores
        const erroresElement = document.getElementById("errores");

        if (erroresElement) {

            erroresElement.value = errores.length
                ? errores.join('\n')
                : 'Sin errores';
        }

        downloadTxt.disabled = false;
        downloadIcccm.disabled = false;

        console.log(`Válidas: ${validas}`);
        console.log(`Inválidas: ${invalidas}`);

    };

    reader.readAsText(file);
}


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