import SparkMD5 from 'spark-md5'

/**
 * base64 转化为 file对象
 * @param {Base64} dataUrl
 * @param {String} filename
 */
export const dataURLtoFile = (dataUrl, filename) => {
  let arr = dataUrl.split(','); let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1]); let n = bstr.length; let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}
/**
 * 计算file文件的MD5
 * @param {file} ofile
 */
export const getFilemd5sum = (ofile) => {
  return new Promise(function (resolve, reject) {
    let file = ofile
    let tmpMd5
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
    let chunkSize = 8097152 // Read in chunks of 2MB
    let chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    let spark = new SparkMD5.ArrayBuffer()
    let fileReader = new FileReader()

    fileReader.onload = function (e) {
      spark.append(e.target.result) // Append array buffer
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        tmpMd5 = spark.end()
        resolve(tmpMd5)
      }
    }

    fileReader.onerror = function () {
      reject(tmpMd5)
    }

    function loadNext () {
      let start = currentChunk * chunkSize
      let end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
    }
    loadNext()
  })
}

/**
 * canvas二值化
 * @param {canvas} canvas
 */
export const OTSUAlgorithm = (canvas) => {
  // 获取图像的灰度图像的信息
  const canvasData = getGrayScaleImage(canvas)
  if (!canvasData) {
    window.alert('图像还没有转化为灰度图像！')
    return
  }
  let mpFstdHistogram = Array.from({ length: 256 }, () => { return 0 })// 表示灰度值的分布点概率
  let mpFGrayAccu = Array.from({ length: 256 }, () => { return 0 })// 其中每一个值等于m_pFstdHistogram中从0到当前下标值的和
  let mpFGrayAve = Array.from({ length: 256 }, () => { return 0 })// 其中每一值等于m_pFstdHistogram中从0到当前指定下标值*对应的下标之和
  let mpHistogram = Array.from({ length: 256 }, () => { return 0 })// 灰度直方图
  let mpAverage = 0// 值为m_pFstdHistogram【256】中每一点的分布概率*当前下标之和
  let i, j
  let temp = 0; let fMax = 0// 定义一个临时变量和一个最大类间方差的值
  let nThresh = 0// 最优阀值
  // 获取图像的像素
  const pixels = canvasData.data
  // 下面统计图像的灰度分布信息
  for (i = 0; i < pixels.length; i += 4) {
    // 获取r的像素值，因为灰度图像，r=g=b，所以取第一个即可
    const r = pixels[i]
    mpHistogram[r]++
  }
  // 下面计算每一个灰度点在图像中出现的概率
  let size = canvasData.width * canvasData.height
  for (i = 0; i < 256; i++) {
    mpFstdHistogram[i] = mpHistogram[i] / size
  }
  // 下面开始计算m_pFGrayAccu和m_pFGrayAve和m_pAverage的值
  for (i = 0; i < 256; i++) {
    for (j = 0; j <= i; j++) {
      // 计算m_pFGaryAccu[256]
      mpFGrayAccu[i] += mpFstdHistogram[j]
      // 计算m_pFGrayAve[256]
      mpFGrayAve[i] += j * mpFstdHistogram[j]
    }
    // 计算平均值
    mpAverage += i * mpFstdHistogram[i]
  }
  // 下面开始就算OSTU的值，从0-255个值中分别计算ostu并寻找出最大值作为分割阀值
  for (i = 0; i < 256; i++) {
    temp = (mpAverage * mpFGrayAccu[i] - mpFGrayAve[i]) *
            (mpAverage * mpFGrayAccu[i] - mpFGrayAve[i]) /
            (mpFGrayAccu[i] * (1 - mpFGrayAccu[i]))
    if (temp > fMax) {
      fMax = temp
      nThresh = i
    }
  }
  // 下面执行二值化过程
  for (i = 0; i < canvasData.width; i++) {
    for (j = 0; j < canvasData.height; j++) {
      // 取得每一点的位置
      let ids = (i + j * canvasData.width) * 4
      // 取得像素的R分量的值
      let r = canvasData.data[ids]
      // 与阀值进行比较，如果小于阀值，那么将改点置为0，否则置为255
      let gray = r > nThresh ? 255 : 0
      canvasData.data[ids + 0] = gray
      canvasData.data[ids + 1] = gray
      canvasData.data[ids + 2] = gray
    }
  }
  // 显示二值化图像
  let newImage = document.getElementById('canvas').getContext('2d')
  newImage.putImageData(canvasData, 0, 0)
}

/**
 * 计算图像的灰度值,公式为：Gray = R*0.299 + G*0.587 + B*0.114
 * @param {int} rValue
 * @param {int} gValue
 * @param {int} bValue
 */
export const CalculateGrayValue = (rValue, gValue, bValue) => {
  return parseInt(rValue * 0.299 + gValue * 0.587 + bValue * 0.114)
}

/**
 * 彩色图像灰度化
 * @param {canvas} canvas
 */
