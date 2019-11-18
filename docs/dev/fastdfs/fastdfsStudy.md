# FastDFS(分布式文件系统)

## 1  什么是FastDFS

### 1.1  简介

`FastDFS`是用c语言编写的一款开源的分布式文件系统，它是由淘宝资深架构师余庆编写并开源。`FastDFS`专为互联网量身定制，充分考虑了冗余备份、负载均衡、线性扩容等机制，并注重高可用、高性能等指标，使用`FastDFS`很容易搭建一套高性能的文件服务器集群提供文件上传、下载等服务。

为什么要使用`FastDFS`呢？

已有的的`NFS`、`GFS`都是通用的分布式文件系统，通用的分布式文件系统的优点的是开发体验好，但是系统复杂性高、性能一般，而专用的分布式文件系统虽然开发体验性差，但是系统复杂性低并且性能高。

`FastDFS`非常适合存储图片等那些小文件，`FastDFS`不对文件进行分块，所以它就没有分块合并的开销，`FastDFS`网络通信采用`socket`，通信速度很快。

### 1.2  工作原理

#### 1.2.1 `FastDSF`架构

![](/image/fastdfs.jpg)

`FastDFS`架构包括 `Tracker server`和`Storag eserver`。客户端请求`Tracker server`进行文件上传、下载，通过`Tracker server`调度最终由`Storage server`完成文件上传和下载。

* Tracker 

  `Tracker Server`作用是负载均衡和调度，通过`Tracker server`在文件上传时可以根据一些策略找到`Storage server`提供文件上传服务。可以将`Tracker`称为追踪服务器或调度服务器。

  `Tracker server`更像一个管理指挥员，管理`Storage server`，协调客户机将文件上传到`Storage Server`

  `FastDFS`集群中的`Tracker server`可以有多台，`Tracker server`之间是相互平等关系同时提供服务，`Tracker server`不存在单点故障。客户端请求`racker server`采用轮询方式，如果请求的`tracker`无法提供服务则换另一个`tracker`。

* Storage

  `Storage Server`作用是文件存储，客户端上传的文件最终存储在`Storage`服务器上，`Storage server`没有实现自己的文件系统而是使用操作系统的文件系统来管理文件。可以将`storage`称为存储服务器。

  `Storage`集群采用了分组存储方式。`storage`集群由一个或多个组构成，集群存储总容量为集群中所有组的存储容量之和。一个组由一台或多台存储服务器组成，组内的`Storage server`之间是平等关系，不同组的`Storage server`之间不会相互通信，同组内的`Storage server`之间会相互连接进行文件同步，从而保证同组内每个`storage`上的文件完
  全一致的。一个组的存储容量为该组内存储服务器容量最小的那个，由此可见组内存储服务器的软硬件配置最好是一致的。

  采用分组存储方式的好处是灵活、可控性较强。比如上传文件时，可以由客户端直接指定上传到的组也可以由`tracker`进行调度选择。一个分组的存储服务器访问压力较大时，可以在该组增加存储服务器来扩充服务能力（纵向扩容）。当系统容量不足时，可以增加组来扩充存储容量（横向扩容）。

* `Storage`状态收集

  `Storage server`会连接集群中所有的`Tracker server`，定时向他们报告自己的状态，包括磁盘剩余空间、文件同步状况、文件上传下载次数等统计信息。

#### 1.2.2 文件上传流程

![fastdfs上传流程](/image/fastdfs1.jpg)

客户端上传文件后存储服务器将文件ID返回给客户端，此文件ID用于以后访问该文件的索引信息。文件索引信息包括：组名，虚拟磁盘路径，数据两级目录，文件名。

~~~properties
group1/M00/00/00/wKjRgF3PPvOAOF7HAAFl33KnvNs832.jpg
~~~

