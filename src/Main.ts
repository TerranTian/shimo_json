
import * as path from "path";
import * as fs from "fs";
import { parse_shimo } from "./Shimo";

let dir = path.dirname(process.argv[1]);
let parameters = process.argv.splice(2);


let fileId:string = null;
let cookie:string = null;

let nameRow = 0;
let typeRow = 1;
let dataRow = 2;

let format="common";
let out="";

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
            typeRow = +parameters.shift()||0;
            break;

        case "-d":
        case "--dataRow":
            dataRow = +parameters.shift()||0;
            break;

        case "-f":
        case "--format":
            format = parameters.shift() || "common";
            break;
        case "-o":
        case "--out":
            out = parameters.shift() || "";
            break;
        default:
            break;
    }
}

!async function(){
    let data = await parse_shimo(fileId,cookie,{nameRow:+nameRow,typeRow:+typeRow,dataRow:+dataRow})
    if(format == "common"){
        delete data.types;
        fs.writeFileSync(out,JSON.stringify(data));
    }else{
        let contents = [];
        data.values.forEach(v=>{
            let item = {};
            v.forEach((v,index)=>{
                item[data.keys[index]] = v;
            })
            contents.push(item);
        })
        fs.writeFileSync(out,JSON.stringify(contents));
    }
};