export const getGrayScaleImage = (canvas) => {
  const cxt = canvas.getContext('2d') // 取得图像数据
  let canvasData = cxt.getImageData(0, 0, canvas.width, canvas.height)
  // 这个循环是取得图像的每一个点，在计算灰度后将灰度设置给原图像
  for (let x = 0; x < canvasData.width; x++) {
    for (let y = 0; y < canvasData.height; y++) {
      const idx = (x + y * canvas.width) * 4
      // The RGB values
      const r = canvasData.data[idx + 0]
      const g = canvasData.data[idx + 1]
      const b = canvasData.data[idx + 2]
      // 更新图像数据
      const gray = CalculateGrayValue(r, g, b)
      canvasData.data[idx + 0] = gray
      canvasData.data[idx + 1] = gray
      canvasData.data[idx + 2] = gray
    }
  }
  cxt.putImageData(canvasData, 0, 0)
  return canvasData
}
/**
 * 图片url转成base64
 * @param {String} url
 */
export const urlToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    var img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = url
    img.onload = function () {
      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      let base64 = canvas.toDataURL('image/jpeg', 1)
      resolve(base64)
    }
  })
}

/**
 * 图片Base64转成canvas
 * @param {base64} base64
 */
export const base64ToCanvas = (base64) => {
  return new Promise((resolve, reject) => {
    var img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = base64
    img.onload = function () {
      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas)
    }
  })
}

/**
 * 图片Base64转成BlobData
 * @param {*} base64
 */
export const base64ToBlob = (base64) => {
  let arr = base64.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  let BlobData = Blob([u8arr], {
    type: mime
  })
  return new BlobData()
}

/**
 * 旋转指定角度的图片（90度的倍数）
 * @param {string/base64} src
 * @param {int} edg
 * @param {func} callback
 */
export const rotateBase64Img = (src, edg, callback) => {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  let imgW// 图片宽度
  let imgH// 图片高度
  let size// canvas初始大小
  (edg < 0) && (edg = (edg % 360) + 360)
  const quadrant = (edg / 90) % 4 // 旋转象限
  const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 } // 裁剪坐标
  let image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = src
  image.onload = function () {
    imgW = image.width
    imgH = image.height
    size = imgW > imgH ? imgW : imgH
    canvas.width = size * 2
    canvas.height = size * 2
    switch (quadrant) {
      case 0:
        cutCoor.sx = size
        cutCoor.sy = size
        cutCoor.ex = size + imgW
        cutCoor.ey = size + imgH
        break
      case 1:
        cutCoor.sx = size - imgH
        cutCoor.sy = size
        cutCoor.ex = size
        cutCoor.ey = size + imgW
        break
      case 2:
        cutCoor.sx = size - imgW
        cutCoor.sy = size - imgH
        cutCoor.ex = size
        cutCoor.ey = size
        break
      case 3:
        cutCoor.sx = size
        cutCoor.sy = size - imgW
        cutCoor.ex = size + imgH
        cutCoor.ey = size + imgW
        break
    }
    ctx.translate(size, size)
    ctx.rotate(edg * Math.PI / 180)
    ctx.drawImage(image, 0, 0)
    let imgData = ctx.getImageData(cutCoor.sx, cutCoor.sy, cutCoor.ex, cutCoor.ey)
    if (quadrant % 2 === 0) {
      canvas.width = imgW
      canvas.height = imgH
    } else {
      canvas.width = imgH
      canvas.height = imgW
    }
    ctx.putImageData(imgData, 0, 0)
    callback(canvas.toDataURL())
  }
}

/**
 * 添加自定义图片水印
 * @param {canvas} canvas
 * @param {Object} img
 */
export const waterImgMark = (canvas, img) => {
  return new Promise((resolve, reject) => {
    // 图片水印图片的3%大小
    let rate = 0.2
    let rateCount = ((canvas.width + canvas.height) / 2) * rate
    // 同等比例缩放
    let logoWid = rateCount
    let logoHei = rateCount / (img.width / img.height)
    let ctx = canvas.getContext('2d')
    // 在指定位置绘制，这里指定距离右下角20坐标的地方，时间水印之上
    let waterMsgFont = ((canvas.width + canvas.height) / 2) * 0.03
    ctx.drawImage(img, canvas.width - logoWid - 20 - waterMsgFont, canvas.height - logoHei - 20 - waterMsgFont, logoWid, logoHei)
    resolve(canvas)
  })
}

/**
 * 添加文字水印
 * @param {canvas} canvas
 * @param {String} text
 */
export const waterTextMark = (canvas, text) => {
  return new Promise((resolve, reject) => {
    let ctx = canvas.getContext('2d')
    // 设置填充字号和字体，样式
    // 根据图片尺寸动态，动态调整水印大小
    ctx.font = ((canvas.width + canvas.height) / 2) * 0.03 + 'px serif'
    ctx.strokeStyle = '#eee'
    ctx.shadowColor = 'black'
    ctx.lineWidth = 1
    ctx.shadowBlur = 0
    // 字体颜色
    ctx.fillStyle = 'red'
    // 设置右对齐
    ctx.textAlign = 'right'
    // 在指定位置绘制文字，这里指定距离右下角20坐标的地方
    ctx.fillText(text, canvas.width - 20, canvas.height - 20)
    resolve(canvas)
  })
}

/**
 * 深copy
 * @param {Obj} source 
 */
export function deepClone (source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  for (const keys in source) {
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        targetObj[keys] = source[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepClone(source[keys])
      } else {
        targetObj[keys] = source[keys]
      }
    }
  }
  return targetObj
}