* 组名：文件上传后所在的`storage`组名称，在文件上传成功后有`storage`服务器返回，需要客户端自行保存。
* 虚拟磁盘路径：`storage`配置的虚拟路径，与磁盘选项`store_path*`对应。如果配置了`store_path0`则是`M00`，如果配置了`store_path1`则是`M01`，以此类推。
* 数据两级目录：`storage`服务器在每个虚拟磁盘路径下创建的两级目录，用于存储数据文件
* 文件名：与文件上传时不同。是由存储服务器根据特定信息生成，文件名包含：源存储服务器IP地址、文件创
  建时间戳、文件大小、随机数和文件拓展名等信息。

#### 1.2.3 文件下载流程

tracker根据请求的文件路径即文件ID 来快速定义文件。

![fastdfs下载流程](/image/fastdfs2.jpg)

比如请求下边的文件：

~~~properties
group1/M00/00/00/wKjRgF3PPvOAOF7HAAFl33KnvNs832.jpg
~~~

* 通过组名`tracker`能够很快的定位到客户端需要访问的存储服务器组是`group1`，并选择合适的存储服务器提供客户端访问。
* 存储服务器根据“文件存储虚拟磁盘路径”和“数据文件两级目录”可以很快定位到文件所在目录，并根据文件名找到
  客户端需要访问的文件。

## 2 FastDFS入门

### 2.1 FastDFS安装配置(tracker)

注：本次之安装一台tracker、storage,且都在同一台机器上、方便调试。有兴趣的可以拓展成分布式

#### 2.1.1 安装条件

* 需要一台`CentOS7`虚拟机
* 下载`FastDFS`安装包，地址：https://github.com/happyfish100/FastDFS ，本文档使用`FastDFS_v5.05.tar.gz`

#### 2.1.2 准备安装环境

* `FastDFS`是`C语言`开发，编译依赖`gcc`环境，安装 `gcc`

  ~~~cmake 
  yum -y install gcc-c++
  ~~~

* 依赖依赖`libevent`库

  ~~~cmake
  yum -y install libevent
  ~~~

* `libfastcommon`是`FastDFS`官方提供的，`libfastcommon`包含了`FastDFS`运行所需要的一些基础库。本文档使用的是`libfastcommonV1.0.7.tar.gz`,下载地址：https://github.com/happyfish100/libfastcommon/releases

  ~~~cmake
  # 将libfastcommonV1.0.7.tar.gz拷贝至/usr/local/下
  cd /usr/local
  tar -zxvf libfastcommonV1.0.7.tar.gz
  cd libfastcommon-1.0.7
  ./make.sh
  ./make.sh install
  ~~~

* **注意：`libfastcommon`安装好后会自动将库文件拷贝至`/usr/lib64`下，由于`FastDFS`程序引用`usr/lib`目录所以需要将`/usr/lib64`下的库文件拷贝至/`usr/lib`下。**

  ~~~cmake
  cp /usr/lib64/libfastcommon.so /usr/lib/libfastcommon.so
  ~~~

  

#### 2.1.3 安装FastDFS

~~~cmake
# 将FastDFS_v5.05.tar.gz拷贝至/usr/local/下
tar -zxvf FastDFS_v5.05.tar.gz

cd FastDFS

./make.sh
./make.sh install

# 安装成功将安装目录下的conf下的文件拷贝到/etc/fdfs/下。
~~~

#### 2.1.4 配置FastDFS(tracker)

安装成功后进入`/etc/fdfs`目录

~~~cmake
# 拷贝一份新的tracker配置文件：
cp tracker.conf.sample tracker.conf

# 修改tracker.conf
vi tracker.conf
# base_path=/home/yuqing/FastDFS   
# 改为：（根据个人具体情况调整）
# base_path=/home/FastDFS
# 配置http端口：
http.server_port=80

~~~

#### 2.1.5 启动Tracker

~~~cmake
# 注意控制台的打印信息
/usr/bin/fdfs_trackerd /etc/fdfs/tracker.conf restart
~~~

### 2.2 FastDFS安装配置(storage)

