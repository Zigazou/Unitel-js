Unitel-js
=========

Unitel-js is a standalone JavaScript library that allows you to read a Unitel
8 inch disk image from within your navigator.

Unitel was a system dedicated to creating Videotex pages. It uses an IBM
platform which explains why you can't simply mount a disk image from a Unitel
floppy disk on your favorite Linux distribution.

It is based on my Python3 script https://github.com/Zigazou/Unitel

Usage
-----

Have a look at `test/test-unitel.html` and `test/test-unitel.js` to learn about
the basics.

If you have a required image, you can load the image and learn about its content
in the console. You will be able to see:

- Volume label information,
- the disk directory,
- a list of offsets to all the Videotex pages the disk contains.

You can also have a look at `analyzer/analyzer.html` and `analyzer/analyzer.js`.
`analyzer/analyzer.html` can be directly opened in Firefox.