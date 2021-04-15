interface IConfig{
    nameRow:number;
    typeRow:number;
    dataRow:number;
    desRow:number
}

interface IExcelData{
    keys:{key:string,type:string,des:string}[];
    values:any[][]
}

interface IDocument{
    name:string,
    data:IExcelData
}