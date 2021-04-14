
import * as path from "path";
import * as fs from "fs";
import { parse_shimo } from "./core/Shimo";
import { exit } from "process";
import { parse_excel_file } from "./core/Excel";

let dir = path.dirname(process.argv[1]);
let parameters = process.argv.splice(2);


let fileId:string = null;
let cookie:string = null;

let nameRow = 0;
let typeRow = 1;
let desRow = 2;
let dataRow = 3;

let name = "";
let out="";

let formater=null;
let format="common";
let file = "";

while(parameters.length > 0){
    let value=parameters.shift();
    switch (value) {
        case "-c":
        case "--cookie":
            cookie = parameters.shift();
            break;
        case "-i":
        case "--fileId":
            fileId = parameters.shift();
            break;
        case "-n":
        case "--nameRow":
            nameRow = +parameters.shift()||0;
            break;
        case "-t":
        case "--typeRow":
            typeRow = +parameters.shift()||1;
            break;
        case "--desRow":
            desRow = +parameters.shift()||2;
            break;
        case "-d":
        case "--dataRow":
            dataRow = +parameters.shift()||3;
            break;
        case "-f":
        case "--format":
            format = parameters.shift() || "common";
            break;
        case "--formater":
                formater = parameters.shift() || null;
                break;
        case "--name":
            name = parameters.shift() || null;
            break;
        case "-o":
        case "--out":
            out = parameters.shift() || "";
            break;
        default:
            file = value;
            break;
    }
}

let from_shimo = fileId || cookie;
let err = !out;
if(!err){
    if(from_shimo){
        err = !cookie || !fileId;
    }else{
        err = !file;
    }
}

if(err){
    let message = `
    wrong arguments:
    -c/--cookie: copy from one of shimo's request.
    -i/--fileId: shimo's document id: https://shimo.im/sheets/<docment id>/MODOC
    -n/--nameRow: the index of row for name, default:0
    -t/--typeRow: the index of row for type, default:1
    --desRow: the index of row for des, default:2
    -d/--dataRow: the index of row for data, default:3
    -f/--format: the json format, default:common, which with full key,[{key1:value1,key2:value2},{key1:value1,key2:value2}], otherwise [keys:[key1,key2],values:[[value1,value2],[value1,value2]]]
    -o/--out: out path
    --name: excel alias
    --formater: an js module which export an function: parse(name:string,data:{keys:{key:string,type:string,des:string}[],values:any[][]}):string
    file: excel path b.xlsx
`
    console.log(message);
    exit(1);
}

// if no name specified, use from out;
name = name || path.basename(out).split(".")[0];

!async function(){
    let config = {nameRow:+nameRow,typeRow:+typeRow,dataRow:+dataRow,desRow:+desRow};
    let data:IResult = null;
    if(from_shimo){
        data = await parse_shimo(fileId,cookie,config)
    }else{
        data = await parse_excel_file(file,config)
    }

    if(formater){
        let plug = require(formater);
        let str = plug.parse(name,data);
        fs.writeFileSync(out,str);
    }else{
        if(format == "common"){
            let contents = [];
            data.values.forEach(v=>{
                let item = {};
                v.forEach((v,index)=>{
                    item[data.keys[index].key] = v;
                })
                contents.push(item);
            })
            fs.writeFileSync(out,JSON.stringify(contents));
        }else{
            fs.writeFileSync(out,JSON.stringify(data));
        }
    }

    console.log("export done:",out);
}();