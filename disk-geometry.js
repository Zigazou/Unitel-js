"use strict"
/**
 * @file disk-geometry.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * A class used to compute offset from disk geometry.
 */
Unitel.DiskGeometry = class {
    /**
     * Create a disk geometry.
     * @param {number} tracksPerSide Number of tracks per side on the disk
     * @param {number} sectorsPerTrack Number of sectors per track on the disk
     * @param {number} bytesPerSector Sector size in bytes
     */
    constructor(tracksPerSide, sectorsPerTrack, bytesPerSector) {
        this.assertPositiveInteger("tracksPerSide", tracksPerSide)
        this.assertPositiveInteger("sectorsPerTrack", sectorsPerTrack)
        this.assertPositiveInteger("bytesPerSector", bytesPerSector)

        if(bytesPerSector % 128 !== 0) throw new Error(
            "The bytesPerSector parameter is not a multiple of 128"
        )

        /**
         * Number of tracks per side on the disk.
         * @member {number}
         */
        this.tracksPerSide = tracksPerSide

        /**
         * Number of sectors per track on the disk.
         * @member {number}
         */
        this.sectorsPerTrack = sectorsPerTrack

        /**
         * Sector size in bytes.
         * @member {number}
         */
        this.bytesPerSector = bytesPerSector
    }

    /**
     * All parameters given to this class must be positive integer.
     * @param {string} paramName Parameter name
     * @param {number} num Parameter value
     * @private
     */
    assertPositiveInteger(paramName, num) {
        // Rejects float numbers.
        if(num !== Math.floor(num)) throw new RangeError(
            paramName + " not an integer"
        )

        // Rejects negative numbers.
        if(num < 0) throw new RangeError(
            paramName + " not a positive integer"
        )
    }

    /**
     * Asserts a number is a valid track number.
     * @param {string} paramName Parameter name
     * @param {number} track Track value
     */
    assertValidTrack(paramName, track) {
        this.assertPositiveInteger(paramName, track)

        if(track > this.tracksPerSide) throw new RangeError(
            paramName + " greater than the number of tracks"
        )
    }

    /**
     * Asserts a number is a valid sector number.
     * @param {string} paramName Parameter name
     * @param {number} sector Sector value
     */
    assertValidSector(paramName, sector) {
        this.assertPositiveInteger(paramName, sector)

        if(sector <= 0) throw new RangeError(
            paramName + " starts at 1, not 0"
        )

        if(sector > this.sectorsPerTrack) throw new RangeError(
            paramName + " greater than the number of sectors"
        )
    }

    /**
     * Calculates the size of a track in bytes for the disk geometry.
     * @return {number} Size of a track in bytes.
     */
    trackSize() {
        return this.sectorsPerTrack * self.bytesPerSector
    }

    /**
     * Calculates the size of a disk in bytes for the disk geometry.
     * @return {number} Size of a disk in bytes.
     */
    diskSize() {
        return this.trackSize() * this.tracksPerSide
    }

    /**
     * Calculates an offset for the disk geomatry given track and sector
     * numbers.
     * @param {number} track 
     * @param {number} sector 
     * @return {number}
     */
    offset(track, sector) {
        this.assertValidTrack("track", track)
        this.assertValidSector("sector", sector)

        return track * this.bytesPerSector * this.sectorsPerTrack +
               (sector - 1) * this.bytesPerSector
    }
}