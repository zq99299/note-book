# IK 分词器配置文件和自定义词库
[[toc]]

## 主要配置解说
ik 配置文件地址：elasticsearch-5.2.0/plugins/ik/config 目录下都是存放配置文件，
下面是一些主要配置文件含义：

- IKAnalyzer.cfg.xml：用来配置自定义词库
- main.dic：ik 原生内置的中文词库，总共有 27 万多条，只要是这些单词，都会被分在一起
- quantifier.dic：放了一些单位相关的词
- suffix.dic：放了一些后缀
- surname.dic：中国的姓氏
- stopword.dic：英文停用词

IKAnalyzer.cfg.xml 内容如下
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
	<comment>IK Analyzer 扩展配置</comment>
	<!--用户可以在这里配置自己的扩展字典 -->
	<entry key="ext_dict">custom/mydict.dic;custom/single_word_low_freq.dic</entry>
	 <!--用户可以在这里配置自己的扩展停止词字典-->
	<entry key="ext_stopwords">custom/ext_stopword.dic</entry>
	<!--用户可以在这里配置远程扩展字典 -->
	<!-- <entry key="remote_ext_dict">words_location</entry> -->
	<!--用户可以在这里配置远程扩展停止词字典-->
	<!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>

```

ik 原生最重要的两个配置文件

- main.dic：包含了原生的中文词语，会按照这个里面的词语去分词
- stopword.dic：包含了英文的停用词。custom/ext_stopword.dic 中包含了中文的一些扩展词

什么是停用词？与其他词相比，功能词没有什么实际含义，比如'the'、'is'、'at'、'which'、'on'等。

## 自定义词库
每年都会涌现一些特殊的流行词，网红，蓝瘦香菇，喊麦，鬼畜，一般不会在 ik 的原生词典里，
自己补充自己的最新的词语，到 ik 的词库里面去

`IKAnalyzer.cfg.xml：ext_dict，custom/mydict.dic` 是在配置文件的默认文件，可以追加，也可以自定义

::: tip
想要词库生效，需要重启 es
:::

可以使用如下语法进行检测
```json
GET /_analyze
{
  "text": "网红",
  "analyzer": "ik_max_word"
}
```
