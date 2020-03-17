// pages/canvas/canvas.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      'nickName':'麦兜兜'
    }, 
    imgUrl:'../../images',
    xcxEwm: '../../images/ewm.png',
    poster: '', //生成的分享图
    width: 200,
    height: 345,
    imgHeight: 285,
    pdWidth: 7,
    pdHeight: 10,
    ewmLeft: 153,
    ewmTop: 295,
    ewmWidth: 40,
    pt1: 305,
    pt2: 320,
    pt3: 334,
    pixelRatio: 1, //像素密度
   
    // 卡片模块：
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //切换栏的滚动条位置
    cardImgSrc: '',  //存储卡片图
    //卡片数组
    cardArr: [
      {
        id: '01',
        img: '../../images/card-tp01.jpg'
      }, {
        id: '02',
        img: '../../images/card-tp02.jpg'
      }, {
        id: '03',
        img: '../../images/card-tp03.jpg'
      }, {
        id: '04',
        img: '../../images/card-tp04.jpg'
      }, {
        id: '05',
        img: '../../images/card-tp05.jpg'
      }, {
        id: '06',
        img: '../../images/card-tp06.jpg'
      },
    ],
  },

  //canvas画图
  drawCanvas(e) {
    let that = this;
    /* 创建 canvas 画布 */
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.drawImage(that.data.cardImgSrc, 0, 0, that.data.width, that.data.imgHeight)
    ctx.rect(0, that.data.imgHeight, that.data.width, that.data.height - that.data.imgHeight)
    ctx.setStrokeStyle('#ffffff')
    ctx.setFillStyle('#ffffff')
    ctx.fill()
    ctx.drawImage(that.data.xcxEwm, that.data.ewmLeft, that.data.ewmTop, that.data.ewmWidth, that.data.ewmWidth)
    ctx.setFillStyle('#333')
    ctx.setFontSize(12)
    ctx.setTextAlign('left')
    ctx.fillText('我是' + that.data.userInfo['nickName'] + '', that.data.pdWidth, that.data.pt1)
    ctx.setFontSize(11)
    ctx.fillText('邀请你和我一起旅行！', that.data.pdWidth, that.data.pt2)
    ctx.setFillStyle('#999')
    ctx.setFontSize(8)
    ctx.fillText('长按二维码，开启你的旅行之路', that.data.pdWidth, that.data.pt3)

    /* 绘制 */
    ctx.stroke()
    ctx.draw()
  },

  //将绘制后的canvas保存为图片
  canvasToPath() {
    let that = this;
    that.drawCanvas();
    //加个定时器，防止图为黑屏
    setTimeout(()=>{
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: that.data.width,
        height: that.data.height,
        destWidth: that.data.width * that.data.pixelRatio,     //乘以像素比，防止模糊
        destHeight: that.data.height * that.data.pixelRatio,
        canvasId: 'myCanvas',
        success(res) {
          console.log(res.tempFilePath)
          that.setData({
            poster: res.tempFilePath,
          })
          wx.nextTick(() => {
            that.saveCanvasImage();
          })
        }
      })
    }, .1e3);
  },

  // 保存图片方法
  saveCanvasImage() {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.poster,
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '保存成功'
        });
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

  // 点击保存图片到相册（授权）
  saveImageToPhotos() {
    let that = this;
    // 相册授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.canvasToPath();
            },
            // 拒绝授权时，则进入手机设置页面，可进行授权设置
            fail() {
              console.log('拒绝授权');
              wx.showModal({
                title:'授权失败',
                content:'请允许”保存图片到相册“后，才可以把分享图保存到手机相册哦~',
                showCancel:false,
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (ret) => {
                        if(ret.authSetting['scope.writePhotosAlbum']){
                          that.canvasToPath();
                        }else{
                          //返回-回调
                          if (that.isCancleCallback){
                            that.isCancleCallback(ret);
                           }
                        }
                       }
                    })
                 }
                }
              })
            }
          })
        } else {
          // 已授权则直接进行保存图片
          that.canvasToPath();
        }
      },
      fail(res) {
        console.log(res);
      }
    })
  },

  // 点击切换卡片
  swichNav(e) {
    var that = this,
      cur = e.target.dataset.current,
      src = e.target.dataset.src;
    if (that.data.currentTaB == cur) {
      return false;
    } else {
      that.setData({
        currentTab: cur
      })
    }
    that.setData({
      cardImgSrc: src
    })
    that.checkCor();
  },

  //判断当前滚动超过一屏时
  checkCor(e) {
    var that = this;
    if (that.data.currentTab > 2) {
      that.setData({
        scrollLeft: 300
      })
    } else {
      that.setData({
        scrollLeft: 0
      })
    }
  },

  //卡片默认显示第一张
  defaultFirstShow(e) {
    let that = this,
      defaultCardImgSrc = that.data.cardArr[0].img;
    that.setData({
      cardImgSrc: defaultCardImgSrc
    })
  },

  //获取像素比
  getPix(){
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          pixelRatio: res.pixelRatio   
        })
      }
    })
  },

  //标签选择:用于得到距离的，方便canvas那拿测量距离
  querySelect(e) {
    let that = this;
    //canvas宽高
    var query = wx.createSelectorQuery();
    query.select('#my-canvas').boundingClientRect(function (rect) {
      that.setData({
        width: rect.width,
        height: rect.height
      })
    }).exec();

    query.select('#card-img').boundingClientRect(function (rect) {
      that.setData({
        imgHeight: rect.height
      })
    }).exec();

    query.select('.pd').boundingClientRect(function (rect) {
      that.setData({
        pdWidth: rect.width,
        pdHeight: rect.height
      })
    }).exec();

    query.select('.ewm-leftTop').boundingClientRect(function (rect) {
      that.setData({
        ewmLeft: rect.width,
        ewmTop: rect.height
      })
    }).exec();

    query.select('#ewm-img').boundingClientRect(function (rect) {
      that.setData({
        ewmWidth: rect.width
      })
    }).exec();

    query.select('.pt1').boundingClientRect(function (rect) {
      that.setData({
        pt1: rect.height
      })
    }).exec();
    query.select('.pt2').boundingClientRect(function (rect) {
      that.setData({
        pt2: rect.height
      })
    }).exec();
    query.select('.pt3').boundingClientRect(function (rect) {
      that.setData({
        pt3: rect.height
      })
    }).exec();
  },

  //初始化
  init(){
    let that = this;
    that.getPix();
    that.defaultFirstShow();
    that.querySelect();
    that.drawCanvas();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.init();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {

  }

})