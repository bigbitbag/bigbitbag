### Linux用户配置命令

刚开始给系统配置root的密码：`sudo passwd root`

切换到root：`su`

 添加新用户：`sudo useradd -m username -s /bin/bash`

-   -m 是创建一个用户目录，-s 是指定解析器

配置新用户的密码：`sudo passwd username`

查看新增的用户：`cat /etc/passwd`

删除用户：`sudo userdel -r username`，第一次没加`-r`，就不用第二次`userdel`，直接`rm -r username`

给新配置的用户添加`sudo`权限：`sudo vim /etc/sudoers`，在root下面加一条`username ALL=(ALL:ALL) ALL`

光标跳转：`ctrl + A`回到开头，`ctrl + E`回到结尾。

每次切换用户是进行了压栈操作，用完要`exit` 

导出历史操作命令：`history | tail -30 > filename.txt`

-   可以指定输出后30行

导出历史操作命令：`history > filename.txt`

-   全部导出

### 固定IP配置

打开网络设置，切换到IPV4，改为手动，填入ip地址，掩码填`255.255.255.0` ，网关和dns填一样的。

### 目录和文件查看

列出隐藏文件：`ls -a`

列出文件的详细信息：`ls -al`

-   第一列的`drwxr-xrw-`代表文件或文件夹的权限。第一组rwx代表文件创建者的权限；第二组表示同组用户的权限；第三组表示其他用户的权限。

-   目录需要有可执行权限才可以进入。

Linux不以文件后缀区分文件。

设备文件在`/dev`目录下。

-   c 表示字符设备  - -  一次只能交换一个字节
-   b 表示块设备 - - 以块为单位交换数据
-   l 表示软链接文件 - - 相当于Windows下的快捷方式
    -   用命令`ln -s file1 file2`可以将file1文件创建一个软链接命名为file2，权限是以l开头。

`date`命令可以查看当前时间。

`ls --color=never`表示输出没有彩色，`ls --color=auto`表示自动，`ls --color=always`表示始终有颜色。

帮助文档，打开命令的帮助：`man ls`

切换到上一次目录：`cd -`

不想继续执行某个命令：`ctrl + c`

搜索历史使用的某个命令：`ctrl + r`

文件复制操作：`cp file1 file2`，可以将file1拷贝到file2，可以是任意路径，可以加`-i`参数提示是否覆盖。`cp -f `代表强制覆盖，默认就是这个模式。复制文件夹的时候要加`-r`.

以树形结构显示文件结构：`tree -h`，h表示人类可读的方式。

权限：r是4，w是2，x是1.

-   文字改权限：`chmod [u,g,o,a]`

    -   u表示“用户user”，即文件或目录的所有者

    -   g表示”同组group用户“，即与文件所有者有相同组ID的所有用户。

    -   o表示”其他other用户“。

    -   a表示”所有all用户“。他是系统的默认值。即`chmod +x 1.c`表示所有人都有可执行权限。

-   数字设定法：`chmod 666 file`，表示设置为`-rw-rw-rw-`

设置快捷键：`alias`，例如`alias ll='ls -lh'`