#### 2.2.1 安装过程

同 `Tracker`

#### 2.2.2 配置FastDFS(Storage)

安装成功后进入`/etc/fdfs`目录

~~~cmake
# 拷贝一份新的storage配置文件：
cp storage.conf.sample storage.conf

# 修改storage.conf
vi storage.conf
# group_name=group1
# base_path=/home/yuqing/FastDFS 改为：base_path=/home/FastDFS（根据个人具体情况调整）
# store_path0=/home/yuqing/FastDFS 改为：store_path0=/home/FastDFS/fdfs_storage（根据个人具体情况调整）
#如果有多个挂载磁盘则定义多个store_path，如下（根据个人具体情况调整）
#store_path1=.....
#store_path2=......
tracker_server=192.168.101.3:22122   #配置tracker服务器:IP
#如果有多个则配置多个tracker
tracker_server=192.168.101.4:22122

#配置http端口
http.server_port=80

~~~

#### 2.2.3 启动Storage

~~~cmake
# 注意控制台的打印信息
/usr/bin/fdfs_storaged /etc/fdfs/storage.conf restart
~~~

### 2.3 测试FastDFS是否安装成功

#### 2.3.1 上传图片测试

`FastDFS`安装成功可通过`/usr/bin/fdfs_test`测试上传、下载等操作。

修改`/etc/fdfs/client.conf`

`tracker_server`根据自己部署虚拟机的情况/配置 

~~~cmake
# 拷贝一份新的client配置文件：
cp client.conf.sample client.conf

# 修改配置文件
vi client.conf
# base_path=/home/fastdfs
# tracker_server=192.168.101.3:22122
~~~

使用格式：

`/usr/bin/fdfs_test `客户端配置文件地址  `upload ` 上传文件

比如将`/home`下的图片上传到`FastDFS`中：

~~~cma
/usr/bin/fdfs_test /etc/fdfs/client.conf upload /home/tomcat.png
~~~

看到如下日志：

~~~cmake
This is FastDFS client test program v5.05

Copyright (C) 2008, Happy Fish / YuQing

FastDFS may be copied only under the terms of the GNU General
Public License V3, which may be found in the FastDFS source kit.
Please visit the FastDFS Home Page http://www.csource.org/ 
for more detail.

[2019-11-18 22:56:28] DEBUG - base_path=/home/chenyn/fastdfs/FastDFS, connect_timeout=30, network_timeout=60, tracker_server_count=1, anti_steal_token=0, anti_steal_secret_key length=0, use_connection_pool=0, g_connection_pool_max_idle_time=3600s, use_storage_id=0, storage server id count: 0

tracker_query_storage_store_list_without_group: 
	server 1. group_name=, ip_addr=192.168.127.128, port=23000

group_name=group1, ip_addr=192.168.127.128, port=23000
storage_upload_by_filename
group_name=group1, remote_filename=M00/00/00/wKh_gF3SsRyAJg6iAABlnZYG9PM641.png
source ip address: 192.168.127.128
file timestamp=2019-11-18 22:56:28
file size=26013
file crc32=2517038323
example file url: http://192.168.127.128/group1/M00/00/00/wKh_gF3SsRyAJg6iAABlnZYG9PM641.png
storage_upload_slave_by_filename
group_name=group1, remote_filename=M00/00/00/wKh_gF3SsRyAJg6iAABlnZYG9PM641_big.png
source ip address: 192.168.127.128
file timestamp=2019-11-18 22:56:29
file size=26013
file crc32=2517038323
example file url: http://192.168.127.128/group1/M00/00/00/wKh_gF3SsRyAJg6iAABlnZYG9PM641_big.png
~~~

恭喜你成功了:slightly_smiling_face:~

#### 2.3.2 下载图片

