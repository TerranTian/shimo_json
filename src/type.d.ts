interface IConfig{
    nameRow:number;
    typeRow:number;
    dataRow:number;
    desRow:number
}

interface IResult{
    keys:{key:string,type:string,des:string}[];
    values:any[][]
}