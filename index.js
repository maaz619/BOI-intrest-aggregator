#!/usr/bin/env node

"use strict"

var fs = require("node:fs")
var { parse } = require('csv-parse')

var input = process.argv[2]
var remarkString = ['Int:', 'Int.']

readDir(input).then(function (data) {
    let rowIndex
    let remarkIndex;
    let count = 0
    let totalIntrest = 0
    let promises = []
    var fileStreams = data.map((file) => {
        return fs.createReadStream(input + "/" + file, 'utf-8')
    })
    fileStreams.forEach((stream, index) => {
        promises.push(new Promise((resolve, reject) => {
            stream.pipe(parse({ from_line: 9, skip_records_with_error: true, })).on('readable', function () {
                let data;
                while ((data = this.read()) !== null) {
                    if (data.includes('Credit')) {
                        rowIndex = data.indexOf('Credit')
                    }
                    if (data.includes('Remarks')) {
                        remarkIndex = data.indexOf("Remarks")
                    }
                    if (data[remarkIndex]) {
                        const result = checkRemarks(data[remarkIndex])
                        if (result && data[rowIndex]) {
                            count += 1
                            totalIntrest += parseFloat(data[rowIndex])
                        }
                    }
                }
            }).on('end', function () {
                resolve(totalIntrest)
            }).on('error', function (error) {
                reject(error)
            })
        }))
    })
    return Promise.all(promises).then(int => console.log(int[int.length - 1]))
}).catch(error => console.log(error))

function checkRemarks(check) {
    return remarkString.some(keys => check.includes(keys))
}

function readDir(pathToFolder) {
    return new Promise((res, rej) => {
        fs.readdir(pathToFolder, (error, files) => {
            if (error) {
                console.log(error)
                rej(error)
            }
            else {
                res(files)
            }
        })
    })
}
