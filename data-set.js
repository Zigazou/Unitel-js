"use strict"
/**
 * @file data-set.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * Class representing a data set in the disk directory.
 */
Unitel.DataSet = class {
    /**
     * Creates a DataSet.
     * @param {string} raw String from which to extract data
     * @param {DiskGeometry} geometry Disk geometry used
     */
    constructor(raw, geometry) {
        /**
         * Tells if the data set is deleted (true) or used (false).
         * @member {boolean}
         */
        this.deleted = false

        /**
         * Data set identifier.
         * @member {string}
         */
        this.identifier = ""

        /**
         * Block length from 1 to sector size, 80 by default.
         * @member {number}
         */
        this.blockLength = 80

        /**
         * Indicates if the record is blocked (true) or not (false)
         * @member {boolean}
         */
        this.blockedRecord = false

        /**
         * Indicates if the record is spanned (true) or not (false)
         * @member {boolean}
         */
        this.spannedRecord = false

        /**
         * Sector address of the beginning of extent, the actual first sector
         * of the record.
         * @member {SectorAddress}
         */
        this.beginningOfExtent = new Unitel.SectorAddress(geometry)

        /**
         * Physical record length in bytes, usually matches the sector size,
         * 128 by default.
         * @member {number}
         */
        this.physicalRecordLength = 128

        /**
         * End of extent is the last sector containing data for the record.
         * A record reserve more space than it actually requires.
         * @member {SectorAddress}
         */
        this.endOfExtent = new Unitel.SectorAddress(geometry)

        /**
         * Indicates if the record is fixed length (true) or not (false)
         * @member {boolean}
         */
        this.fixedLength = true

        /**
         * Indicates if a copy of the disk should ignore (true) or copy (false)
         * this record.
         * @member {boolean}
         */
        this.bypass = false

        /**
         * Indicates if the access to the record is restricted (true) or not
         * (false).
         * @member {boolean}
         */
        this.restricted = false

        /**
         * Indicates if the record is write protected (true) or not (false).
         * @member {boolean}
         */
        this.writeProtect = false

        /**
         * Indicates if the record spans over several volumes (true) or not
         * (false).
         * @member {boolean}
         */
        this.multiVolume = false

        /**
         * Indicates the sequence number of the record in a multi volume case.
         * -1 means no sequence number.
         * @member {number}
         */
        this.sequenceNumber = -1

        /**
         * Creation date of the record in YYMMDD format. An empty string means
         * no creation date.
         * @member {string}
         */
        this.creationDate = ""

        /**
         * Record length in bytes, usually same as the block length.
         * @member {number}
         */
        this.recordLength = this.blockLength

        /**
         * Expiration date of the record in YYMMDD format. An empty string means
         * no expiration date.
         * @member {string}
         */
        this.expirationDate = ""

        /**
         * End of data, last sector (excluded) used by the record.
         * @member {SectorAddress}
         */
        this.endOfData = new Unitel.SectorAddress(geometry)

        this.parse(raw)
    }

    /**
     * Parse a raw string and extract information.
     * @param {string} raw String from which to extract the data set
     * @private
     */
    parse(raw) {
        // A data set occupies at least 128 bytes
        if(raw.length < 128) throw new Error(
            "not enough bytes for a data set"
        )

        // A data set starts with the HDR1 or DDR1 magic number
        if(!raw.startsWith('HDR1') && !raw.startsWith('DDR1')) {
            throw new Error("magic number HDR1/DDR1 not found")
        }

        if(raw.startsWith('D')) this.deleted = true

        this.identifier = raw.substr(5, 17).trim()
        this.blockLength = parseInt(raw.substr(22, 5).trim())

        switch(raw.substr(27, 1)) {
            case 'R':
                this.blockedRecord = true
                this.spannedRecord = true
                break

            case 'B':
                this.blockedRecord = true
                this.spannedRecord = false
                break

            default:
        }

        this.beginningOfExtent.fromIbm(raw.substr(28, 5))
        
        switch(raw.substr(33, 1)) {
            case '1':
                this.physicalRecordLength = 256
                break

            case '2':
                this.physicalRecordLength = 512
                break

            case '3':
                this.physicalRecordLength = 1024
                break

            default:
        }

        this.endOfExtent.fromIbm(raw.substr(34, 5))

        if(raw.substr(39, 1) !== ' ' && raw.substr(39, 1) !== 'F') {
            this.fixedLength = false
        }

        if(raw.substr(40, 1) === 'B') this.bypass = true

        if(raw.substr(41, 1) !== ' ') this.restricted = true

        if(raw.substr(42, 1) === 'P') this.writeProtect = true

        if(raw.substr(44, 1) === 'C' || raw.substr(44, 1) === 'L') {
            this.multiVolume = true
        }

        if(raw.substr(45, 2) !== '  ') {
            this.sequenceNumber = parseInt(raw.substr(45, 2))
        }

        if(raw.substr(47, 6) !== '      ') {
            this.creationDate = raw.substr(47, 6).trim()
        }

        if(raw.substr(53, 4) === '    ') {
            this.recordLength = this.blockLength
        } else {
            this.recordLength = parseInt(raw.substr(53, 4).trim())
        }

        if(raw.substr(66, 6) === '      ') {
            this.expirationDate = raw.substr(66, 6).trim()
        }

        this.endOfData.fromIbm(raw.substr(74, 5))
    }
}