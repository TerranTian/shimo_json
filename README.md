# shimo_json

## How to use:

```shell
cookie='your cooike';
fileId="your document id"
npx shimo_json -c $cookie --fileId $fileId -o test.json
```

## Parameters:

```
-c/--cookie: copy from one of shimo's request.
-i/--fileId: shimo's document id: https://shimo.im/sheets/<docment id>/MODOC
-n/--nameRow: the index of row for name, default:0
-t/--typeRow: the index of row for type, default:1
-d/--dataRow: the index of row for data, default:1
-f/--format: the json format, default:common, which with full key,[{key1:value1,key2:value2},{key1:value1,key2:value2}], otherwise [keys:[key1,key2],values:[[value1,value2],[value1,value2]]]
-o/--out: out path

```

# Thanks
https://github.com/yangkghjh/shimo2csv
