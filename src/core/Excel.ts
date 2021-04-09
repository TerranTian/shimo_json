import { readFileSync } from "fs";
import xlrd from "node-xlsx";

export function parse_excel_buffer(buffer:Buffer,config:{nameRow:number,typeRow:number,dataRow:number}){
    console.log("parsing...");
    let sheets = xlrd.parse(buffer);
    let data = sheets[0].data;
    let columNames = data[config.nameRow];
    let columTypes = data[config.typeRow];
    let rows = data.splice(config.dataRow);

    let keys = [];
    let types = [];
    let values = [];

    for (let i = 0; i < columNames.length; ++i) {
        let name = columNames[i];
        if (name.startsWith("#") || name.length == 0) continue;
        keys.push(name);
        types.push(columTypes[i]);
    }

    for(let row of rows){
        if (!row[0]) break;
        var rowValues = [];
        for (let i = 0; i < columNames.length; ++i) {
            let name = columNames[i];
            if (name.startsWith("#") || name.length == 0) continue;
            let value = row[i];
            
            rowValues.push(value);
        }
        values.push(rowValues);
    }

    return {keys,values,types};
}

export function parse_excel_file(path:string,config:{nameRow:number,typeRow:number,dataRow:number}){
    let buffer = readFileSync(path);
    return parse_excel_buffer(buffer,config);
}