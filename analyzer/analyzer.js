"use strict"
/**
 * @file analyzer.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Analyzer
 */ 
const Analyzer = {}

/**
 * Analyze a Unitel disk and display the result on the page
 * @param {UnitelDisk} unitelDisk 
 */
Analyzer.analyzeUnitelDisk = function(unitelDisk) {
    // Make results visible
    document.getElementById('results').className = ""

    // Display Volume information
    const volume = unitelDisk.diskinfo()

    document.getElementById('volume-label')
            .innerHTML = volume.label

    document.getElementById('volume-locked')
            .innerHTML = volume.locked ? "yes" : "no"

    document.getElementById('volume-owner')
            .innerHTML = volume.owner

    document.getElementById('volume-sides')
            .innerHTML = volume.sides

    document.getElementById('volume-density')
            .innerHTML = volume.doubleDensity ? "yes" : "no"

    document.getElementById('volume-bps')
            .innerHTML = volume.bytesPerSector

    document.getElementById('volume-sequence')
            .innerHTML = volume.sectorSequence

    document.getElementById('volume-standard')
            .innerHTML = volume.labelStandard ? "IBM" : "not IBM"

    // Directory
    let output = ""
    for(let entry of unitelDisk.dir()) {
        output += '<h2>' + entry.identifier + '</h2>'
                + '<p><strong>Block length/Physical record length:</strong> '
                + entry.blockLength.toString() + '/'
                + entry.physicalRecordLength.toString() + '</p>'
                + '<p><strong>Beginning of extent:</strong> '
                + entry.beginningOfExtent.offset().toString(16) + '</p>'
                + '<p><strong>End of extent/End of data:</strong> '
                + entry.endOfExtent.offset().toString(16) + '/'
                + entry.endOfData.offset().toString(16) + '</p>'
                + '<p><strong>Restricted access:</strong> '
                + (entry.restricted ? "yes" : "no") + '</p>'
                + '<p><strong>Write protected:</strong> '
                + (entry.writeProtect ? "yes" : "no") + '</p>'
                + '<p><strong>Bypass:</strong> '
                + (entry.bypass ? "yes" : "no") + '</p>'
    }

    document.getElementById('directory')
            .innerHTML = output

    // Dumps of all Videotex pages contained by the disk
    const catalog = unitelDisk.catalog()
    for(let i = 0; i < catalog.length; i++) {
        document.getElementById('catalog-' + (i + 1).toString())
                .innerHTML = Analyzer.hexadecimalDump(
                    unitelDisk.bytes.substr(
                        catalog[i].offset.offset(),
                        catalog[i].length
                    )
                )
    }
}

/**
 * Given a string, displays a canonical hexadecimal dump
 * @member {string} raw Raw data to dump
 * @return {string} HTML code to insert wherever it is relevant
 */
Analyzer.hexadecimalDump = function(raw) {
    const hexDigits = "0123456789ABCDEF"

    let output = ""

    output += '<div class="hex-dump">'
    for(let address = 0; address < raw.length; address += 16) {
        output += '<div class="hx-row">'

        // Address
        output += '<span class="hx-address">'
        output += ("0000" + address.toString(16)).substr(-4)
        output += '</span> '

        // Values as hexadecimal
        for(let offset = 0; offset < 16; offset++) {
            let value = raw.charCodeAt(address + offset)
            if(address + offset < raw.length) {
                if(value < 0x20) {
                    output += '<span class="hx-hx-ctrl">'
                } else {
                    output += '<span class="hx-hx-std">'
                }

                output += ("00" + value.toString(16)).substr(-2)
                output += '</span> '
            } else {
                output += '<span class="hx-hx-no">&nbsp;&nbsp;</span> '
            }
        }

        // Values as characters
        for(let offset = 0; offset < 16; offset++) {
            let value = raw.substr(address + offset, 1)
            if(value == "") {
                output += '<span class="hx-ch-no">&nbsp;</span>'
            } else if(value < " ") {
                output += '<span class="hx-ch-ctrl">.</span>'
            } else {
                output += '<span class="hx-ch-std">' + value + '</span>'
            }
        }

        output += '</div>'
    }
    output += '</div>'

    return output
}

/**
 * An event listener called when the user selects a file.
 * @param {Event} event 
 */
Analyzer.onFileSelection = function(event) {
    const reader = new FileReader()

    reader.onload = (event) => {
        const unitelDisk = new Unitel.UnitelDisk()
        unitelDisk.load(new Uint8Array(reader.result))
        Analyzer.analyzeUnitelDisk(unitelDisk)
    }

    reader.readAsArrayBuffer(this.files[0])
}

document.getElementById('unitel-file')
        .addEventListener("change", Analyzer.onFileSelection, false)
