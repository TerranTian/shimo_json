// import axios from 'axios';
import * as download from 'download';
import { parse_excel_buffer } from './Excel';

const fetch = require("node-fetch");
async function downloadExcel(fileId, cookie) {
    // const url = 'https://shimo.im/lizard-api/files/' + fileId + '/export';
    const url = 'https://xxport.shimo.im/files/' + fileId + '/export';
    
    console.log("exporting...:",url);
    // let type = 'xlsx';
    // const response = await axios.get(url, {
    // params: {
    //         type: type,
    //         file: fileId,
    //         returnJson: '1',
    //         isAsync: '0',
    //     },
    //     headers: {
    //         Cookie: cookie,
    //         origin:"https://shimo.im",
    //     }
    // });
    // let obj = response.data;


    let response = await fetch(`https://xxport.shimo.im/files/${fileId}/export?type=xlsx&file=${fileId}&returnJson=1&name=activity&isAsync=0`, {
        headers: {
            origin:"https://shimo.im",
            "cookie": cookie
        },
        "body": null,
        "method": "GET",
    });
    let obj = await response.json();
    
    // console.log("rrr",obj);
    if (!obj.redirectUrl) {
        throw new Error(' failed, error: '+obj);
    }

    console.log("download...:",obj.redirectUrl);
    let data = await download(obj.redirectUrl);
    return data;
}

export async function parse_shimo(fileId:string, cookie:string, config:IConfig):Promise<IResult> {
    let buffer = await downloadExcel(fileId,cookie);
    return parse_excel_buffer(buffer,config);
};
