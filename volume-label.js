"use strict"
/**
 * @file volume-label.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * Class representing a volume label in the disk directory.
 */
Unitel.VolumeLabel = class {
    constructor(raw) {
        /**
         * Volume label identifier (usually "IBMIRD").
         * @member {string}
         */
        this.label = ""

        /**
         * Indicates if the volume is locked or not.
         * @member {boolean}
         */
        this.locked = false

        /**
         * Owner identifier.
         * @member {string}
         */
        this.owner = ""

        /**
         * Side count (1 or 2).
         * @member {number}
         */
        this.sides = 1

        /**
         * Indicates if the disk uses double density (true) or simple density
         * (false).
         * @member {boolean}
         */
        this.doubleDensity = false

        /**
         * Bytes per sector (a multiple of 128)
         * @member {number}
         */
        this.bytesPerSector = 128

        /**
         * Sector sequence used to record sectors (1 to 13)
         * @member {number}
         */
        this.sectorSequence = 1

        /**
         * Indicates if the disk uses an IBM label (true) or not (false).
         * @member {boolean}
         */
        this.labelStandard = true

        this.parse(raw)
    }

    /**
     * Parse a raw string and extract information.
     * @param {string} raw String from which to extract the volume label.
     * @private
     */
    parse(raw) {
        // A volume label occupies at least 128 bytes
        if(raw.length < 128) throw new Error(
            "not enough bytes for a volume label"
        )

        // A volume label occupies at least 128 bytes
        if(!raw.startsWith('VOL1')) throw new Error(
            "magic number VOL1 not found"
        )

        // Volume label
        this.label = raw.substr(4, 6).trim()

        // Locked state
        if(raw.substr(10, 1) !== ' ') {
            this.locked = true
        }

        // Owner identifier
        this.owner = raw.substr(37, 14).trim()

        // Number of sides and recording density
        switch(raw.substr(71, 1)) {
            case 'M': this.doubleDensity = true
            case '2': this.sides = 2
            default:
        }

        // Bytes per sector
        switch(raw.substr(75, 1)) {
            case '1':
                this.bytesPerSector = 256
                break

            case '2':
                this.bytesPerSector = 512
                break

            case '3':
                this.bytesPerSector = 1024
                break

            default:
        }

        // Physical sector sequence
        if(raw.substr(76, 2) !== '  ') {
            this.sectorSequence = parseInt(raw.substr(76, 2))
        }

        // Label standard
        if(raw.substr(79, 1) !== 'W') {
            this.labelStandard = false
        }
    }
}