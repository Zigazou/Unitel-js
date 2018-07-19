"use strict"
/**
 * @file make-catalog-entry.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * Make a catalog from a raw string.
 * @param {DiskGeometry} geometry Disk geometry
 * @param {string} raw Raw string
 * @return {ErrorMap|VolumeLabel|DataSet|EmptyEntry}
 */
Unitel.makeCatalogEntry = function(geometry, raw) {
    if(raw.length < 128) throw new Error(
        "not enough bytes for an entry in the disk directory"
    )

    if(raw.startsWith('ERMAP')) return new Unitel.ErrorMap(raw)

    if(raw.startsWith('VOL1')) return new Unitel.VolumeLabel(raw)

    if(raw.startsWith('HDR1') || raw.startsWith('DDR1')) {
        return new Unitel.DataSet(raw, geometry)
    }

    return new Unitel.EmptyEntry()
}