~~~cmake
http://192.168.127.128/group1/M00/00/00/wKh_gF3SsRyAJg6iAABlnZYG9PM641_big.png
# 此路径就是文件的下载路径 对应storage服务器上的
/home/chenyn/fastdfs/FastDFS/storage/data/00/00/wKh_gF3SsRyAJg6iAABlnZYG9PM641_big.png文件。
# 由于现在还没有和nginx整合无法使用http下载。待新增
~~~



## 3 SpringBoot整合FastDFS实现文件上传下载测试

使用`javaApi`测试文件的上传。
`java`版本的`fastdfs-client`地址在：https://github.com/happyfish100/fastdfs-client-java，参考此工程编写测试用
例。

### 3.1 环境搭建

* 新建maven工程          

* 添加依赖

  ~~~xml
  <parent>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-starter-parent</artifactId>
          <version>2.1.9.RELEASE</version>
          <relativePath/> <!-- lookup parent from repository -->
  </parent>
  <groupId>cn.itcast.javaee</groupId>
  <artifactId>fastdfs</artifactId>
  <version>1.0‐SNAPSHOT</version>
  <dependencies>
   	   <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-web</artifactId>
          </dependency>
          <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-test</artifactId>
              <scope>test</scope>
          </dependency>
          <dependency>
              <groupId>commons-io</groupId>
              <artifactId>commons-io</artifactId>
              <version>2.4</version>
          </dependency>
          <!-- https://mvnrepository.com/artifact/net.oschina.zcx7878/fastdfs-client-java -->
          <dependency>
              <groupId>net.oschina.zcx7878</groupId>
              <artifactId>fastdfs-client-java</artifactId>
              <version>1.27.0.0</version>
          </dependency>	
  </dependencies>
  ~~~

* resources目录下新建配置文件`fastdfs-client.properties`

~~~properties
fastdfs.connect_timeout_in_seconds = 5
fastdfs.network_timeout_in_seconds = 30
fastdfs.charset = UTF‐8
fastdfs.http_anti_steal_token = false
fastdfs.http_secret_key = FastDFS1234567890
fastdfs.http_tracker_http_port = 80
# 根据实际情况调整
fastdfs.tracker_servers = 192.168.101.64:22122
~~~

### 3.2 文件上传

~~~java
public class TestFastDfsUpload {
    /**
     * entry point
     *
     * @param args comand arguments
     *             <ul><li>args[0]: config filename</li></ul>
     *             <ul><li>args[1]: local filename to upload</li></ul>
     */
    public static void main(String args[]) {
        // 也可以指定配置文件测试
        /*if (args.length < 2) {
            System.out.println("Error: Must have 2 parameters, one is config filename, "
                    + "the other is the local filename to upload");
            return;
        }*/

        System.out.println("java.version=" + System.getProperty("java.version"));

       /* String conf_filename = args[0];
        String local_filename = args[1];*/

        try {
            // 加载配置文件
            //ClientGlobal.init(conf_filename);
            ClientGlobal.initByProperties("fastdfs-client.properties");
            System.out.println("network_timeout=" + ClientGlobal.g_network_timeout + "ms");
            System.out.println("charset=" + ClientGlobal.g_charset);

            //创建tracker客户端
            TrackerClient tracker = new TrackerClient();
            TrackerServer trackerServer = tracker.getConnection();
            StorageServer storageServer = null;

            //定义一个storage客户端
            StorageClient1 client = new StorageClient1(trackerServer, storageServer);

            //文件元信息
            NameValuePair[] metaList = new NameValuePair[1];
            metaList[0] = new NameValuePair("fileName", "C:\\Users\\ching\\Desktop\\cat.png");

            //执行上传
            String fileId = client.upload_file1("C:\\Users\\ching\\Desktop\\cat.png", "png", metaList);
            System.out.println("upload success. file id is: " + fileId);

            //文件下载
            /*int i = 0;
            while (i++ < 10) {
                byte[] result = client.download_file1(fileId);
                System.out.println(i + ", download result is: " + result.length);
            }*/

            //关闭tracker服务
            trackerServer.close();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
~~~

