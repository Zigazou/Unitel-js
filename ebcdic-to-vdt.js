"use strict"
/**
 * @file ebcdic-to-vdt.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * Convert an EBCDIC raw string to a Videotex raw string.
 * @param {Uint8Array} raw The EBCDIC raw data to convert to Videotex
 * @return {string}
 */
Unitel.ebcdicToVdt = function(raw) {
    let converted = ""
    for(let i = 0; i < raw.length; i++) {
        converted += String.fromCharCode(
            Unitel.ebcdicToVdtLUT[raw[i]]
        )
    }

    return converted
}