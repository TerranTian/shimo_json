function paseItem(data: IExcelData) {
    let contents = {keys:data.keys.map(v=>v.key),data:data.values};
    return contents;
}

export function parse(arr: IDocument[]) {
    let map = {};
    arr.forEach(v => {
        map[v.name] = paseItem(v.data);
    })

    let result = map;
    if (arr.length == 1) {
        result = map[arr[0].name]
    }

    return JSON.stringify(result);
}