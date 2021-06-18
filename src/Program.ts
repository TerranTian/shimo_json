
import * as path from "path";
import * as fs from "fs";
import { parse_shimo } from "./core/Shimo";
import { exit } from "process";
import { parse_excel_file } from "./core/Excel";

let dir = path.dirname(process.argv[1]);
let parameters = process.argv.splice(2);


let cookie: string = null;

let nameRow = 0;
let typeRow = 1;
let desRow = 2;
let dataRow = 3;

let out = "";

let formater = null;
let format = "common";
let file:string[] = [];

while (parameters.length > 0) {
    let value = parameters.shift();
    switch (value) {
        case "-c":
        case "--cookie":
            cookie = parameters.shift();
            break;
        case "-n":
        case "--nameRow":
            nameRow = +parameters.shift() ?? 0;
            break;
        case "-t":
        case "--typeRow":
            typeRow = +parameters.shift() ?? 1;
            break;
        case "--desRow":
            desRow = +parameters.shift() ?? 2;
            break;
        case "-d":
        case "--dataRow":
            dataRow = +parameters.shift() ?? 3;
            break;
        case "-f":
        case "--format":
            format = parameters.shift() || "common";
            break;
        case "--formater":
            formater = parameters.shift() || null;
            break;
        case "-o":
        case "--out":
            out = parameters.shift() || "";
            break;
        default:
            file.push(value);
            break;
    }
}

let err = !out || file.length == 0;
if (err) {
    let message = `
    wrong arguments:
    -c/--cookie: copy from one of shimo's request.
    -n/--nameRow: the index of row for name, default:0
    -t/--typeRow: the index of row for type, default:1
    --desRow: the index of row for des, default:2
    -d/--dataRow: the index of row for data, default:3
    -f/--format: the json format, default:common, which with full key,[{key1:value1,key2:value2},{key1:value1,key2:value2}], otherwise [keys:[key1,key2],values:[[value1,value2],[value1,value2]]]
    -o/--out: out path
    --name: excel alias
    --formater: an js module which export an function: parse(arr:{name:string,data:{keys:{key:string,type:string,des:string}[],values:any[][]}}[]):string
    file: excel paths b.xlsx or shimo's document ids: https://shimo.im/sheets/<docment id>/MODOC
`
    console.log(message);
    exit(1);
}

!async function () {
    let config = { nameRow: +nameRow, typeRow: +typeRow, dataRow: +dataRow, desRow: +desRow };

    let arr = [];
    for (let f of file) {
        let data = null;

        let name = f.split("@")[1] || path.basename(f,".xlsx");
        let isShimo = f.indexOf(".xlsx") == -1;
        if (isShimo) {
            if(!cookie){
                console.log("Skiped: cookie required:",f);
                continue;
            }
            data = await parse_shimo(f, cookie, config)
        }else{
            data = await parse_excel_file(f, config)
        }
        arr.push({ name:name, data ,file:f});
    }

    if (formater) {
        let plug = require(formater);
        let str = plug.parse(arr);
        fs.writeFileSync(out, str);
    } else {
        if (format == "common") {
            let reuslt = require("./format/CommonFormat").parse(arr);
            fs.writeFileSync(out, reuslt);
        } else if (format == "common_map") {
            let reuslt = require("./format/CommonMapFormat").parse(arr);
            fs.writeFileSync(out, reuslt);
        } else if (format == "mini") {
            let reuslt = require("./format/MiniFormat").parse(arr);
            fs.writeFileSync(out, reuslt);
        } else if (format == "mini_map") {
            let reuslt = require("./format/MiniMapFormat").parse(arr);
            fs.writeFileSync(out, reuslt);
        }else{
            throw "unknow format:"+format;
        }
    }

    console.log("export done:", out);
}();