import { readFileSync } from "fs";
import xlrd from "node-xlsx";

export function parse_excel_buffer(buffer:Buffer,config:IConfig){
    console.log("parsing...");
    let sheets = xlrd.parse(buffer);
    let data = sheets[0].data;
    let nameArr = data[config.nameRow];
    let typeArr = data[config.typeRow];
    let desArr = data[config.desRow] || "";
    let rows = data.splice(config.dataRow);

    let keys = [];
    let values = [];

    for (let i = 0; i < nameArr.length; ++i) {
        let name = nameArr[i];
        if (name.startsWith("#") || name.length == 0) continue;
        keys.push({
            key:name,
            type:typeArr[i],
            des:desArr[i].replace("\n"," ")
        });
    }

    for(let row of rows){
        if (!row[0]) break;
        var rowValues = [];
        for (let i = 0; i < nameArr.length; ++i) {
            let name = nameArr[i];
            if (name.startsWith("#") || name.length == 0) continue;
            let value = row[i];
            
            rowValues.push(value);
        }
        values.push(rowValues);
    }

    return {keys,values};
}

export function parse_excel_file(path:string,config:IConfig){
    let buffer = readFileSync(path);
    return parse_excel_buffer(buffer,config);
}