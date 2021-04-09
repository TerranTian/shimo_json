import axios from 'axios';
import * as download from 'download';
import { parse_excel_buffer } from './Excel';

async function downloadExcel(fileId, cookie) {
    let type = 'xlsx';
    const url = 'https://shimo.im/lizard-api/files/' + fileId + '/export';
    
    console.log("exporting...:",url);
    const response = await axios.get(url, {
    params: {
            type: type,
            file: fileId,
            returnJson: '1',
            isAsync: '0',
        },
        headers: {
            Cookie: cookie,
            Referer: 'https://shimo.im/folder/123',
        }
    });

    if (!response.data.redirectUrl) {
        throw new Error(' failed, error: '+response.data);
    }

    // return download(response.data.redirectUrl).then(data => {
    //     fs.writeFileSync(item.name+'.xlsx', data);
    // });

    console.log("download...:",response.data.redirectUrl);
    let data = await download(response.data.redirectUrl);
    return data;
}

export async function parse_shimo(fileId:string, cookie:string, config:{nameRow:number,typeRow:number,dataRow:number}):Promise<{keys:string[],types:string[],values:any[][]}> {
    let buffer = await downloadExcel(fileId,cookie);
    return parse_excel_buffer(buffer,config);
};
