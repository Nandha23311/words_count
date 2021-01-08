const axios = require("axios")

exports.get_alpha_only = (str) => {
    return str.toString().replace(/[^a-zA-Z]/gi, '')
}

exports.get_top_result = (result_object, limit = 10) => {
    return Object.entries(result_object).sort((a, b) => b[1] - a[1]).slice(0, limit)
}

exports.process_word = (result_object, word) => {
    let words = word.toString().toLowerCase().split(" ")
    words.forEach(element => {
        element = this.get_alpha_only(element)
        if (element != '') {
            let temp = result_object[element]
            result_object[element] = temp ? temp + 1 : 1
        }
    });
}

exports.get_meaning = async (words_list) => {
    return await Promise.all(words_list.map(async ([word, count]) => {
        return { count: count, ...await this.http_call(word) }
    }))
}

exports.http_call = async (text) => {
    try {
        const API_TOKEN = "dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf"
        let URL = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=" + API_TOKEN + "&lang=en-en&text=" + text
        let response = await axios.get(URL)
        let data = response.data.def

        let result = {
            text: text,
            pos: "",
            synonyms: []
        }

        if (data.length > 0) {
            result.pos = data[0].pos
            result.synonyms = data[0].tr
        }

        return result
    }
    catch (Error) {
        return {text:text, error:"error while fetch meaning"}
    }

} 