文件查找：`find `起始目录 查找条件 操作(文件名字）

-   可以加`-a`表示与，例如`find . -name "file" -a -type d`

-   a表示同时满足前后的条件，d表示文件夹。f表示文件
-   按用户名查找：`find . -user root`
-   查找空文件或者空文件夹：`find . -empty`
-   按权限查找：`find . -perm 600`
-   按文件大小查找：`find . -size 1`，表示查找小于一个block的文件，可以跟c，k，等
-   根据时间查找
    -   `- amin n`，表示n分钟以前被访问过的所有文件。（+表示n分钟以前，-表示n分钟以内，+和-都不能省略），例如`fine . -amin +5`表示5分钟以前被访问过的文件
    -   `-cmin n`，表示n分钟以前文件状态被修改过的所有文件。
    -   `-mmin n`查找n分钟以前文件内容被修改过的所有文件。
    -   `-atime n`查找n天以前被访问过的所有文件。
    -   `-mtime n`查找n天以前被修改过的文件。

组合操作

-   `find . -name file1 | xargs ls -l`，xargs表示每次输出结果都传递到后面。` | `是管道。
-   `find . -name file1 -exec ls -l {} \;`，相当于上面的管道输出，后面的{} \;必须带着，表示把前面find的结果传递到{}里面。管道符后面不能跟短命令，如`ll`，必须是完整命令。
-   查找并cp：`find . -type f -exec cp {} ./dir3 \;`，表示把所有文件cp到dir3.

查看显示统计空间大小

-   `df -h`，可以查看磁盘总的空间大小。
-   `du [选项] [文件名]`，显示每个目录的磁盘使用空间
    -   `du -h --max-depth=1`，h表示人类可读，max-depth表示最大遍历深度
    -   `du -ah`，表示把文件也一并统计输出

查看文件内容

-   命令：`cat [选项] [文件]`
-   `-b`，对非空输出行编号
-   `-E`，在每行结束处显示$
-   `-n`，对输出的所有行编号
-   `-s`，不输出多行空行

重定向操作

-   `>`，重定向标准输出，`echo hello > file1`，默认带换行，如果不想带换行可以写成`echo -n hello`
-   `>>`，追加输出
-   echo后面不加东西默认输出一个空行
-   `2>`错误重定向
-   `&>`错误和信息重定向
-   `<`重定向输入，`cat > file2 < file1`，把file1的内容输入到file2

创建空文件的四种方式

-   `echo > a.txt`， 会有一个字节
-   `touch b.txt`
-   `cat > c.txt`按`ctrl + c`组合键退出，或者`ctrl + d`
-   `vi d.txt`进去之后`:wq`退出

查看文件

-   `head -n 5 file`可以查看文件的前五行，也可以写成`head -5 file`
-   `tail -n 5 file`，看尾部的几行

对文件里面的字符串进行排序：`sort file`

查看文件类型：`file filename`

报告或删除文件中重复的行

-   `uniq`文件名，只有重复的内容在一起才可以去重，可以使用`sort filename | uniq ` 进行全部去重
-   `-c` 在输出行前面加上每行在输出文件中出现的次数
-   `-d` 仅显示重复行
-   `-u` 仅显示不重复的行

统计指定文件中的字节数、字数、行数

-   `wc` 文件名，结果分别是：行数，字数，字节数
-   `-c` 统计字节数
-   `-l` 统计行数
-   `-m` 统计字符数。这个标志不能与`-c` 标志一起用
-   `-w` 统计字数。一个字被定为为由空白、跳格或换行字符分割的字符串
-   常用来统计文件数，`ls | wc -l`

vim里面查看文件的十六进制格式

-   `:%!xxd`

汉字编码转换

-   `iconv -f utf-8 -t gb2312 hanzi>hanzi1`
-   `-f` ，`--from-code=名称`，原始文本编码
-   `-t`，`–-to-code=名称`，输出编码

搜索文件内容 grep

-   `grep [选项] [查找模式] [filename1, filename2...]`
-   常用的一些参数
-   `-F` 每个模式作为固定的字符串对待
-   `-c` 只显示匹配行的数量
-   `-i` 比较式不区分大小写
-   `-n` 在输出前加上匹配串所在的行号
-   grep过滤器查找指定的字符模式的文件，并显示含有此模式的所有行。被寻找的模式成为正则表达式。
-   常见的一些正则表达式
-   `^` 以什么开头，例如`ls -l | grep ^d` 显示当前目录下的所有子目录的详细信息
-   `$` 以什么结尾，例如`ls -l | grep c$` 显示当前目录下的所有以c结尾的文件

Linux下的所有配置文件都在 /etc 下面，相当于Windows里面的注册表。

压缩解压

-   压缩算法：只能压缩单个文件
-   打包：`tar cf`只打包，加参数 v 可以显示打包过程
-   压缩：`tar cfz`是打包并压缩
-   解压：`tar xf`是解压
-   另一种压缩：gzip，只能压缩文件，`gzip filename`，后缀会自动变成 `.gz`，解压用 `gzip -d`，可加参数 v 显示过程
-   另一种压缩算法：bzip，也只能压缩文件，`bzip2 -v filename`，加 -v 是为了显示过程压缩比例；解压用`bzip2 -d filename`

scp命令 - 传文件到服务器

-   `scp filename user@ip:~`，filename是要传递的文件名，user是服务器用户名，ip是服务器ip，冒号后面是服务器路径
-   `scp user@ip:~/path/filename .`，服务器的文件路径放在前面，最后加本机的路径，示例用了 . 表示当前目录，该命令可以把文件从服务器传递到本地

### vim

安装vim：`sudo apt install vim`

`i`，光标位置插入；`I`，光标所在行首插入；`a`，光标的下一个位置插入；`A`，到行末。

禁止按`ctrl + s`，会冻结窗口，可以按`ctrl + q`解锁。

可以配置一下vim的配置文件，放在~目录下，文件名是`.vimrc`

```shell
set nu
set cursorline
set hlsearch
```

常用命令操作

-   `x`，删除光标处的字符
-   `dd`，删除光标所在行
-   `3dd`，删除光标所在行及以下共3行
-   `d$`，删除光标到行尾的文本，常用于删除注释 语句（D）
-   `yy`，复制光标所在的整行
-   `3yy`，从光标开始往下复制3行
-   `p`，将复制后的文本粘贴到光标处
-   `u`，撤销上次操作

光标移动

-   `^`，光标移动到行首
-   `$`，光标移动到行尾
-   `ctrl + d`，向下翻半页
-   `ctrl + f`，向下翻一页
-   `ctrl + u`，向上翻半页
-   `ctrl + b`，向上翻一页
-   `gg`，光标定位到文件头
-   `G`，光标定位到文件尾
-   `H`，光标定位到当前页首
-   `L`，光标定位到当前页的最后一行的行首
-   `w`，光标往后移动一个字
-   `b`，光标往前移动一个字
-   `[n]+`，光标向后移动n行，n表示一个整数，10+
-   `:100`，可以快速到第100行

查找与替换

-   `/[str]`，查找字符串str，回车以后会显示找到的所有字符串，按 n 可以移动到下一个找到的字符串，按 N 可以移动到上一个找到的字符串。

-   部分替换：`:s/[src]/[dst]`，/i 忽略大小写，/g 全部匹配，eg：`:s/hello/world/ig`，替换一行。`:3,6 s/[src]/[dst]/ig`，在3-6行查找，eg：`:3,6 s/hello/world`
-   全部替换：`:%s/[src]/[dst]/g`，将文档中的所有src替换为dst，`:%s/^ //g`，将文档每一行的行首的空格去掉

块操作

-   `v`，可视化块选择状态，选中块之后，可以对块进行删除，复制，剪切
-   `ctrl + v`，竖向选择模式，主要用于批量注释代码，输入步骤如下
    1.   首先按 `ctrl + v`，竖向选中要注释的行
    2.   输入`I`，是大写的`I`，然后输入`//`
    3.   再输入ecs，就会看到选中的行被注释了

其他命令

-   `:%!xxd`，十六进制模式，用`:%!xxd -r`可以退出十六进制模式
-   `:new filename`，可以在vim里面打开一个文件，窗口是上下两个显示，`:vnew flename`，打开一个文件左右显示
-   `ctrl + w + w`，可以在不同文件之间切换
-   `:sp`，可以把当前文件切成上下两个；`:vsp`分成左右两个
-   在命令模式中输入`gg=G`可以自动对齐，可以通过`gg=10gg`，只对齐第一行到第十行。

-   `vimdiff file1 file2`，可以对比两个文件的差异
-   `sed -i "s/old/new/g" *.c`，可以替换所有的old为new

### gcc / g++ 编译器

使用gcc编译程序的过程是预处理->编译->汇编->链接。期间所使用的工具依次是预处理器，编译器，汇编器as，链接器ld。

-   预处理：`gcc -E main.c -o main.i`，预处理器将对源文件中的宏进行展开
-   编译：`gcc -S test.i -o test.s`，gcc将c文件编译成汇编文件
-   汇编：`as test.s -o test.o`，as将汇编文件编译成机器码，可以用`nm test.o`查看地址未确定的函数，可以用`gcc -c main.c`将`main.c`文件编译成`main.o`
-   链接：`gcc test.o -o test`，ld将目标文件和外部符号进行链接，得到一个可执行二进制文件，使用ld命令可以调用静态链接器，`ld test.o [其他系统库文件] -o test`

动态库和静态库

[![1714454989341.png](D:\aa\assets\wHyx9K6L.png)](https://img2.imgtp.com/2024/04/30/wHyx9K6L.png)

-   编译成功的可执行文件，可以使用`ldd a.out`查看文件依赖哪些动态库。
-   动态库和静态库的区别
-   动态库编译时，动态库不会被copy到最终的可执行文件中，执行时，二进制和动态库都会被加载到进程地址空间中，动态库方便更新
-   静态库编译时，静态库会被copy到最终的可执行文件中，最终二进制比较臃肿，执行时不依赖静态库是否存在，方便部署

创建静态库

-   `gcc -c file.c`，编译file.c源文件生成file.o目标文件
-   `ar crsv libadd.a add.o`，对目标文件`*.o`进行归档，生成`lib*.a`

创建动态库

-   `gcc -fPIC -Wall -c add.c`，编译成目标文件
-   `gcc -shared add.o -o libadd.so`，编译成so，也可以写成`gcc -shared -o libadd.so file1.o file2.o file3.o ...`
-   `gcc -o main main.c -ladd`

编译优化选项

-   一般用 `-O1`
-   调试程序去掉编译优化选项

gdb使用

-   `gcc -o filename -Wall filename.c -g`，编译一定要加`-g`
-   `l`，显示代码（list）
-   `b 4`，在第四行打断点
-   `r`，运行（run）
-   `n`，下一步不进入函数
-   `s`，表示单步进入函数
-   `p i`，打印变量i
-   `c`，运行到最后
-   `q`，退出ds

**gdb有点难懂啊，没学明白。之后回来重新学一次！！！**

PS1修改

-   `vim ~/.bashrc`
-   `export PS1="\[\033]2;\h:\u\w\007\033[32;1m\]\u@\033[35;1m\t\033[0m\[\033[34;1m\]\w\[\033[0m\]\[\e[31;1m\] # \[\e[0m\]"`
-   `source .bashrc` 

gdb总结

-   条件断点：`b 行号 if i==3`
-   临时断点：`tb 行号`
-   跳出子函数：`finish`
-   调用堆栈：`bt`
-   内存：`x /20xb p`
-   gdb调试core文件：1. `gcc -g main.c`重新编译；2. `./a.out`再次运行；3. `gdb a.out core`：知道在崩溃哪一行

### MakeFile

```makefile
main:main.o func.o
	gcc -o main main.o func.o
main.o:main.c
	gcc -c main.c
func.o:func.c
	gcc -c func.c
```

makefile可以定义变量，用`:=`赋值，在调用的时候，需要使用$()来引用变量。

作用：批量编译，增量编译，提高调试效率。

预定义变量

-   `CC`，c编译器，`$(CC) -E`
-   `CFLAGS`，c编译器选项

**难！！！**

### 无密钥登录

生成密钥：`ssh-keygen`，一个是公钥`id_rsa.pub`，一个是私钥`id_rsa`

生成的密钥在`~/.ssh/`目录下。

将公钥复制到远程机器中：`ssh-copy-id -i ~/.ssh/id_rsa.pub username@ip`

添加环境变量：`PATH=$PATH:~/.local/bin`
