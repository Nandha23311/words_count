const fs = require('fs');
const readline = require('readline')

const file_stream = fs.createReadStream('./books/big.txt');
const { get_top_result, process_word, get_meaning } = require("./util")

const read_line = readline.createInterface({
    input: file_stream,
    crlfDelay: Infinity
});

let result_object = {}

console.time("time")

read_line.on('line', function (line) {
    process_word(result_object, line)
});

read_line.on('close', async function () {
    let result = await get_meaning(get_top_result(result_object))
    console.log("\n result ", result)
    console.timeEnd("time")
});
