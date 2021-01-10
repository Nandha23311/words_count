const https = require('https');

const API_TOKEN = "dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf"
const SKIP_WORDS = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
const LIMIT = 10

/**
 * Filter alpha chars from string
 * @param  {String} str word
 * @return {String}
 */
exports.get_alpha_only = (str) => {
    return str.toString().replace(/[^a-zA-Z]/gi, '')
}

/**
 * Sort the words count & return top records
 * @param  {Object} words_object 
 * @param  {Integer} limit 10 is Default Limit  
 * @return {Array}
 */
exports.get_top_result = (words_object, limit = LIMIT) => {
    return Object.entries(words_object).sort((a, b) => b[1] - a[1]).slice(0, limit)
}

/**
 * Split the line into the words & count words
 * @param  {Object} result_object 
 * @param  {String} word  
 */
exports.process_word = (result_object, line) => {
    let words = line.toString().toLowerCase().split(" ")
    words.forEach(element => {
        element = this.get_alpha_only(element)
        if (element != '' && this.skip_word(element) == -1) {
            let temp = result_object[element]
            result_object[element] = temp ? temp + 1 : 1
        }
    });
}

/**
 * Skip preposition words
 * @param  {String} word 
 * @param  {Array} skip_words option 
 * @return {Integer}
 */
exports.skip_word = (word, skip_words = SKIP_WORDS) => {
    return skip_words.indexOf(word)
}

/**
 * Get Meaning for the word
 * @param  {Array} words_list 
 * @return {Array}
 */
exports.get_meaning = async (words_list) => {
    return await Promise.all(words_list.map(async ([word, count]) => {

        let URL = get_url(word)

        let response = await this.http_call(URL)
        let data = response.def

        let result = {
            text: word,
            count: count,
            pos: "",
            synonyms: []
        }

        if (data && data.length > 0) {
            result.pos = data[0].pos
            result.synonyms = data[0].tr
        }
        return result
    }))
}

/**
 * Http client call
 * @param  {String} URL 
 * @return {Object}
 */
exports.http_call = async (URL) => {
    try {
        return new Promise((resolve, reject) => {
            https.get(URL, (resp) => {
                let data = '';

                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    resolve(JSON.parse(data))
                });

            }).on("error", (err) => {
                throw err
            });
        })
    }
    catch (Error) {
        return { error: "error while fetch meaning" }
    }

}

function get_url(word) {
    return "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=" + API_TOKEN + "&lang=en-en&text=" + word
}