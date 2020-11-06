---
title: 使用说明
lang: zh-cn
createDate: 2020-11-6
updateDate: 2020-11-6
category: openSource
---
# 使用说明

### 简介

该组件可以实现浏览器自定义的图片列表采集

- 支持处理黑白、彩色、灰度图片
- 支持图片自定义文字水印、图片水印
- 支持自定义文件分片上传
- 支持切换视频源和分辨率（需要插件盒子支持）

### 注意：

最新版本chrome浏览器会限制网页调用本地设备，需要配置允许访问

- chrome浏览器输入 **chrome://flags/#unsafely-treat-insecure-origin-as-secure，输入需要调用设备的ip+post，如：127.0.0.1:8080。并且启用配置**
- chrome浏览器：设置>>隐私设置和安全性>>网站设置>>权限，确保有摄像头和麦克风权限

### 组件文件

```json
scanBox
├── archItem.vue  // 右侧采集项
├── archSubList.vue  // 右侧采集列表
├── captureView.vue  // 采集器视频流处理
├── file.js  // 图片处理js-提供了常用的js图片处理、文字以及图片水印功能等
├── fileUpload.js  // 文件上传处理js-提供图片分片上传和普通上传逻辑
├── imageThumbList.vue  // 右侧下方图片列表
├── imageThumbNail.vue // 右侧下方图片缩略图
├── localUpload.vue //本地上传控件
└── scanBox.vue   //采集器主界面
```

### 组件依赖说明

- "element-ui": "^2.14.0"  -组件基础框架
- "spark-md5": "^3.0.1" -文件md5计算
- "vue-cropper": "^0.5.5" -页面文件截图操作
- "v-viewer": "^1.5.1" -图片预览
- "vuedraggable": "^2.24.3" -图片列表拖拽调整

### 使用说明

```jsx
// 1 导入文件
import scanBox from './scanBox/scanBox'

// 2 组件注册
components: {
    scanBox
  },

// 3 引入标签
<scan-box ref="scanBox"
          :scanList='scanList'
          :deviceFrameSizeList="deviceFrameSizeList"
          @endScanHandler="endScanHandler"/>

// 4 方法调用，显示采集弹框
openScanBox () {
      // 初始化分辨率(三方插件支持)
     this.deviceFrameSizeList = deviceFrameSizeList || []
     this.$refs.scanBox.showWin('scan', 0, this.scanList)
}

// 5 监听采集完成返回文件列表
endScanHandler (scanImageList) {
      // 采集完成返回完整的采集信息，自己做上传处理
      console.log('endScanHandler===', scanImageList)
}

// 6 自定义文件上传以及文件处理
import { beforeUpload } from './scanBox/fileUpload'
uploadFile (scanImageList) {
      // todo 采集完成返回完整的采集信息，自己做上传处理
      // 上传
      // 移除未改变项
      let uploadScanImageList = scanImageList.filter(item => item.isChange !== false)
      // 上传接口需要的额外参数
			let expandInfo = {
        acpt_id: '99999999',
        cust_id: '99999999',
        operator_no: 10571,
        op_branch_no: 1,
        branch_no: 1
      }
			// 上传前是否添加水印
      let isWater = true
			// 水印信息
      let waterMsg = 'waterMsg'
			// 上传url
      const uploadUrl = 'https://test.com/fileUpload'
	    // 图片水印url
			let waterLogoUrl = 'https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/80.jpg'
      beforeUpload(uploadScanImageList, acptInfo, isWater, waterMsg, waterLogoUrl, uploadUrl).then(res => {
				console.log('单个采集项上传完成')
        // todo 每个采集项上传进度
      }).catch(err => {
        this.$hMessage.error(err)
      })
      console.log('全部采集项上传完成')
    },
```

### 参数说明

```html
<scan-box ref="scanBox"
          :scanList='scanList'
          :deviceFrameSizeList="deviceFrameSizeList"
          @endScanHandler="endScanHandler"/>
```

- 参数

    scanList：需要采集的图片列表

    deviceFrameSizeList：当前设备支持的分辨率

- 方法

    endScanHandler：采集结束后返回的文件列表

- 参数以及方法详细信息

```json
# 需要采集的图片列表
scanList = [{
        'archFileNo': '-1',  //采集文件编号-建议纯数字，每一项不重复
        'filePath': '',//当前采集项首页图片
        'haveScan': '0',//当前采集项是否必须采集
        'imageName': '批量扫描',//当前采集项名称
        'imageSet': '3',     //当前采集文件类型，1:黑白 2:灰度 3:彩色
        'importLocalFlag': '0', //当前采集是否可以本地导入
        'index': '0', // 当前采集项索引
				'tipInfo':'test',//当前档案采集提示信息
        'isChange': false,// 当前采集项是否发生变化
        'pageInfo': [{
					'filePath': "https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/80.jpg",
					'pageNo': 1,
				}],// 当前采集项每一页信息
        'pageNum': 9999,//当前采集项可以采集的页数
      },...]

# 支持的设备分辨率（需要三方插件）
deviceFrameSizeList = 
[
		{
        "FrameSize": ["640x480", "800x600", "1280x720", "1280x960", "1600x1200"],
        "Name": "ZLPorCamera"
    },
    {
        "FrameSize": ["640x480", "800x600", "1280x720", "1600x1200", "1920x1080","2048x1536","2592x1944","3264x2448"],
        "Name": "RXSX Video"
    }
]

# 采集结束后返回的文件列表
scanList = [{
        'archFileNo': '-1',  //采集文件编号-建议纯数字，每一项不重复
        'filePath': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',//当前采集项首页图片
        'haveScan': '0',//当前采集项是否必须采集
        'imageName': '头像',//当前采集项名称
        'imageSet': '3',     //当前采集文件类型，1:黑白 2:灰度 3:彩色
        'importLocalFlag': '0', //当前采集是否可以本地导入
        'index': '0', // 当前采集项索引
				'tipInfo':'test',//当前档案采集提示信息
        'isChange': false,// 当前采集项是否发生变化
        'pageInfo': [{
					'filePath': "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD",
					'pageNo': 1,
				},{
					filePath: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD"
					pageNo: 2
				}],// 当前采集项每一页信息
        'pageNum': 9999,//当前采集项可以采集的页数
      },...]

```