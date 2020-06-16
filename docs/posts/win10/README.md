# win10
## 任务栏缩略图改成文字列表显示
比如 IDEA 打开很多项目的时候，缩略图模式非常的不方便查找你要进入哪一个项目？这个时候你就需要他以文字列表的方式显示了。下面的方法可以设置当超过几个缩略图的时候显示文字列表

打开注册表编辑器应用程序。转到下面的注册表项

`HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Taskband`
在右侧，修改或创建一个新的 32 位 DWORD 值 NumThumbnails。

注意：即使您运行的是 64 位 Windows，仍必须创建 32 位 DWORD 值。将其值（以十进制表示）设置为任务栏要变成列表之前所需的缩略图数。

如果将其设置为 0，Windows 10 将始终显示窗口列表而不是缩略图。要使注册表调整完成的更改生效，您需要注销并登录用户帐户。 或者，您可以重新启动 Explorer Shell。
