"use strict"
/**
 * @file error-map.js
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
Unitel.ErrorMap = class {
    /**
     * Create an IBM error map.
     * @param {string} raw String from which to extract the error map.
     */
    constructor(raw) {
        /**
         * First defective track number. The corresponding spare track is 74.
         * -1 indicates no defective track.
         * @member {number}
         */
        this.firstDefectiveTrack = -1

        /**
         * Second defective track number. The corresponding spare track is 75.
         * -1 indicates no defective track.
         * @member {number}
         */
        this.secondDefectiveTrack = -1

        /**
         * Defective record presence
         * @member {boolean}
         */
        this.defectiveRecord = false

        this.parse(raw)
    }

    /**
     * Parse a raw string and extract information.
     * @param {string} raw String from which to extract the error map.
     * @private
     */
    parse(raw) {
        // An error map occupies at least 128 bytes
        if(raw.length < 128) throw new Error(
            "not enough bytes for an error map"
        )

        // An error map starts with the ERMAP magic number
        if(!raw.startsWith('ERMAP')) throw new Error(
            "magic number ERMAP not found"
        )

        // Get the first defective track if any
        if(raw.substr(6, 2) !== '  ') {
            this.firstDefectiveTrack = parseInt(raw.substr(6, 2))
        }

        // Get the second defective track
        if(raw.substr(10, 2) !== '  ') {
            this.secondDefectiveTrack = parseInt(raw.substr(10, 2))
        }

        // Look for defective record
        if(raw.substr(22, 1) === 'D') this.defective_record = true
    }

    /**
     * Indicates if the disk has defective track.
     * @return {boolean} true if the disk has defective track, false otherwise
     */
    hasDefectiveTrack() {
        return this.firstDefectiveTrack >= 0
    }

    /**
     * Indicates if the disk has defective records.
     * @return {boolean} true if the disk has defective records, false otherwise
     */
    hasDefectiveRecord() {
        return this.defectiveRecord
    }
}