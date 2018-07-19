"use strict"
/**
 * @file sector-address.js
 * @author Frédéric BISSON <zigazou@free.fr>
 * @version 1.0
 */

/**
 * @namespace Unitel
 */ 
var Unitel = Unitel || {}

/**
 * Class representing a sector address on a Unitel disk. It can convert
 * from different sector address format.
 */
Unitel.SectorAddress = class {
    /**
     * Create a sector address.
     * @param {DiskGeometry} geometry Disk geometry
     * @param {number} [track=0] Track number
     * @param {number} [sector=1] Sector number
     */
    constructor(geometry, track, sector) {
        if(!(geometry instanceof Unitel.DiskGeometry)) throw new TypeError(
            "The geometry parameter must be a DiskGeometry"
        )

        /**
         * Disk geometry needed to validate the sector address and to calculate
         * offsets.
         * @member {DiskGeometry}
         */
        this.geometry = geometry

        /**
         * Track number (starts from 0)
         * @member {number}
         */
        this.track = 0

        /**
         * Sector number (starts from 1)
         * @member {number}
         */
        this.sector = 1

        if(typeof track !== 'undefined') {
            if(typeof sector === 'undefined') sector = 1
            this.fromTrackSector(track, sector)
        }
    }

    /**
     * Sets the sector address given a track and a sector
     * @param {number} track Track number
     * @param {number} sector Sector number
     */
    fromTrackSector(track, sector) {
        this.geometry.assertValidTrack("track", track)
        this.geometry.assertValidSector("sector", sector)

        this.track = track
        this.sector = sector

        return this
    }

    /**
     * Sets the sector address given an IBM formatted sector address (TT0SS).
     * @param {string} sectorAddress IBM sector address
     */
    fromIbm(sectorAddress) {
        // An IBM sector address is exactly 5 characters long.
        if(sectorAddress.length !== 5) throw new Error(
            "sectorAddress must be exactly 5 characters"
        )

        // Every character must be a decimal digit in ASCII.
        for(let i = 0; i < sectorAddress.length; i++) {
            let charOrd = sectorAddress.charCodeAt(i)

            if(charOrd < 0x30 || charOrd > 0x39) throw new RangeError(
                "character in sectorAddress not in '0'..'9' range"
            )
        }

        // Get the track number
        const track = parseInt(sectorAddress.substr(0, 2))

        // Check the track number
        this.geometry.assertValidTrack("sectorAddress track", track)

        // Get the sector number
        const sector = parseInt(sectorAddress.substr(3, 2))

        // Check the sector number
        this.geometry.assertValidSector("sectorAddress sector", sector)

        this.track = track
        this.sector = sector

        return this
    }

    /**
     * Sets the sector address given a Unitel formatted sector address (TTSS).
     * @param {string} sectorAddress Unitel sector address
     */
    fromUnitel(sectorAddress) {
        // A Unitel sector address is exactly 4 characters long.
        if(sectorAddress.length !== 4) throw new Error(
            "sectorAddress must be exactly 4 characters"
        )

        // Every character must be a hexadecimal digit in ASCII.
        for(let i = 0; i < sectorAddress.length; i++) {
            let charOrd = sectorAddress.charCodeAt(i)

            if(!(   (charOrd >= 0x30 && charOrd <= 0x39)
                 || (charOrd >= 0x41 && charOrd <= 0x46))
              ) throw new RangeError(
                "character in sectorAddress not in '0'..'9' range"
            )
        }

        // Get the track number
        const track = parseInt(sectorAddress.substr(0, 2), 16)

        // Check the track number
        this.geometry.assertValidTrack("sectorAddress track", track)

        // Get the sector number
        const sector = parseInt(sectorAddress.substr(2, 2), 16)

        // Check the sector number
        this.geometry.assertValidSector("sectorAddress sector", sector)

        this.track = track
        this.sector = sector

        return this
    }

    /**
     * Calculates the first offset for the current track and sector.
     * @return {number}
     */
    offset() {
        return this.geometry.offset(this.track, this.sector)
    }

    /**
     * Calculates the last offset for the current track and sector.
     * @return {number}
     */
    lastOffset() {
        return this.offset() + this.geometry.bytesPerSector - 1
    }
}