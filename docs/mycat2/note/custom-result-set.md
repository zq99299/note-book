# 自定义结果集

## 相关资料
- [支持的数据类型](https://dev.mysql.com/doc/refman/5.7/en/data-types.html)
- --------- 后面是协议相关-------------
- [数据类型](https://dev.mysql.com/doc/internals/en/com-query-response.html#column-type)
- [列定义（响应包）](https://dev.mysql.com/doc/internals/en/com-query-response.html#packet-Protocol::ColumnDefinition)
- [结果集](https://dev.mysql.com/doc/internals/en/com-query-response.html#packet-ProtocolText::Resultset)

::: tip
数值类型中的强制表现的写法是 [1,2] 后面的都强制表现为前面的。
如：[INT,INTEGER] 虽然在一些工具中可以指定这 2 个类型，但是提交之后都会强制转成 INT 类型
:::

## 数字类型
- 整数类型（精确值） - [INT,INTEGER]，SMALLINT，TINYINT，MEDIUMINT，BIGINT
- 定点类型（精确值） - [DECIMAL，NUMERIC]
- 浮点类型（近似值） - FLOAT，DOUBLE
- 比特值类型 - BIT

### 数字类型属性

显示宽度：类型括号中的数值，比如 TINYINT(100); TINYINT 的取值范围是 -128~127（无符号为0~255，但是无法显示的写入127以上的数据）

TINYINT(100)：表定义是可以的，不会报错，但是存储的值只能是在范围内，否则报错；

显示宽度的定义是无上限的；

UNSIGNED 所有数据类型都可以选用（非标准）的属性，无符号属性；

无符号属性的定义：`CREATE TABLE t1 (i1 TINYINT, i2 TINYINT UNSIGNED);`

### 超出范围和溢出处理
> [官网文档](https://dev.mysql.com/doc/refman/5.7/en/out-of-range-and-overflow.html)

当 sql 模式处于严格模式的时候：`SET sql_mode = 'TRADITIONAL';` 超出数据类型的范围会报错；

`SET sql_mode = '';` : 非严格模式只会把值裁剪到范围类存储，并发出警告日志

## 时间类型
- DATE, DATETIME, TIMESTAMP
- TIME
- YEAR：限制为显示宽度为固定值 YEAR(4)

## 字符串类型
- CHAR、VARCHAR
- BINARY、VARBINARY
- BLOB、TEXT
- ENUM
- SET

## 空间数据类型
## JSON 数据类型（5.7.8+）

## 小总结

1. 上面的数据类型有些是有强制性的默认宽度。但是在官网暂时没有找到；
2. 只有字符串类型有自定义编码；
3. 字符串类型中 CHAR、VARCHAR 必须要指定显示宽度
5. 数值类型中 整数类型 和 比特值类型 和 定点类型 必须有显示宽度
6. 时间类型只有 YEAR 有显示宽度

## 强制默认宽度汇总

类型      | 默认值 | 强制固定值
----------|--------|-----------
TINYINT   | 4      |
SMALLINT  | 6      |
MEDIUMINT | 9      |
INT       | 11     |
BIGINT    | 20     |
BIT       | 1      |
DECIMAL   | 10,0   |
CHAR_string      | 255    |
VARCHAR   | 255    |
BINARY    | 255    |
VARBINARY | 255    |
YEAR      | 4      | 4
BLOB      | 65535  |
TEXT      | 196605 |

## 数据类型 与 协议类型的映射关系

| 数据类型  | 协议类型                      | 字符集(默认)               | Decimals(默认) | flags（server status）                    |
|-----------|-------------------------------|----------------------------|----------------|-------------------------------------------|
| INT       | FIELD_TYPE_LONG (3)           | binary COLLATE binary (63) |                |                                           |
| SMALLINT  | FIELD_TYPE_SHORT (2)          | binary COLLATE binary (63) |                |                                           |
| TINYINT   | FIELD_TYPE_TINY (1)           | binary COLLATE binary (63) |                |                                           |
| MEDIUMINT | FIELD_TYPE_INT24 (9)          | binary COLLATE binary (63) |                |                                           |
| BIGINT    | FIELD_TYPE_LONGLONG (8)       | binary COLLATE binary (63) |                |                                           |
| DECIMAL   | FIELD_TYPE_NEWDECIMAL (246)   | binary COLLATE binary (63) |                |                                           |
| FLOAT     | FIELD_TYPE_FLOAT (4)          | binary COLLATE binary (63) | 31             |                                           |
| DOUBLE    | FIELD_TYPE_DOUBLE (5)         | binary COLLATE binary (63) | 31             |                                           |
| BIT       | FIELD_TYPE_BIT (16)           | binary COLLATE binary (63) |                | 0x0020       （Unsigned: Set）            |
| DATE      | FIELD_TYPE_DATE (10)          | binary COLLATE binary (63) |                | 0x0080       （Binary: Set）              |
| DATETIME  | FIELD_TYPE_DATETIME (12)      | binary COLLATE binary (63) |                | 0x0080       （Binary: Set）              |
| TIMESTAMP | FIELD_TYPE_TIMESTAMP (7)      | binary COLLATE binary (63) |                | 0x0080       （Binary: Set）              |
| TIME      | FIELD_TYPE_TIME (11)          | binary COLLATE binary (63) |                | 0x0080       （Binary: Set）              |
| YEAR      | FIELD_TYPE_YEAR (13)          | binary COLLATE binary (63) |                | 0x0060 （Zero fill: Set / Unsigned: Set） |
| CHAR      | Type: FIELD_TYPE_STRING (254) |                            |                |                                           |
| VARCHAR   | FIELD_TYPE_VAR_STRING (253)   |                            |                |                                           |
| BINARY    | FIELD_TYPE_STRING (254)       | binary COLLATE binary (63) |                | 0x0080       （Binary: Set）              |
| VARBINARY | FIELD_TYPE_VAR_STRING (253)   | binary COLLATE binary (63) |                | 0x0080       （Binary: Set）              |
| BLOB      | FIELD_TYPE_BLOB (252)         | binary COLLATE binary (63) |                | 0x0090       （Binary: Set / Blob: Set）  |
| TEXT      | FIELD_TYPE_BLOB (252)         |                            |                | 0x0010       （Blob: Set）                |
| ENUM      | FIELD_TYPE_STRING (254)       |                            |                | 0x0100       （Enum: Set）                |
| SET       | FIELD_TYPE_STRING (254)       |                            |                | 0x0800       （Set: Set）                 |
