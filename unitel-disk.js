"use strict"
/**
 * @file unitel-disk.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * Class representing an error map in the disk directory.
 */
Unitel.UnitelDisk = class {
    constructor() {
        /**
         * The raw string containing the entire disk after its conversion from
         * EBCDIC to Videotex. Videotex contains only valid ASCII characters,
         * it is then safe to manipulate it with a Javascript string.
         * @member {string}
         */
        this.bytes = ""

        /**
         * Complete catalog of disk directory.
         * @member {Object[]}
         */
        this.index = []

        /**
         * Disk geometry.
         * @member {DiskGeometry}
         */
        this.geometry = new Unitel.DiskGeometry(
            Unitel.defaultTracks,
            Unitel.defaultSectors,
            Unitel.defaultSectorSize
        )
    }

    /**
     * Extract bytes from a Unitel disk.
     * @param {SectorAddress} fromSector Starting sector 
     * @param {number} length Length in bytes
     * @return {string}
     */
    getBytes(fromSector, length) {
        if(length <= 0) throw new RangeError("Null or negative length")

        return this.bytes.substr(fromSector.offset(), Math.floor(length))
    }

    /**
     * Read the entire disk directory in the index attribute.
     * @private
     */
    readIndex() {
        this.index = []
        for(let sector = 1; sector <= this.geometry.sectorsPerTrack; sector++) {
            const entry = this.getBytes(
                new Unitel.SectorAddress(this.geometry, 0, sector),
                this.geometry.bytesPerSector
            )

            this.index.push(Unitel.makeCatalogEntry(this.geometry, entry))
        }

        return this
    }

    /**
     * Checks that a disk is valid or not
     */
    assertValidDisk() {
        if(!(this.index[4] instanceof Unitel.ErrorMap)) {
            throw new Error("Invalid disk image, error map not found")
        }

        if(!(this.index[6] instanceof Unitel.VolumeLabel)) {
            throw new Error("Invalid disk image, volume label not found")
        }

        return this
    }

    /**
     * Load a Unitel disk from a string
     * @param {Uint8Array} raw The raw data containing the Unitel disk image
     */
    load(unitelRaw) {
        // Loads the Unitel EBCDIC bytes
        if(unitelRaw.length < this.geometry.trackSize()) {
            throw new Error("Invalid IBM3740 disk image, no catalog")
        }

        // Convert the Unitel EBCDIC bytes to Unitel VDT bytes
        this.bytes = Unitel.ebcdicToVdt(unitelRaw)

        return this.readIndex()
                   .assertValidDisk()
    }

    /**
     * Return the list of non deleted data sets.
     * 
     */
    dir() {
        const entries = []
        this.index.forEach(entry => {
            if(!(entry instanceof Unitel.DataSet) || entry.deleted) return

            entries.push(entry)
        })

        return entries
    }

    /**
     * Get the content of a data set given its identifier.
     * @param {string} name 
     * @return {string}
     */
    getFile(name) {
        const entry = this.dir().find(x => x.identifier == name)

        if(typeof(entry) === 'undefined') throw new Error("Data set not found")

        return this.bytes.substring(
            entry.beginningOfExtent.offset(),
            entry.endOfExtent.lastOffset() + 1
        )
    }

    /**
     * Get the Volume label entry of the disk directory.
     * @return {VolumeLabel}
     */
    diskinfo() {
        const entry = this.index.find(x => x instanceof Unitel.VolumeLabel)

        if(typeof(entry) === 'undefined') {
            throw new Error("Volume label not found")
        }

        return entry
    }

    /**
     * Return a list of { offset: number, length: number } of Videotex pages
     * contained on a Unitel disk.
     * @return {Object[]}
     */
    catalog() {
        const catalog = this.getFile("FICMAC")

        const pages = []

        // Pages are grouped on several screens
        Unitel.ficmacScreenOffsets.forEach(screen => {
            const entries = catalog.substr(screen.offset, screen.count * 0x40)

            // Get every page of the current screen
            for(let i = 0; i < screen.count; i++) {
                let entry = entries.substr(i * 0x40, 0x40)

                // First digit indicates if the page is used or not
                if(entry.substr(24, 1) === '0') continue

                let offset = new Unitel.SectorAddress(this.geometry)
                offset.fromUnitel(entry.substr(25, 4))

                let length = parseInt(entry.substr(29, 4), 16)

                pages.push({ offset: offset, length: length })
            }
        })

        return pages
    }
}
