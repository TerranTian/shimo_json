function paseItem(data: IExcelData) {
    let contents = {};
    let primaryIndex = 0;
    data.values.forEach(v => {
        let item = {};
        v.forEach((v, index) => {
            item[data.keys[index].key] = v;
        })
        contents[v[0]] = item;
    })

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