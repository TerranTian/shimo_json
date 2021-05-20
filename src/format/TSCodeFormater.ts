let path = require("path");
let lzstring = require("lzstring.ts").LZString;
var BigNumber = require("./BigNumber");

// console.log(lzstring);

function changeValue(value, type) {
    if (value == null || value == "null") return null;
    if (type == "int" || type == "integer" || type == "number" || type == "object") return value;
    if (type == "string") return value.toString();
    if (type == "bool" || type == "boolean") return value.toString().toLowerCase() === "true" ? true : false;
    if (type == "time") {
        let nums = value.toString().match(/\d+/g);
        let date = new Date();
        date.setFullYear(nums[0], nums[1] - 1, nums[2]);
        date.setHours(nums[3], nums[4], nums[5], 0);
        return date.getTime() / 1000;
    }
    if (type == "json" || type == "JSON") {
        let val = value.toString();
        if ((!val.startsWith("{") || !val.endsWith("}")) && !val.startsWith("[") && !val.endsWith("]")) {
            return val;
        }
        return JSON.parse(val);
    }
    if (type == "bignumber") return parseInt(BigNumber.fromFormat(value.toString()));
    return value;
}

function generate(name, keys, values) {
    let primary_key = keys[0].key;
    let primary_Type = keys[0].type;
    let primary_key_c = primary_key[0].toUpperCase() + primary_key.substr(1);
    // let data_key = Buffer.from(JSON.stringify(keys)).toString("base64");
    // let data_datas = Buffer.from(JSON.stringify(values)).toString("base64");

    let data_key = lzstring.compressToBase64(JSON.stringify(keys.map(v => v.key)));
    let data_datas = lzstring.compressToBase64(JSON.stringify(values));

    // compressToBase64
    // Buffer.from("Hello World").toString('base64'));
    // Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))

    let format = `
//【Notice】 auto generated。 @terran
import { DB } from "../GameKit/DB";
declare global {
    interface I${name} {
${keys.map((v, index) => `\t\treadonly ${v.key}: ${v.type}; //${v.des}`).join("\n")}
    }
}

export namespace ${name} {
    export function getBy${primary_key_c}(${primary_key}: ${primary_Type}): I${name} { return getDB().get(id); }
    export function getall(): I${name}[] { return getDB().getall(); }
    /*
    [
${values.map(v=>"\t\t"+JSON.stringify(v)).join("\n")}
    ]
    */
    let _db: DB<I${name}>;
    function getDB(): DB<I${name}> {
        if (!_db) {
            let _keys = '${data_key}';
            let _datas = '${data_datas}';
            _db = new DB(_keys, _datas, "${primary_key}");
        }
        return _db;
    } 
}`;
    return format;
}

function adjustKeyAndValue(keys, values) {
    for (let i = keys.length - 1; i >= 0; i--) {
        if (keys[i].type == "null") {
            keys.splice(i, 1);
            values.forEach(v => v.splice(i, 1))
        }
    }

    values.forEach((arr) => {
        arr.map((v, index) => arr[index] = changeValue(v, keys[index].type));
    });

    keys.forEach(v => {
        let type = v.type;
        switch (type) {
            case "int":
            case "integer":
            case "time":
            case "bignumber":
            case "Number":
                v.type = "number"
                break;
            case "object":
            case "json":
            case "JSON":
                v.type = "any"
                break;
            case "bool":
                v.type = "boolean"
            case "String":
                v.type = "string";
                break;

            default:
                break;
        }
    })
}


// parameter:{name, data}[]
//  name: sring
//  data: {keys:{key:string,type:string,des:string}[],values:any[][]}
// return string;
exports.parse = arr => {
    if (arr.length == 1) {
        let item = arr[0];
        let name = path.basename(item.name, ".xlsx")
        adjustKeyAndValue(item.data.keys, item.data.values);
        return generate(name, item.data.keys, item.data.values);
    } else {
        let map = {};
        for (let item of arr) {
            let name = path.basename(item.name, ".xlsx").replace("DB_", "");
            adjustKeyAndValue(item.data.keys, item.data.values);
            map[name] = {
                keys: item.data.keys.map(v => v.key),
                data: item.data.values
            };
        }

        return JSON.stringify(map);
    }
}