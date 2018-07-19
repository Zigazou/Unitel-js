"use strict"

const unitelFile = document.getElementById('unitel-file')

unitelFile.addEventListener("change", handleUnitelFile, false);

function handleUnitelFile() {
    const fileList = this.files

    const reader = new FileReader()

    reader.onload = (event) => {
        const unitelDisk = new Unitel.UnitelDisk()
        unitelDisk.load(new Uint8Array(reader.result))
        console.log(unitelDisk.diskinfo())
        console.log(unitelDisk.index)
        console.log(unitelDisk.catalog())
    }

    reader.readAsArrayBuffer(fileList[0])
}
